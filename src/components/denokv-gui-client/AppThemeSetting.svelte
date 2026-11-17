<script lang="ts">
  import type { Component } from "svelte";
  import MonitorCogIcon from "@lucide/svelte/icons/monitor-cog";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import PaletteIcon from "@lucide/svelte/icons/palette";
  import SunIcon from "@lucide/svelte/icons/sun";
  import type { ThemePreference } from "./settings";

  let {
    theme,
    onThemeChange,
  }: {
    theme: ThemePreference;
    onThemeChange: (value: ThemePreference) => void;
  } = $props();

  type ThemeOption = {
    value: ThemePreference;
    label: string;
    icon: Component;
  };

  const themeOptions: ThemeOption[] = [
    { value: "dark", label: "Dark", icon: MoonIcon },
    { value: "light", label: "Light", icon: SunIcon },
    { value: "system", label: "System", icon: MonitorCogIcon },
  ];
</script>

<div class="theme-setting">
  <h3 class="section-title">
    <PaletteIcon size={24} />
    Theme
  </h3>

  <div class="theme-tabs" role="tablist" aria-label="Theme">
    {#each themeOptions as option (option.value)}
      {@const Icon = option.icon}
      <button
        class="theme-tab"
        class:active={theme === option.value}
        type="button"
        role="tab"
        aria-selected={theme === option.value}
        onclick={() => onThemeChange(option.value)}
      >
        <Icon size={18} />
        {option.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .theme-setting {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
  }

  .theme-tabs {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 400px;
    height: 36px;
    padding: 3px;
    border-radius: var(--radius);
    background: var(--muted);
    color: var(--muted-foreground);
  }

  .theme-tab {
    display: inline-flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: calc(100% - 1px);
    padding: 4px 8px;
    border: 1px solid transparent;
    border-radius: calc(var(--radius) - 2px);
    background: transparent;
    color: var(--muted-foreground);
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color 0.15s,
      border-color 0.15s,
      color 0.15s,
      box-shadow 0.15s;
  }

  .theme-tab.active {
    border-color: var(--input);
    background: color-mix(in oklab, var(--input) 30%, transparent);
    color: var(--foreground);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .theme-tab:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }
</style>
