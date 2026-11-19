<script lang="ts">
  import SettingsIcon from "./icons/SettingsIcon.svelte";
  import appLogo from "../../assets/desktop/sidebar_applications/denokv-gui-client.webp";

  let {
    hasUpdate = false,
    onOpenSettings,
  }: {
    hasUpdate?: boolean;
    onOpenSettings: () => void;
  } = $props();
</script>

<header class="app-header">
  <button
    class="settings-button"
    type="button"
    aria-label={hasUpdate ? "Settings (new update available)" : "Settings"}
    title={hasUpdate ? "Settings — new update available" : "Settings"}
    onclick={onOpenSettings}
  >
    <SettingsIcon size={24} />
    {#if hasUpdate}
      <span class="update-dot" aria-hidden="true"></span>
    {/if}
  </button>

  <img class="app-logo" src={appLogo.src} alt="denokv-gui-client" />
</header>

<style>
  .app-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin: 8px 0;
  }

  .settings-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 6px;
    border: 1px solid var(--border);
    border-radius: calc(var(--radius) - 2px);
    background: var(--background);
    color: var(--foreground);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    cursor: pointer;
    transition:
      background-color 0.15s,
      border-color 0.15s,
      box-shadow 0.15s;
  }

  .settings-button:hover {
    background: var(--accent);
    color: var(--accent-foreground);
  }

  :global(.dark) .settings-button {
    border-color: var(--input);
    background: color-mix(in oklab, var(--input) 30%, transparent);
  }

  :global(.dark) .settings-button:hover {
    background: color-mix(in oklab, var(--input) 50%, transparent);
    color: var(--foreground);
  }

  .settings-button:focus-visible {
    border-color: var(--ring);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
    outline: none;
  }

  .update-dot {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--destructive);
  }

  .app-logo {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: contain;
  }
</style>
