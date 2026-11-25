<script lang="ts">
  // Only the explorer is functional in this demo. The remaining entries are
  // present to match VS Code's workbench, and are marked as decorative.
  const topItems = [
    { icon: "codicon-files", label: "Explorer", active: true },
    { icon: "codicon-search", label: "Search", active: false },
    { icon: "codicon-source-control", label: "Source Control", active: false },
    { icon: "codicon-debug-alt", label: "Run and Debug", active: false },
    { icon: "codicon-extensions", label: "Extensions", active: false },
  ];

  const bottomItems = [
    { icon: "codicon-account", label: "Accounts" },
    { icon: "codicon-settings-gear", label: "Manage" },
  ];
</script>

<nav class="activity-bar" aria-hidden="true">
  <div class="activity-group">
    {#each topItems as item}
      <div
        class="activity-item"
        class:active={item.active}
        title={item.label}
      >
        <span class="codicon {item.icon}"></span>
      </div>
    {/each}
  </div>

  <div class="activity-group bottom">
    {#each bottomItems as item}
      <div class="activity-item" title={item.label}>
        <span class="codicon {item.icon}"></span>
      </div>
    {/each}
  </div>
</nav>

<style>
  .activity-bar {
    display: flex;
    flex: none;
    flex-direction: column;
    justify-content: space-between;
    width: 48px;
    background: var(--vscode-activitybar-bg);
    user-select: none;
  }

  .activity-group {
    display: flex;
    flex-direction: column;
  }

  .activity-item {
    position: relative;
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    color: #858585;
  }

  .activity-item .codicon {
    font-size: 24px;
  }

  .activity-item:hover {
    color: var(--vscode-text-strong);
  }

  .activity-item.active {
    color: var(--vscode-text-strong);
  }

  .activity-item.active::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 2px;
    background: var(--vscode-text-strong);
    content: "";
  }

  .activity-group.bottom {
    padding-bottom: 4px;
  }
</style>
