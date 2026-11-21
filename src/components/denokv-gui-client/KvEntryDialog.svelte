<script lang="ts">
  import KvEntryDetails from "./KvEntryDetails.svelte";
  import type { KvEntry, UpdateKvEntryInput } from "./kv-entries";

  let {
    open,
    entry,
    editOnOpen = false,
    onClose,
    onDeleteEntry,
    onUpdateEntry,
  }: {
    open: boolean;
    entry: KvEntry | null;
    editOnOpen?: boolean;
    onClose: () => void;
    onDeleteEntry: (entry: KvEntry) => void;
    onUpdateEntry: (entry: KvEntry, input: UpdateKvEntryInput) => boolean;
  } = $props();

  let dialogElement = $state<HTMLDialogElement>();

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
    if (open) onClose();
  }

  function handleDialogClick(event: MouseEvent) {
    if (event.target === dialogElement) onClose();
  }
</script>

<dialog
  bind:this={dialogElement}
  class="entry-dialog"
  aria-label="View Kv Entry"
  onclose={handleNativeClose}
  oncancel={handleCancel}
  onclick={handleDialogClick}
>
  {#if open && entry}
    {#key entry}
      <KvEntryDetails
        {entry}
        {editOnOpen}
        {onClose}
        {onDeleteEntry}
        {onUpdateEntry}
      />
    {/key}
  {/if}
</dialog>

<style>
  .entry-dialog {
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

  .entry-dialog[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .entry-dialog::backdrop {
    background: rgb(0 0 0 / 0.5);
  }

  .entry-dialog[open]::backdrop {
    animation: overlay-in 200ms ease-out;
  }

  @keyframes overlay-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
