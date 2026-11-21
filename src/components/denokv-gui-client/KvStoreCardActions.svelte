<script lang="ts">
  import type { KvStore } from "./kv-stores";
  import ActionsMenu from "./ActionsMenu.svelte";
  import ActionsMenuItem from "./ActionsMenuItem.svelte";
  import ActionsMenuSeparator from "./ActionsMenuSeparator.svelte";
  import CopyIcon from "./icons/CopyIcon.svelte";
  import FilePenIcon from "./icons/FilePenIcon.svelte";
  import OpenPathIcon from "./icons/OpenPathIcon.svelte";
  import SquareArrowOutUpRightIcon from "./icons/SquareArrowOutUpRightIcon.svelte";
  import SquarePenIcon from "./icons/SquarePenIcon.svelte";
  import TrashIcon from "./icons/TrashIcon.svelte";

  const {
    kvStore,
    onEditKvStore,
    onDeleteKvStore,
    onBrowseKvStore,
  }: {
    kvStore: KvStore;
    onEditKvStore: (kvStore: KvStore) => void;
    onDeleteKvStore: (kvStore: KvStore) => void;
    onBrowseKvStore: () => void;
  } = $props();

  const isLocal = $derived(
    kvStore.type === "local" || kvStore.type === "default",
  );

  async function copyPathOrUrl() {
    try {
      await navigator.clipboard.writeText(kvStore.url);
    } catch {}
  }

  function editKvStore() {
    // Default kv stores are renamed, not edited, in the original app. The
    // rename dialog is not part of this recreation yet.
    if (kvStore.type === "default") return;

    onEditKvStore(kvStore);
  }
</script>

<ActionsMenu label="Kv Store actions">
  <ActionsMenuItem onSelect={onBrowseKvStore}>
    <SquareArrowOutUpRightIcon size={16} />
    <span>Browse</span>
  </ActionsMenuItem>

  <ActionsMenuItem onSelect={copyPathOrUrl}>
    <CopyIcon size={16} />
    <span>Copy {isLocal ? "Path" : "URL"}</span>
  </ActionsMenuItem>

  <ActionsMenuItem onSelect={editKvStore}>
    {#if kvStore.type === "default"}
      <FilePenIcon size={16} />
      <span>Rename</span>
    {:else}
      <SquarePenIcon size={16} />
      <span>Edit</span>
    {/if}
  </ActionsMenuItem>

  {#if kvStore.type === "default"}
    <!-- Opening the path is not implemented yet. -->
    <ActionsMenuItem>
      <OpenPathIcon size={16} />
      <span>Open Path</span>
    </ActionsMenuItem>
  {/if}

  <ActionsMenuSeparator />

  <ActionsMenuItem destructive onSelect={() => onDeleteKvStore(kvStore)}>
    <TrashIcon size={16} />
    <span>Delete</span>
  </ActionsMenuItem>
</ActionsMenu>
