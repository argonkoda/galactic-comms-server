<script>
  import {createEventDispatcher} from 'svelte';
  import PopoutButton from './PopoutButton.svelte';

  const dispatch = createEventDispatcher();

  let showConfirm = false;
</script>

<PopoutButton bind:popout={showConfirm} on:open>
  <button type="button" slot="activator" let:open on:click|stopPropagation={open} {...$$restProps}><slot /></button>
  <button type="button" class="borderless" on:click|stopPropagation={() => {dispatch("confirm"); showConfirm = false;}}>
    <span class="material-symbols-outlined">done</span>
  </button>
  <button type="button" on:click|stopPropagation={() => {showConfirm = false;}} class="borderless">
    <span class="material-symbols-outlined">close</span>
  </button>
</PopoutButton>