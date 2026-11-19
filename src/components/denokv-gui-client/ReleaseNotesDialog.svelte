<script lang="ts">
  import NotesIcon from "./icons/NotesIcon.svelte";
  import XIcon from "./icons/XIcon.svelte";
  import type { DenokvReleaseInfo } from "./release-info";

  let {
    open,
    releaseInfo,
    onClose,
  }: {
    open: boolean;
    releaseInfo: DenokvReleaseInfo;
    onClose: () => void;
  } = $props();

  let dialogElement = $state<HTMLDialogElement>();

  // marked renders <a> tags without a target; open them in a new tab just like
  // the desktop app does with its release notes dialog.
  const notesHtml = $derived(
    releaseInfo.releaseNotesHtml?.replaceAll(
      "<a href=",
      '<a target="_blank" href=',
    ) ?? "",
  );

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
  class="release-notes-dialog"
  aria-labelledby="release-notes-title"
  aria-describedby="release-notes-description"
  onclose={handleNativeClose}
  oncancel={handleCancel}
  onclick={handleDialogClick}
>
  <div class="release-notes-panel">
    <h2 class="title-row" id="release-notes-title">
      <NotesIcon size={24} />
      Release Notes
    </h2>
    <p class="description" id="release-notes-description">
      See the changes you will get with this update
    </p>

    <div class="separator"></div>

    <div id="release-notes" class="release-notes-content">
      <h2 class="version-heading">
        v{releaseInfo.app.version}
        <span class="badge">(current)</span>
      </h2>
      {@html notesHtml}
    </div>

    <button
      class="close-button"
      type="button"
      aria-label="Close release notes"
      title="Close"
      onclick={onClose}
    >
      <XIcon size={16} />
    </button>
  </div>
</dialog>

<style>
  .release-notes-dialog {
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

  .release-notes-dialog[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .release-notes-dialog::backdrop {
    background: rgb(0 0 0 / 0.5);
  }

  .release-notes-dialog[open]::backdrop {
    animation: overlay-in 200ms ease-out;
  }

  .release-notes-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
    max-width: 48rem;
    min-height: 0;
    max-height: 100%;
    padding: 6px 12px;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--background);
    box-shadow:
      0 10px 15px -3px rgb(0 0 0 / 0.1),
      0 4px 6px -4px rgb(0 0 0 / 0.1);
  }

  .release-notes-dialog[open] .release-notes-panel {
    animation: panel-in 200ms ease-out;
  }

  .title-row {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 8px;
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
  }

  .description {
    flex-shrink: 0;
    color: var(--muted-foreground);
    font-size: 16px;
  }

  .separator {
    flex-shrink: 0;
    height: 1px;
    margin: 8px 0;
    background: var(--border);
  }

  .release-notes-content {
    flex: 1;
    min-height: 0;
    max-height: 500px;
    overflow: auto;
  }

  #release-notes {
    --spacing: 0.25rem;
  }

  .version-heading {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    font-size: 24px;
    font-weight: 800;
  }

  .badge {
    color: #2563eb;
    font-size: 16px;
    font-weight: 700;
  }

  :global(.dark) .badge {
    color: #3b82f6;
  }

  #release-notes :global(h3) {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 5px 0;
  }

  #release-notes :global(ul) {
    list-style-type: disc;
    margin: 0 0 16px 28px;
  }

  #release-notes :global(li) {
    margin-bottom: 4px;
  }

  #release-notes :global(a) {
    text-decoration: underline;
    text-underline-offset: 2px;
    color: var(--foreground);
  }

  #release-notes :global(a:hover) {
    opacity: 0.8;
  }

  #release-notes :global(code) {
    background-color: var(--muted);
    border-radius: calc(var(--radius) - 4px);
    padding-block: calc(var(--spacing) * 0.5);
    padding-inline: var(--spacing);
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
    outline: none;
    box-shadow: 0 0 0 2px var(--ring);
    border-radius: 2px;
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
