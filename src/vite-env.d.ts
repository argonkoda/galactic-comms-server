/// <reference types="svelte" />
/// <reference types="vite/client" />

declare const server : {
  start: (options) => Promise<void>,
  stop: () => Promise<void>,
  isRunning: () => Promise<boolean>,
  log: {
    subscribe: (fn: (...args: any[]) => void) => (() => void),
  },
}