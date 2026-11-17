<script lang="ts">
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import XIcon from "@lucide/svelte/icons/x";
  import chromiumLogo from "../../assets/denokv-gui-client/chromium-logo.png";
  import electronLogo from "../../assets/denokv-gui-client/electron-logo.png";
  import nodeLogo from "../../assets/denokv-gui-client/node-logo.png";
  import AppThemeSetting from "./AppThemeSetting.svelte";
  import HardwareAccelerationSetting from "./HardwareAccelerationSetting.svelte";
  import UpdateAppSetting from "./UpdateAppSetting.svelte";
  import {
    loadAppSettings,
    saveAppSettings,
    type AppSettings,
    type ThemePreference,
  } from "./settings";

  let { open, onClose }: { open: boolean; onClose: () => void } = $props();

  // Static runtime metadata mirrored from the real application.
  const electronVersion = "45.2.1";
  const nodeVersion = "24.22.1";
  const chromiumVersion = "156.0.8078.75";

  let dialogElement = $state<HTMLDialogElement>();
  let settings = $state<AppSettings>(loadAppSettings());

  $effect(() => {
    if (!dialogElement) return;

    if (open) {
      if (!dialogElement.open) dialogElement.showModal();
    } else if (dialogElement.open) {
      dialogElement.close();
    }
  });

  function setAutoCheckForUpdate(value: boolean) {
    settings.autoCheckForUpdate = value;
    saveAppSettings(settings);
  }

  function setTheme(value: ThemePreference) {
    settings.theme = value;
    saveAppSettings(settings);
  }

  function setHardwareAcceleration(enabled: boolean) {
    settings.hardwareAccelerationEnabled = enabled;
    saveAppSettings(settings);
  }

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
  class="settings-dialog"
  aria-labelledby="settings-title"
  onclose={handleNativeClose}
  oncancel={handleCancel}
  onclick={handleDialogClick}
>
  <div class="settings-panel">
    <div class="settings-layout">
      <h2 class="title-row" id="settings-title">
        <span class="title-icon"><SettingsIcon size={30} /></span>
        Settings
      </h2>

      <div class="separator"></div>

      <div class="settings-body">
        <div class="settings-grid">
          <UpdateAppSetting
            autoCheckForUpdate={settings.autoCheckForUpdate}
            onAutoCheckForUpdateChange={setAutoCheckForUpdate}
          />
          <AppThemeSetting
            theme={settings.theme}
            onThemeChange={setTheme}
          />
          <HardwareAccelerationSetting
            enabled={settings.hardwareAccelerationEnabled}
            onEnabledChange={setHardwareAcceleration}
          />
        </div>
      </div>

      <div class="separator"></div>

      <div class="version-footer">
        <span class="version-item">
          <span class="version-name">
            <img
              class="version-logo"
              src={electronLogo.src}
              alt="Electron Logo"
            />
            Electron:
          </span>
          v{electronVersion}
        </span>
        <span class="version-separator"></span>
        <span class="version-item">
          <span class="version-name">
            <img class="version-logo" src={nodeLogo.src} alt="Node Logo" />
            Node:
          </span>
          v{nodeVersion}
        </span>
        <span class="version-separator"></span>
        <span class="version-item">
          <span class="version-name">
            <img
              class="version-logo"
              src={chromiumLogo.src}
              alt="Chromium Logo"
            />
            Chromium:
          </span>
          v{chromiumVersion}
        </span>
      </div>
    </div>

    <button
      class="close-button"
      type="button"
      aria-label="Close settings"
      title="Close"
      onclick={onClose}
    >
      <XIcon size={16} />
    </button>
  </div>
</dialog>

<style>
  .settings-dialog {
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

  .settings-dialog[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .settings-dialog::backdrop {
    background: rgb(0 0 0 / 0.5);
  }

  .settings-dialog[open]::backdrop {
    animation: overlay-in 200ms ease-out;
  }

  .settings-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 72rem;
    height: 100%;
    max-height: 37.5rem;
    padding: 12px;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--background);
    box-shadow:
      0 10px 15px -3px rgb(0 0 0 / 0.1),
      0 4px 6px -4px rgb(0 0 0 / 0.1);
  }

  .settings-dialog[open] .settings-panel {
    animation: panel-in 200ms ease-out;
  }

  .settings-layout {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
  }

  .title-row {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 8px;
    margin: 4px 0;
    font-size: 30px;
    font-weight: 700;
    line-height: 36px;
  }

  .title-icon {
    display: inline-flex;
    flex-shrink: 0;
  }

  .separator {
    flex-shrink: 0;
    height: 1px;
    background: var(--border);
  }

  .settings-body {
    flex: 1;
    min-height: 0;
    padding-inline-end: 2px;
    overflow-y: auto;
  }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 32px;
  }

  .version-footer {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--muted-foreground);
    font-size: 12px;
    line-height: 16px;
  }

  .version-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .version-name {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 700;
  }

  .version-logo {
    width: 16px;
    height: 16px;
    object-fit: fill;
  }

  .version-separator {
    width: 1px;
    height: 16px;
    background: var(--border);
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

  @media (max-width: 639px) {
    .settings-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
