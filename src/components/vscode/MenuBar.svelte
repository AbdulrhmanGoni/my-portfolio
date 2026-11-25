<script lang="ts">
  // The menu bar is part of the VS Code look, but the demo is read-only and
  // has no menus, so the items are decorative.
  const menus = [
    "File",
    "Edit",
    "Selection",
    "View",
    "Go",
    "Run",
    "Terminal",
    "Help",
  ];
</script>

<div class="menubar" aria-hidden="true">
  {#each menus as menu}
    <span class="menu-item">{menu}</span>
  {/each}
</div>

<style>
  .menubar {
    display: flex;
    flex: none;
    align-items: center;
    height: 30px;
    padding: 0 8px;
    background: var(--vscode-menu-bg);
    user-select: none;
  }

  .menu-item {
    padding: 4px 8px;
    border-radius: 4px;
    color: var(--vscode-text);
    font-size: 12px;
  }

  .menu-item:hover {
    background: #505050;
  }
</style>
