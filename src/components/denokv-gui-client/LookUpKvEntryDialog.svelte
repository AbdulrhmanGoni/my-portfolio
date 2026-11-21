<script lang="ts">
  import Button from "./Button.svelte";
  import KvCodeEditor from "./KvCodeEditor.svelte";
  import DatabaseSearchIcon from "./icons/DatabaseSearchIcon.svelte";
  import FileKeyIcon from "./icons/FileKeyIcon.svelte";
  import SearchIcon from "./icons/SearchIcon.svelte";
  import XIcon from "./icons/XIcon.svelte";
  import { validateKvEntryKey, type KvEntry } from "./kv-entries";
  import { notify } from "./notifications.svelte";

  let {
    open,
    onClose,
    onSearch,
  }: {
    open: boolean;
    onClose: () => void;
    onSearch: (key: string) => KvEntry | null;
  } = $props();

  let dialogElement = $state<HTMLDialogElement>();
  let keyText = $state("[]");

  $effect(() => {
    if (!dialogElement) return;

    if (open) {
      if (!dialogElement.open) dialogElement.showModal();
    } else if (dialogElement.open) {
      dialogElement.close();
    }
  });

  function handleCancel(event: Event) {
    event.preventDefault();
    onClose();
  }

  function handleNativeClose() {
    // Start every lookup from the same default key, like the original dialog
    // whose editor is recreated each time it opens.
    keyText = "[]";

    if (open) onClose();
  }

  function handleDialogClick(event: MouseEvent) {
    if (event.target === dialogElement) onClose();
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const keyError = validateKvEntryKey(keyText);
    if (keyError) {
      notify.warning(keyError);
      return;
    }

    if (!onSearch(keyText)) {
      notify.warning("Look up failed: Entry not found");
    }
  }
</script>

<dialog
  bind:this={dialogElement}
  class="lookup-dialog"
  aria-labelledby="lookup-entry-title"
  aria-describedby="lookup-entry-description"
  onclose={handleNativeClose}
  oncancel={handleCancel}
  onclick={handleDialogClick}
>
  {#if open}
    <form class="lookup-panel" onsubmit={handleSubmit}>
      <h2 class="title-row" id="lookup-entry-title">
        <DatabaseSearchIcon size={28} />
        Look Up a KV Entry
      </h2>
      <p class="description" id="lookup-entry-description">
        Look up a Kv Entry by it's key
      </p>

      <div class="separator"></div>

      <div class="key-section">
        <p class="section-title">
          <FileKeyIcon size={22} />
          Key
        </p>
        <KvCodeEditor ariaLabel="Key" bind:value={keyText} />
      </div>

      <div class="separator"></div>

      <div class="form-actions">
        <Button variant="outline" size="sm" onclick={onClose}>
          <XIcon size={16} />
          Close
        </Button>
        <Button variant="default" size="sm" type="submit">
          Search
          <span class="search-icon"><SearchIcon size={16} /></span>
        </Button>
      </div>

      <button
        class="close-button"
        type="button"
        aria-label="Close"
        title="Close"
        onclick={onClose}
      >
        <XIcon size={16} />
      </button>
    </form>
  {/if}
</dialog>

<style>
  .lookup-dialog {
    position: fixed;
    inset: 0;
    width: 100vw;
    max-width: none;
    height: 100dvh;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--foreground);
    overflow: hidden;
  }

  .lookup-dialog[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lookup-dialog::backdrop {
    background: rgb(0 0 0 / 0.5);
  }

  .lookup-dialog[open]::backdrop {
    animation: overlay-in 200ms ease-out;
  }

  .lookup-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
    max-width: 48rem;
    max-height: calc(100dvh - 24px);
    padding: 12px;
    overflow-y: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--background);
    box-shadow:
      0 10px 15px -3px rgb(0 0 0 / 0.1),
      0 4px 6px -4px rgb(0 0 0 / 0.1);
    animation: panel-in 200ms ease-out;
  }

  .title-row {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding-inline-end: 24px;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
  }

  .description {
    flex-shrink: 0;
    padding-block: 6px;
    color: var(--muted-foreground);
    font-size: 16px;
  }

  .separator {
    flex-shrink: 0;
    height: 1px;
    margin: 12px 0;
    background: var(--border);
  }

  .key-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.4;
  }

  .form-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }

  .search-icon :global(svg) {
    transform: rotate(90deg);
  }

  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--foreground);
    opacity: 0.7;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .close-button:hover {
    opacity: 1;
  }

  .close-button:focus-visible {
    border-radius: 2px;
    outline: none;
    box-shadow: 0 0 0 2px var(--ring);
  }

  @keyframes overlay-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes panel-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
