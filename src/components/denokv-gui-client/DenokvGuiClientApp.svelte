<script lang="ts">
  import { onMount } from "svelte";
  import AddKvStoreForm from "./AddKvStoreForm.svelte";
  import Header from "./Header.svelte";
  import KvStoresGrid from "./KvStoresGrid.svelte";
  import SettingsDialog from "./SettingsDialog.svelte";
  import Toaster from "./Toaster.svelte";
  import { notify } from "./notifications.svelte";
  import type { DenokvReleaseInfo } from "./release-info";
  import { loadAppSettings } from "./settings";
  import {
    cancelUpdateCheck,
    checkForUpdates,
    updateState,
  } from "./update-state.svelte";
  import {
    createKvStore,
    hasKvStoreChanges,
    loadKvStores,
    saveKvStores,
    updateKvStore,
    type CreateKvStoreInput,
    type KvStore,
  } from "./kv-stores";

  let { releaseInfo }: { releaseInfo: DenokvReleaseInfo } = $props();

  let kvStores = $state<KvStore[]>(loadKvStores());
  let openedView = $state<"kv-stores" | "add-kv-store" | "edit-kv-store">(
    "kv-stores",
  );
  let kvStoreToEdit = $state<KvStore | null>(null);
  let settingsOpen = $state(false);

  onMount(() => {
    // Tell the portfolio window that the app is on screen. Keep the message in
    // sync with src/scripts/windows/embedded-app.ts.
    if (window.parent !== window) {
      window.parent.postMessage("embedded-app-ready", window.location.origin);
    }
  });

  // Mirrors the real application's startup check: run silently in the
  // background when the preference is enabled, and let the header dot announce
  // the result.
  $effect(() => {
    if (!loadAppSettings().autoCheckForUpdate) return;

    void checkForUpdates(releaseInfo);

    return () => cancelUpdateCheck();
  });

  function openAddKvStoreForm() {
    kvStoreToEdit = null;
    openedView = "add-kv-store";
  }

  function openEditKvStoreForm(kvStore: KvStore) {
    kvStoreToEdit = kvStore;
    openedView = "edit-kv-store";
  }

  function closeKvStoreForm() {
    kvStoreToEdit = null;
    openedView = "kv-stores";
  }

  function handleCreateKvStore(input: CreateKvStoreInput) {
    const newStore = createKvStore(input);

    kvStores = [...kvStores, newStore];
    saveKvStores(kvStores);
    notify.success("The Kv Store was created successfully");
    closeKvStoreForm();
  }

  function handleUpdateKvStore(input: CreateKvStoreInput) {
    if (!kvStoreToEdit) return;

    if (!hasKvStoreChanges(kvStoreToEdit, input)) {
      notify.warning("No changes to save");
      return;
    }

    const updatedStore = updateKvStore(kvStoreToEdit, input);

    kvStores = kvStores.map((store) =>
      store.id === updatedStore.id ? updatedStore : store,
    );
    saveKvStores(kvStores);
    notify.success("The kv store has been edited successfully");
    closeKvStoreForm();
  }

  function handleDeleteKvStore(kvStore: KvStore) {
    kvStores = kvStores.filter((store) => store.id !== kvStore.id);
    saveKvStores(kvStores);
    notify.success("The Kv Store was deleted successfully");
  }
</script>

<main class="denokv-app">
  <Header
    hasUpdate={updateState.result?.hasUpdate ?? false}
    {releaseInfo}
    onOpenSettings={() => (settingsOpen = true)}
  />

  <div class="denokv-app-content">
    {#if openedView === "add-kv-store"}
      <AddKvStoreForm
        onBack={closeKvStoreForm}
        onSubmit={handleCreateKvStore}
      />
    {:else if openedView === "edit-kv-store" && kvStoreToEdit}
      <AddKvStoreForm
        kvStore={kvStoreToEdit}
        onBack={closeKvStoreForm}
        onSubmit={handleUpdateKvStore}
      />
    {:else}
      <KvStoresGrid
        {kvStores}
        onAddKvStore={openAddKvStoreForm}
        onEditKvStore={openEditKvStoreForm}
        onDeleteKvStore={handleDeleteKvStore}
      />
    {/if}
  </div>

  <Toaster />

  <SettingsDialog
    open={settingsOpen}
    {releaseInfo}
    onClose={() => (settingsOpen = false)}
  />
</main>

<style>
  .denokv-app {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100dvh;
    padding: 12px;
    background: var(--background);
    color: var(--foreground);
    overflow: hidden;
  }

  .denokv-app-content {
    flex: 1;
    min-height: 0;
  }
</style>
