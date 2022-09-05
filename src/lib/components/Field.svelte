<script>
  export let error = null;
  export let icon = null;
  export let value;
  export let disabled = false;
</script>

<div class="field" class:error class:disabled>
  {#if icon !== null}<span class="material-symbols-outlined icon">{icon}</span>{/if}
  <input {...$$restProps} {disabled} bind:value>
  {#if $$slots.default || error}
  <div class="tip-container">
    <span class="tip-icon material-symbols-outlined">help</span>
    <div class="tip">
      {#if error}
      <p class="error">{error}</p>
      {/if}
      <slot />
    </div>
  </div>
  {/if}
</div>

<style>
  .field {
    border: none;
    border-radius: var(--border-radius);
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    background: var(--color-bg-300);
  }

  .field.disabled {
    background: var(--color-bg-150);
    color: var(--color-text-disabled);
  }

  .field.error {
    outline: 1px solid var(--color-text-error);
  }

  .tip > .error {
    color: var(--color-text-error);
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-bg-400);
  }

  .icon {
    position: absolute;
    top: 50%;
    left: 0.4rem;
    transform: translate(0, -50%);
    color: var(--color-text-disabled);
    font-size: 1.25rem;
    pointer-events: none;
  }

  .icon + input {
    padding-left: 2rem;
  }

  input {
    padding: 0.5rem;
    border: none;
    width: 100%;
    outline: none;
    color: inherit;
    background: none;
  }

  .tip-container {
    display: contents;
  }

  .tip-container:hover .tip {
    display: block;
  }

  .tip-icon {
    font-size: 1.25rem;
    padding: 0.5rem;
    color: var(--color-text-disabled);
  }

  .tip {
    position: absolute;
    top: calc(100% - var(--border-radius));
    left: 0;
    right: 0;
    display: none;
    z-index: 1;
    background: var(--color-bg-400);
    border-top: 1px solid var(--color-bg-400);
    padding: 0.5rem;
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    font-size: small;
    color: var(--color-text-default);
  }
</style>