<script>
  import { tick } from "svelte";

  import Field from "./lib/components/Field.svelte";
  import WhitelistEditor from "./lib/components/WhitelistEditor.svelte";


  const log = server.log;
  let messages = [];

  let running = false;

  async function updateRunning() {
    running = await server.isRunning();
  }

  /**
   * @type {HTMLDivElement | null}
   */
  let consoleElement = null;

  function scrollConsole() {
    const scrollBefore = consoleElement?.scrollTop ?? 0;
    tick().then(() => {
      if (consoleElement) {
        console.log(scrollBefore, consoleElement.offsetHeight, consoleElement.scrollHeight)
        if (scrollBefore + consoleElement.offsetHeight > (consoleElement.scrollHeight - 50)) {
          console.log("scrolling");
          consoleElement.scrollTop = consoleElement.scrollHeight - consoleElement.clientHeight;
        }
      }
    })
  }

  $: if ($log) {
    if ($log[0] === "FATAL") running = false;
    messages.push($log);
    messages = messages;
    scrollConsole();
  }

  let options = JSON.parse(localStorage.getItem('options') ?? JSON.stringify({
    pluginHostname: "localhost",
    pluginPort: "3456",
    port: "3000",
    password: "",
    whitelist: []
  }));

  $: localStorage.setItem("options", JSON.stringify(options));

  updateRunning();

</script>

<main>
  <h1>Console</h1>
  <div class="console" bind:this={consoleElement}>
    {#each messages as [level, timestamp, ...args]}
      <div class="message {level}">
        <span class="level">{level}</span>
        <span class="timestamp">{new Date(timestamp).toLocaleString([...navigator.languages], {
          dateStyle: "short",
          timeStyle: "medium"
        })}</span>
        <div class="message-contents">
          {#each args as arg}
            <p>
              {arg}
            </p>
          {/each}
        </div>
      </div>
    {/each}
  </div>
  <h1>Settings</h1>
  <aside class="settings">
    <div class="flex row start">
      <button disabled={running} on:click={async () => {await server.start(options); await updateRunning();}}>Start</button>
      <button disabled={!running} on:click={async () => {await server.stop(); await updateRunning();}}>Stop</button>
    </div>
      <Field disabled={running} type="text" icon="dns" placeholder="Game Server Hostname" bind:value={options.pluginHostname}>
        <p>The hostname of the game server. If it's on the same machine, use <code>localhost</code></p>
      </Field>
      <Field disabled={running} type="text" icon="electrical_services" placeholder="Plugin Port" bind:value={options.pluginPort}>
        <p>The port the plugin is configured to use. The default 3456 should work for everyone.</p>
      </Field>
      <Field disabled={running} type="text" icon="settings_input_component" placeholder="Voice Port" bind:value={options.port}>
        <p>The port to run the voice server on. Make sure this port is free and open for people to connect to.</p>
      </Field>
      <Field disabled={running} type="password" icon="lock" placeholder="Password" bind:value={options.password}>
        <p>The password used to encrypt network traffic. This must be set.</p>
      </Field>
      <WhitelistEditor disabled={running} bind:whitelist={options.whitelist} />
  </aside>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto 1fr;
    grid-auto-flow: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  h1 {
    padding: 1rem;
    font-size: 1rem;
    border-bottom: 1px solid var(--color-bg-300);
  }

  .console {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  .message {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 0.5rem;
    padding: 0.5rem;
    border: 1px solid currentColor;
  }

  .message.INFO {
    color: rgb(0, 182, 228);
    background-color: #2090da22;
  }

  .message.WARN {
    color: rgb(185, 133, 0);
    background-color: #daa52022;
  }

  .message.ERROR {
    color: rgb(192, 0, 0);
    background-color: #da202022;
  }

  .message.FATAL {
    color: white;
    background-color: #ff0000;
    font-weight: 700;
  }

  .level {
    width: 5rem;
    text-align: center;
  }

  .timestamp {
    width: 10rem;
    text-align: right;
  }

  .message-contents {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 0.5rem;
    flex-grow: 1;
  }

  .settings {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    border-left: 1px solid var(--color-bg-300);
    padding: 1rem;
    gap: 1rem;
    height: 100%;
    overflow: hidden;
  }
</style>