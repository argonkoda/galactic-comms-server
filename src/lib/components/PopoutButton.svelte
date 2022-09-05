<script>
  import {createEventDispatcher} from 'svelte';

  const dispatch = createEventDispatcher();

  export let popout = false;
  export let side = "right";

  $: if (popout) dispatch('open');

  let popoutElem;

  function handleBlur(e) {
    if (popoutElem && !popoutElem.contains(e.target)) popout = false;
  }
</script>

<svelte:window on:click={handleBlur}></svelte:window>

<div class="popout-container">
  <slot name="activator" open={() => popout = true} />
  {#if popout}
  <div class="popout {side}" bind:this={popoutElem}>
    <slot />
  </div>
  {/if}
</div>

<style>
  .popout-container {
    position: relative;
  }

  .popout {
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    background: var(--color-bg-150);
    border-radius: var(--border-radius);
    gap: var(--popout-gap, 0);
  }

  .popout.right {
    right: 0;
  }

  .popout.left {
    left: 0;
  }
</style>