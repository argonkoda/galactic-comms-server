import EventEmitter from 'node:events';
import {webcrypto as crypto} from 'node:crypto';
import {Server} from 'socket.io';
import WebSocket from 'ws';
import WebRTC from 'webRTC';

const salt = "THE SaltIeST oF SaLtIes";

function validateHexString(hex) {
  console.log("Validating HEx String: ", hex);
  return hex && typeof hex === "string" && hex.length >= 2 && hex.length % 2 === 0 && hex.match(/^[0-9a-f]+$/i);
}

function hexToUint8Array(hex) {
  return new Uint8Array(hex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
}




const Level = {
  Info: "INFO",
  Warn: "WARN",
  Error: "ERROR",
  Fatal: "FATAL",
}

let server = null;

export const log = new EventEmitter();

/**
 * @type {((level: typeof Level[keyof Level], ...args: any[]) => boolean) & {
 *  [T in keyof Level]: (...args: any[]) => boolean
 * }}
 */
// @ts-ignore
const Log = (level, ...args) => log.emit('log', level, Date.now(), ...args);

for (const [key, level] of Object.entries(Level)) Log[key] = (...args) => Log(level, ...args);

export async function start(options) {
  if (server) throw new Error("Server already running.");

  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8');

  /**
   * This section generates the encryption keys based on the password you provide.
   */

  const passwordDK = await crypto.subtle.importKey("raw", encoder.encode(options.password), { name: "PBKDF2" }, false, ["deriveKey"])

  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: encoder.encode(salt), iterations: 1000, hash: "SHA-256" }, passwordDK, {
    name: "AES-CBC",
    length: 256,
  }, false, ["encrypt", "decrypt"]);

  /*
  The socket.io server that the client apps will connect to.
  This is the part of the app that is exposed to the internet.
  */
 /**
  * @type {import('socket.io').Server<import('socket.io/dist/typed-events').DefaultEventsMap, import('socket.io/dist/typed-events').DefaultEventsMap, import('socket.io/dist/typed-events').DefaultEventsMap, {steamId: bigint | undefined, lastSignal: Map<bigint, number>}>}
  */
  const io = new Server({ cors: {} });

  // This is the list that stores the clients connected with the app.
  /**
   * @type {Map<bigint, import("socket.io").Socket>}
   */
  const players = new Map();

  // This is the list of allowed steam ids.
  let whitelist = options.whitelist;

  /*
  The local websocket connection to the game server.
  This is purely internal and is just a client for the
  server hosted by the game.
  This is the channel that is used by the game to update the
  quality information of the players.
  */
  let retryAttempts = 0;
  let ws;
  let timeout = null;
  function resetTimeout() {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(() => {
      Log.Error("Connection to Game Server timed out.")
      ws?.close(1002, "Connection error.");
      ws = null;
      connectToGameServer();
    }, 30000);
  }
  function connectToGameServer() {
    if (retryAttempts > 3) return stop("Connection to Game Server failed. Retry attempts exhausted. Stopping.");
    if (retryAttempts >= 1) Log.Info(`Retrying connection to Game Server (${retryAttempts} / 3)`);
    retryAttempts ++;
    resetTimeout();
    ws = new WebSocket(`ws://${options.pluginHostname + ":" + options.pluginPort /*Default: 3456*/}/`);
    ws.binaryType = "arraybuffer";
  
    ws.on('connected', () => {
      resetTimeout();
      Log.Info("Connected to the game server");
      retryAttempts = 0;
    });
    ws.on('error', error => {
      Log.Error("WebSocket Error", error);
      ws.close(1002, "Connection error.");
      ws = null;
      connectToGameServer();
    });
    ws.on('wsClientError', (error) => {
      stop("Connection to game server failed.", error)
    });
  
    // Handle messages from the game server.
    ws.on('message', (data) => {
      // @ts-ignore Ignore TS inferring wrong buffer type
      const dv = new DataView(data);
      if (dv.byteLength) {
        resetTimeout();
        const messageId = String.fromCharCode(dv.getUint16(0, true));
        switch (messageId) {
          // Handle quality packets.
          case 'Q': {
            const fromId = dv.getBigUint64(8, true);
            const toId = dv.getBigUint64(16, true);
            const quality = dv.getFloat32(24, true);
            const toSocket = players.get(toId);
  
            if (toSocket) {
              toSocket.data.lastSignal.set(fromId, quality);
            }
            break;
          }
          default: {
            Log.Warn(`Received unknown message type '${messageId}'.`)
          }
        }
      }
    })
  }
  connectToGameServer();
  

  // The heartbeat loop that updates the clients with their quality information.
  const heartbeat = setInterval(() => {
    for (let [toId, toSocket] of players) {
      for (let [fromId, quality] of toSocket.data.lastSignal) toSocket.emit('quality-update', fromId.toString(), quality);
    }
  }, 1000 / 30);

  /*
  This is the logic used for validating the steam IDs ans password encryption.
  If this passes then the client connects, otherwise they are 
  rejected.
  
  */
  io.use(async (socket, next) => {
    try {
      const iv = socket.handshake.auth.iv;
      const token = socket.handshake.auth.token;
      const steamIdParam = socket.handshake.query.steamid;
      if (Array.isArray(steamIdParam)) {
        Log.Warn("Received request with invalid steam id parameter. Only one can be provided.");
        throw new Error("Invalid steam id parameter");
      }
      const steamId = BigInt(steamIdParam);
      socket.data.steamId = steamId;
      if (!validateHexString(iv) || !validateHexString(token)) throw new Error("Malformed authentication.");
      try {
        const data = JSON.parse(decoder.decode(await crypto.subtle.decrypt({ name: "AES-CBC", iv: hexToUint8Array(iv) }, key, hexToUint8Array(token))));
        if (!data.padding) {
          Log.Warn("AUTH FAILED: Recieved malformed data from decrypted auth token.");
          throw new Error();
        }
        if (!data.steamId) {
          Log.Warn("AUTH FAILED: Token was missing identity information.");
          throw new Error();
        }
        if (data.steamId !== steamId.toString()) {
          Log.Warn("AUTH FAILED: Auth token identity mismatch.");
          throw new Error();
        }
        if (players.has(data.steamId)) {
          Log.Warn("AUTH FAILED: Recieved token for a steam ID already connected to server. This likely indicates an attempted replay attack.");
          throw new Error();
        }
        if (Math.abs(new Date(data.timestamp).getTime() - Date.now()) > 20 * 1000) {
          Log.Warn("AUTH FAILED: Auth token was old. This may indicate an attempted replay attack or one of the clients' clocks is out by more than 20 seconds.");
          throw new Error();
        }
      } catch (error) {
        Log.Warn("AUTH FAILED: Rejecting client.");
        throw new Error("Invalid authentication.");
      }

      if (!whitelist.includes(socket.data.steamId.toString())) throw new Error("Server is whitelisted.");
      if (players.has(steamId)) throw new Error("User already connected.");
      next();
    } catch (err) {
      if (err instanceof SyntaxError) err = new Error("Invalid Steam ID");
      next(err);
    }
  })

  // Handle successfully connected clients
  io.on('connection', socket => {
    Log.Info(`Connection from ${socket.data.steamId} ${typeof socket.data.steamId}`);
    players.set(socket.data.steamId, socket);
    socket.data.lastSignal = new Map();
    socket.on('disconnect', () => {
      players.delete(socket.data.steamId);
      Log.Info(`Player ${socket.data.steamId} disconnected.`);
    })
  })

  /*
  Initialises the channels needed for the WebRTC handshakes.
  This only mediates two clients connecting. Once they are connected 
  the voice data is shared directly between the clients peer-to-peer.
  */
  // @ts-ignore
  WebRTC({ io, createRoomsOnNewId: true });

  // This starts the server on port 3000.
  io.listen(options.port);

  Log.Info(`Server Up and Running on port ${options.port}`)

  function stop(reason = null, ...args) {
    if (reason) Log.Fatal(reason, ...args);
    return Promise.all([
      clearTimeout(timeout),
      new Promise((resolve, reject) => {
        players.forEach((player) => player.disconnect());
        io.close((err) => {
          if (err) {
            Log.Error(err);
          } else {
            Log.Info("Closed all socket.io connections.")
          }
          resolve();
        })
      }),
      ws?.close(1000, reason ?? "Voice Server Closing"),
      clearInterval(heartbeat)
    ]).then(() => server = null);
  }


  server = {
    stop
  }
}

export async function stop() {
  if (!server) throw new Error("Server not running.");
  await server.stop();
}

export function isRunning() {
  return !!server;
}