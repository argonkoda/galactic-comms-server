const path = require('node:path');
const { resourceLimits } = require('node:worker_threads');

/**
 * @type {import('electron-forge').}
 */
module.exports = {
  packagerConfig: {
    dir: "dist",
    icon: "src/assets/icon.ico",
    name: "GalacticComms Voice Server",
    ignore: (filePath) => {
      const include = ["", "/", "/dist", "/package.json", "/package-lock.json"]
      const result = !(include.includes(filePath) || filePath.startsWith('/dist'));
      return result;
    }
  },
  makers: [
    {
      name: "@electron-forge/maker-zip"
    }
  ]
}