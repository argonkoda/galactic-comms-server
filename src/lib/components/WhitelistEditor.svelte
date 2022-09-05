<script>

import ConfirmAction from "./ConfirmAction.svelte";
import Field from "./Field.svelte";

  export let whitelist;

  export let disabled = false;

  let selection = new Set();

  let newId = "";

  let error = null;

  function handleSubmit() {
    if (disabled) return;
    error = null;
    if (!newId || !newId.match(/^[0-9]+$/)) return error = "Steam IDs must be made up of digits.";
    if (whitelist.indexOf(newId) === -1) {
      whitelist.push(newId);
      whitelist = whitelist;
      newId = "";
    } else {
      error = "That id is already in the whitelist."
    }
  }

  /**
   * 
   * @param {MouseEvent | null} event
   * @param {string} steam_id
   */
  function handleSelect(event, steam_id) {
    if (disabled) return;
    if (event) {
      const hadId = selection.has(steam_id);
      const oldSize = selection.size;
      if (!event.ctrlKey) {
        selection.clear();
      } else if (hadId) {
        selection.delete(steam_id);
      }
      if (!hadId || (!event.ctrlKey && oldSize > 1)) selection.add(steam_id);
    } else {
      selection.add(steam_id);
    }
    selection = selection;
  }

  function deleteSelection() {
    if (disabled) return;
    whitelist = whitelist.filter(steam_id => !selection.has(steam_id))
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <ul class:disabled on:click={() => {selection.clear(); selection = selection}}>
    {#each whitelist as steam_id}
      <li on:click|stopPropagation={(e, ) => handleSelect(e, steam_id)} class:selected={selection.has(steam_id)}>
        <span>{steam_id}</span>
        <ConfirmAction {disabled} on:open={() => handleSelect(null, steam_id)} class="borderless" on:confirm={deleteSelection}>
          <span class="material-symbols-outlined whitelist-delete">delete</span>
        </ConfirmAction>
      </li>
    {:else}
    <div class="empty">
      <span class="material-symbols-outlined">fact_check</span>
      <small>Enter the Steam Ids you<br/>want to whitelist below.</small>
    </div>
    {/each}
  </ul>
  <div class="flex row start">
    <Field {disabled} icon="badge" placeholder="Steam ID" bind:value={newId} {error}>
      <p>Enter a Steam ID you want to whitelist then click add.</p>
    </Field>
    <button {disabled} type="submit">Add</button>
  </div>
</form>

<style>
  form {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 0.5rem;
    overflow: hidden;
    padding-bottom: 3rem;
  }

  ul {
    height: 15rem;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    background-color: var(--color-bg-150);
    border-radius: var(--border-radius);
    overflow-x: hidden;
    overflow-y: scroll;
    list-style: none;
    padding: 0;
    position: relative;
  }

  .empty {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--color-text-disabled);
  }

  .empty span {
    font-size: 4rem;
  }

  li {
    padding: 0.125rem 0.125rem 0.125rem 1rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }

  li :first-child {
    flex-grow: 1;
  }

  ul:not(.disabled) li:hover {
    background: var(--color-bg-200);
  }

  ul:not(.disabled) li:hover .whitelist-delete {
    visibility: visible;
  }

  ul:not(.disabled) li.selected {
    background-color: var(--color-primary-200);
    color: white;
  }

  .whitelist-delete {
    visibility: hidden;
  }
</style>