<script lang="ts">
  import SettingsIcon from "./icons/SettingsIcon.svelte";
  import appLogo from "../../assets/desktop/sidebar_applications/denokv-gui-client.webp";
  import type { DenokvReleaseInfo } from "./release-info";

  let {
    hasUpdate = false,
    releaseInfo,
    onOpenSettings,
  }: {
    hasUpdate?: boolean;
    releaseInfo: DenokvReleaseInfo;
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

  <div class="app-info">
    <button
      class="app-logo-trigger"
      type="button"
      aria-label="App information"
      aria-describedby="app-info-tooltip"
    >
      <img class="app-logo" src={appLogo.src} alt="denokv-gui-client" />
    </button>

    <div class="app-info-tooltip" id="app-info-tooltip" role="tooltip">
      <a
        class="app-repo-link"
        href={releaseInfo.app.repository}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open the GitHub repository"
      >
        <svg viewBox="0 0 97.6 96" aria-hidden="true">
          <path
            fill="currentColor"
            d="M48.9,0C21.8,0,0,22,0,49.2C0,71,14,89.4,33.4,95.9c2.4,0.5,3.3-1.1,3.3-2.4c0-1.1-0.1-5.1-0.1-9.1c-13.6,2.9-16.4-5.9-16.4-5.9c-2.2-5.7-5.4-7.2-5.4-7.2c-4.4-3,0.3-3,0.3-3c4.9,0.3,7.5,5.1,7.5,5.1c4.4,7.5,11.4,5.4,14.2,4.1c0.4-3.2,1.7-5.4,3.1-6.6c-10.8-1.1-22.2-5.4-22.2-24.3c0-5.4,1.9-9.8,5-13.2c-0.5-1.2-2.2-6.3,0.5-13c0,0,4.1-1.3,13.4,5.1c3.9-1.1,8.1-1.6,12.2-1.6s8.3,0.6,12.2,1.6c9.3-6.4,13.4-5.1,13.4-5.1c2.7,6.8,1,11.8,0.5,13c3.2,3.4,5,7.8,5,13.2c0,18.9-11.4,23.1-22.3,24.3c1.8,1.5,3.3,4.5,3.3,9.1c0,6.6-0.1,11.9-0.1,13.5c0,1.3,0.9,2.9,3.3,2.4C83.6,89.4,97.6,71,97.6,49.2C97.7,22,75.8,0,48.9,0z"
          />
        </svg>
      </a>

      <span class="app-info-separator" aria-hidden="true"></span>

      <a
        class="app-version-link"
        href={releaseInfo.app.releaseUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        v{releaseInfo.app.version}
      </a>
    </div>
  </div>
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

  .app-info {
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
  }

  .app-logo-trigger {
    display: flex;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: none;
    cursor: pointer;
  }

  .app-logo-trigger:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }

  .app-logo {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: contain;
  }

  .app-info-tooltip {
    position: absolute;
    top: 50%;
    right: 100%;
    z-index: 50;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    white-space: nowrap;
    visibility: hidden;
    opacity: 0;
    transform: translateY(-50%) translateX(8px) scale(0.95);
    transform-origin: 100% 50%;
    transition:
      opacity 0.15s ease-out,
      transform 0.15s ease-out,
      visibility 0s linear 0.15s;
  }

  .app-info:hover .app-info-tooltip,
  .app-info:focus-within .app-info-tooltip {
    visibility: visible;
    opacity: 1;
    transform: translateY(-50%) scale(1);
    transition-delay: 0s;
  }

  .app-repo-link {
    display: flex;
    color: var(--foreground);
  }

  .app-repo-link svg {
    width: 20px;
    height: 20px;
  }

  .app-info-separator {
    width: 1px;
    height: 32px;
    background: var(--border);
  }

  .app-version-link {
    color: var(--foreground);
    font-size: 1.125rem;
    font-weight: 700;
    text-decoration: none;
  }

  .app-version-link:hover {
    text-decoration: underline;
  }
</style>
