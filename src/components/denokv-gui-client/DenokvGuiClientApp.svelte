<script lang="ts">
  import AddKvStoreForm from "./AddKvStoreForm.svelte";
  import Header from "./Header.svelte";
  import KvStoresGrid from "./KvStoresGrid.svelte";
  import SettingsDialog from "./SettingsDialog.svelte";
  import {
    createKvStore,
    loadKvStores,
    saveKvStores,
    type CreateKvStoreInput,
    type KvStore,
  } from "./kv-stores";

  let kvStores = $state<KvStore[]>(loadKvStores());
  let openedView = $state<"kv-stores" | "add-kv-store">("kv-stores");
  let settingsOpen = $state(false);

  function openAddKvStoreForm() {
    openedView = "add-kv-store";
  }

  function closeAddKvStoreForm() {
    openedView = "kv-stores";
  }

  function handleCreateKvStore(input: CreateKvStoreInput) {
    const newStore = createKvStore(input);

    kvStores = [...kvStores, newStore];
    saveKvStores(kvStores);
    openedView = "kv-stores";
  }
</script>

<main class="denokv-app">
  <Header onOpenSettings={() => (settingsOpen = true)} />

  <div class="denokv-app-content">
    {#if openedView === "add-kv-store"}
      <AddKvStoreForm
        onBack={closeAddKvStoreForm}
        onSubmit={handleCreateKvStore}
      />
    {:else}
      <KvStoresGrid {kvStores} onAddKvStore={openAddKvStoreForm} />
    {/if}
  </div>

  <SettingsDialog open={settingsOpen} onClose={() => (settingsOpen = false)} />
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
