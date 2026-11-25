<script lang="ts">
  import type { DemoFileMeta } from "./types";

  let {
    activeFile,
    currentLine,
  }: { activeFile: DemoFileMeta | null; currentLine: number } = $props();
</script>

<footer class="statusbar">
  <div class="status-group">
    <span class="status-item">
      <span class="codicon codicon-source-control"></span>
      main
    </span>
    <span class="status-item">
      <span class="codicon codicon-sync"></span>
    </span>
    <span class="status-item">
      <span class="codicon codicon-error"></span>
      0
    </span>
    <span class="status-item">
      <span class="codicon codicon-warning"></span>
      0
    </span>
  </div>

  <div class="status-group">
    {#if activeFile}
      {#if activeFile.kind === "image"}
        <span class="status-item">Image</span>
      {:else}
        <span class="status-item">Ln {currentLine + 1}, Col 1</span>
        <span class="status-item">Spaces: 2</span>
        <span class="status-item">UTF-8</span>
        <span class="status-item">LF</span>
        <span class="status-item">{activeFile.language}</span>
      {/if}
    {/if}
    <span class="status-item">
      <span class="codicon codicon-bell"></span>
    </span>
  </div>
</footer>

<style>
  .statusbar {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: space-between;
    height: 22px;
    padding: 0 10px;
    background: var(--vscode-statusbar-bg);
    color: #ffffff;
    font-size: 12px;
    user-select: none;
  }

  .status-group {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 100%;
    padding: 0 6px;
  }

  .status-item:hover {
    background: var(--vscode-statusbar-hover);
  }

  .status-item .codicon {
    font-size: 14px;
  }
</style>
