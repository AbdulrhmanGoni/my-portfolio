<script lang="ts">
  import { untrack } from "svelte";
  import AddKvEntryDialog from "./AddKvEntryDialog.svelte";
  import BrowseParams from "./BrowseParams.svelte";
  import Button from "./Button.svelte";
  import KvEntriesTable from "./KvEntriesTable.svelte";
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
    loadKvEntries,
    type AddKvEntryInput,
    type KvEntry,
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

    <Button variant="outline" size="sm">
      <EyeIcon size={16} />
      Watched Keys (0)
    </Button>
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

    <Button variant="secondary2" size="sm">
      Atomic
      <AtomIcon size={16} />
    </Button>

    <Button variant="secondary" size="sm">
      Enqueue
      <MessageSquarePlusIcon size={16} />
    </Button>

    <Button variant="secondary1" size="sm" gap="4px">
      Look Up
      <span class="lookup-icon"><SearchIcon size={16} /></span>
    </Button>

    <Button size="sm" gap="2px" onclick={() => (addEntryOpen = true)}>
      New
      <PlusIcon size={16} />
    </Button>
  </div>

  <KvEntriesTable {entries} />

  <AddKvEntryDialog
    open={addEntryOpen}
    onClose={() => (addEntryOpen = false)}
    onSubmit={handleAddEntry}
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

  .lookup-icon :global(svg) {
    transform: rotate(75deg);
  }
</style>
