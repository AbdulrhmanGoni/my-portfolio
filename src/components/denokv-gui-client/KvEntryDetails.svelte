<script lang="ts">
  import { untrack } from "svelte";
  import Button from "./Button.svelte";
  import CopyButton from "./CopyButton.svelte";
  import HighlightedCode from "./HighlightedCode.svelte";
  import KvEntryValue from "./KvEntryValue.svelte";
  import KvEntryValueEditor from "./KvEntryValueEditor.svelte";
  import EyeIcon from "./icons/EyeIcon.svelte";
  import FileBracesIcon from "./icons/FileBracesIcon.svelte";
  import FileKeyIcon from "./icons/FileKeyIcon.svelte";
  import PencilLineIcon from "./icons/PencilLineIcon.svelte";
  import SaveIcon from "./icons/SaveIcon.svelte";
  import TagsIcon from "./icons/TagsIcon.svelte";
  import TrashIcon from "./icons/TrashIcon.svelte";
  import XIcon from "./icons/XIcon.svelte";
  import type { KvEntry, KvValueType, UpdateKvEntryInput } from "./kv-entries";
  import { notify } from "./notifications.svelte";

  let {
    entry,
    editOnOpen = false,
    onClose,
    onDeleteEntry,
    onUpdateEntry,
  }: {
    entry: KvEntry;
    editOnOpen?: boolean;
    onClose: () => void;
    onDeleteEntry: (entry: KvEntry) => void;
    onUpdateEntry: (entry: KvEntry, input: UpdateKvEntryInput) => boolean;
  } = $props();

  // The parent keys this component on the entry, so these initial values are
  // refreshed whenever a different revision is displayed.
  let editing = $state(untrack(() => editOnOpen));
  let editValueType = $state<KvValueType>(untrack(() => entry.valueType));
  let editValueData = $state(untrack(() => entry.value));

  function startEditing() {
    editValueType = entry.valueType;
    editValueData = entry.value;
    editing = true;
  }

  function handleSave() {
    if (editValueType === entry.valueType && editValueData === entry.value) {
      notify.warning("No changes to the value");
      return;
    }

    if (
      onUpdateEntry(entry, { valueType: editValueType, value: editValueData })
    ) {
      editing = false;
    }
  }

  function handleDelete() {
    onDeleteEntry(entry);
    onClose();
  }
</script>

<div class="entry-panel">
  <div class="section">
    <p class="section-title">
      <FileKeyIcon size={22} />
      Key
    </p>
    <div class="data-row">
      <span class="key-text" title={entry.key}>
        <HighlightedCode code={entry.key} />
      </span>
      <CopyButton text={entry.key} label="Key" />
    </div>
  </div>

  <div class="separator"></div>

  <div class="section">
    <p class="section-title">
      <TagsIcon size={22} />
      Versionstamp
    </p>
    <div class="data-row">
      <span class="versionstamp">{entry.versionstamp}</span>
      <CopyButton text={entry.versionstamp} label="Versionstamp" />
    </div>
  </div>

  <div class="separator"></div>

  {#if editing}
    <KvEntryValueEditor bind:type={editValueType} bind:data={editValueData} />

    <div class="separator"></div>

    <div class="form-actions">
      <Button variant="outline" size="sm" onclick={() => (editing = false)}>
        <XIcon size={16} />
        Cancel
      </Button>
      <Button variant="secondary2" size="sm" onclick={handleSave}>
        Save
        <SaveIcon size={16} />
      </Button>
    </div>
  {:else}
    <div class="section value-section">
      <p class="section-title">
        <FileBracesIcon size={22} />
        Value
      </p>
      <div class="value-box" title={entry.value}>
        <KvEntryValue {entry} />
        <CopyButton text={entry.value} label="Value" className="value-copy" />
      </div>

      <div class="form-actions">
        <!-- Watching is not backed by a backend in this demo. -->
        <span class="watch-control" title="Watch is not available in this demo">
          <Button variant="secondary" size="sm" disabled>
            <EyeIcon size={16} />
            Watch
          </Button>
        </span>
        <Button variant="destructive" size="sm" onclick={handleDelete}>
          <TrashIcon size={16} />
          Delete
        </Button>
        <Button variant="secondary2" size="sm" onclick={startEditing}>
          <PencilLineIcon size={16} />
          Edit
        </Button>
      </div>
    </div>
  {/if}

  <button
    class="close-button"
    type="button"
    aria-label="Close entry details"
    title="Close"
    onclick={onClose}
  >
    <XIcon size={16} />
  </button>
</div>

<style>
  .entry-panel {
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

  .section {
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

  .data-row {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    border-radius: calc(var(--radius) - 2px);
    background: var(--card);
  }

  .key-text,
  .versionstamp {
    min-width: 0;
    overflow-x: auto;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
  }

  .separator {
    flex-shrink: 0;
    height: 1px;
    margin: 8px 0;
    background: var(--border);
  }

  .value-box {
    display: flex;
    height: 270px;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    padding: 12px;
    overflow: auto;
    border-radius: calc(var(--radius) - 2px);
    background: var(--card);
  }

  .value-box :global(.value-copy) {
    margin-inline-start: auto;
  }

  .form-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
  }

  /* The disabled button ignores pointer events, so the wrapper owns the
     not-allowed cursor shown for the unavailable Watch action. */
  .watch-control {
    display: inline-flex;
    cursor: not-allowed;
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
    border-radius: calc(var(--radius) - 4px);
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
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
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
