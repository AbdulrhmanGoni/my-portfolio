<script lang="ts">
  import { untrack } from "svelte";
  import AddKvEntryDialog from "./AddKvEntryDialog.svelte";
  import BrowseParams from "./BrowseParams.svelte";
  import Button from "./Button.svelte";
  import KvEntriesTable from "./KvEntriesTable.svelte";
  import KvEntryDialog from "./KvEntryDialog.svelte";
  import KvStorePicker from "./KvStorePicker.svelte";
  import ArrowLeftFromLineIcon from "./icons/ArrowLeftFromLineIcon.svelte";
  import AtomIcon from "./icons/AtomIcon.svelte";
  import EyeIcon from "./icons/EyeIcon.svelte";
  import MessageSquarePlusIcon from "./icons/MessageSquarePlusIcon.svelte";
  import PlusIcon from "./icons/PlusIcon.svelte";
  import RotateCwIcon from "./icons/RotateCwIcon.svelte";
  import SearchIcon from "./icons/SearchIcon.svelte";
  import {
    addKvEntry,
    deleteKvEntry,
    loadKvEntries,
    updateKvEntry,
    type AddKvEntryInput,
    type KvEntry,
    type UpdateKvEntryInput,
  } from "./kv-entries";
  import type { KvStore } from "./kv-stores";
  import { notify } from "./notifications.svelte";

  let {
    kvStore,
    onBack,
  }: {
    kvStore: KvStore;
    onBack: () => void;
  } = $props();

  let entries = $state<KvEntry[]>(
    untrack(() => loadKvEntries(kvStore.id)),
  );
  let addEntryOpen = $state(false);
  let entryDialogOpen = $state(false);
  let viewedEntry = $state<KvEntry | null>(null);
  let entryDialogEditOnOpen = $state(false);

  function reloadEntries() {
    entries = loadKvEntries(kvStore.id);
  }

  function handleAddEntry(input: AddKvEntryInput): boolean {
    const result = addKvEntry(kvStore.id, input);

    if (!result.ok) {
      notify.warning(result.error);
      return false;
    }

    entries = result.entries;
    notify.success("The kv entry was added successfully");
    return true;
  }

  function openEntry(entry: KvEntry, openEditor = false) {
    viewedEntry = entry;
    entryDialogEditOnOpen = openEditor;
    entryDialogOpen = true;
  }

  function closeEntry() {
    entryDialogOpen = false;
  }

  function handleDeleteEntry(entry: KvEntry) {
    entries = deleteKvEntry(kvStore.id, entry.key);
    notify.success("The entry was deleted successfully");

    if (viewedEntry?.key === entry.key) {
      entryDialogOpen = false;
      viewedEntry = null;
    }
  }

  function handleUpdateEntry(
    entry: KvEntry,
    input: UpdateKvEntryInput,
  ): boolean {
    const result = updateKvEntry(kvStore.id, entry.key, input);

    if (!result.ok) {
      notify.warning(result.error);
      return false;
    }

    entries = result.entries;
    viewedEntry = result.entry;
    entryDialogEditOnOpen = false;
    notify.success("The changes was saved successfully");
    return true;
  }
</script>

<div class="kv-browser">
  <div class="top-row">
    <div class="top-row-start">
      <Button
        variant="outline"
        aria-label="Close Kv Store"
        title="Close Kv Store"
        onclick={onBack}
      >
        <ArrowLeftFromLineIcon size={20} />
      </Button>
      <KvStorePicker {kvStore} />
    </div>

    <span class="disabled-control" title="Watched Keys are not implemented">
      <Button variant="outline" size="sm" disabled>
        <EyeIcon size={16} />
        Watched Keys (0)
      </Button>
    </span>
  </div>

  <div class="actions-row">
    <BrowseParams />

    <Button
      variant="outline"
      size="sm"
      class="reload"
      onclick={reloadEntries}
    >
      Reload
      <RotateCwIcon size={16} />
    </Button>

    <span class="disabled-control" title="Atomic is not implemented">
      <Button variant="secondary2" size="sm" disabled>
        Atomic
        <AtomIcon size={16} />
      </Button>
    </span>

    <span class="disabled-control" title="Enqueue is not implemented">
      <Button variant="secondary" size="sm" disabled>
        Enqueue
        <MessageSquarePlusIcon size={16} />
      </Button>
    </span>

    <Button variant="secondary1" size="sm" gap="4px">
      Look Up
      <span class="lookup-icon"><SearchIcon size={16} /></span>
    </Button>

    <Button size="sm" gap="2px" onclick={() => (addEntryOpen = true)}>
      New
      <PlusIcon size={16} />
    </Button>
  </div>

  <KvEntriesTable
    {entries}
    onViewEntry={openEntry}
    onEditEntry={(entry) => openEntry(entry, true)}
    onDeleteEntry={handleDeleteEntry}
  />

  <AddKvEntryDialog
    open={addEntryOpen}
    onClose={() => (addEntryOpen = false)}
    onSubmit={handleAddEntry}
  />

  <KvEntryDialog
    open={entryDialogOpen}
    entry={viewedEntry}
    editOnOpen={entryDialogEditOnOpen}
    onClose={closeEntry}
    onDeleteEntry={handleDeleteEntry}
    onUpdateEntry={handleUpdateEntry}
  />
</div>

<style>
  .kv-browser {
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 100%;
    min-height: 0;
  }

  .top-row {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 16px;
  }

  .top-row-start {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 8px;
  }

  .actions-row {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  :global(.reload) {
    margin-inline-end: auto;
  }

  /* Disabled buttons ignore pointer events, so the wrapper owns the tooltip
     and the not-allowed cursor for actions not implemented. */
  .disabled-control {
    display: inline-flex;
    cursor: not-allowed;
  }

  .lookup-icon :global(svg) {
    transform: rotate(75deg);
  }
</style>
