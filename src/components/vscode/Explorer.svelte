<script lang="ts">
  import FileIcon from "./FileIcon.svelte";
  import { fileIconFor } from "./file-icons";
  import { buildTree } from "./tree";
  import type { DemoFileMeta, TreeNode } from "./types";

  let {
    files,
    projectName,
    expanded,
    activePath,
    onToggleFolder,
    onOpenFile,
  }: {
    files: DemoFileMeta[];
    projectName: string;
    expanded: Set<string>;
    activePath: string | null;
    onToggleFolder: (path: string) => void;
    onOpenFile: (path: string, options?: { preview?: boolean }) => void;
  } = $props();

  const tree = $derived(buildTree(files.map((file) => file.path)));

  let rootOpen = $state(true);
</script>

{#snippet treeNodes(items: TreeNode[], depth: number)}
  {#each items as node (node.path)}
    {#if node.type === "folder"}
      <button
        type="button"
        class="tree-row"
        style:padding-left={`${8 + depth * 12}px`}
        aria-expanded={expanded.has(node.path)}
        onclick={() => onToggleFolder(node.path)}
      >
        <span
          class="codicon chevron {expanded.has(node.path)
            ? 'codicon-chevron-down'
            : 'codicon-chevron-right'}"
        ></span>
        <span
          class="codicon folder {expanded.has(node.path)
            ? 'codicon-folder-opened'
            : 'codicon-folder'}"
        ></span>
        <span class="tree-label">{node.name}</span>
      </button>

      {#if expanded.has(node.path)}
        {@render treeNodes(node.children ?? [], depth + 1)}
      {/if}
    {:else}
      {@const icon = fileIconFor(node.path)}
      <button
        type="button"
        class="tree-row file"
        class:active={node.path === activePath}
        style:padding-left={`${8 + depth * 12 + 16}px`}
        onclick={() => onOpenFile(node.path, { preview: true })}
        ondblclick={() => onOpenFile(node.path, { preview: false })}
      >
        <FileIcon {icon} />
        <span class="tree-label">{node.name}</span>
      </button>
    {/if}
  {/each}
{/snippet}

<aside class="explorer" aria-label="Explorer">
  <div class="explorer-header">
    <span class="explorer-title">Explorer</span>
    <div class="explorer-actions" aria-hidden="true">
      <span class="codicon codicon-new-file" title="New File"></span>
      <span class="codicon codicon-new-folder" title="New Folder"></span>
      <span class="codicon codicon-refresh" title="Refresh"></span>
      <span class="codicon codicon-collapse-all" title="Collapse All"></span>
    </div>
  </div>

  <div class="explorer-tree" role="tree" aria-label={projectName}>
    <button
      type="button"
      class="workspace-row"
      aria-expanded={rootOpen}
      onclick={() => (rootOpen = !rootOpen)}
    >
      <span
        class="codicon chevron {rootOpen
          ? 'codicon-chevron-down'
          : 'codicon-chevron-right'}"
      ></span>
      <span class="workspace-name">{projectName}</span>
    </button>

    {#if rootOpen}
      {@render treeNodes(tree, 0)}
    {/if}
  </div>
</aside>

<style>
  .explorer {
    display: flex;
    flex: none;
    flex-direction: column;
    width: 240px;
    background: var(--vscode-sidebar-bg);
    color: var(--vscode-text);
    user-select: none;
  }

  .explorer-header {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: space-between;
    height: 35px;
    padding: 0 12px 0 20px;
  }

  .explorer-title {
    color: var(--vscode-text);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .explorer-actions {
    display: flex;
    gap: 10px;
    color: var(--vscode-text);
  }

  .explorer-actions .codicon {
    font-size: 16px;
  }

  .explorer-tree {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding-bottom: 8px;
  }

  .workspace-row {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    height: 22px;
    padding: 0 8px;
    color: var(--vscode-text);
    cursor: pointer;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .tree-row {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    height: 22px;
    padding-right: 8px;
    color: var(--vscode-text);
    cursor: pointer;
    font-size: 13px;
    text-align: left;
  }

  .tree-row:hover {
    background: var(--vscode-hover);
  }

  .tree-row.active {
    background: var(--vscode-active);
  }

  .tree-row:focus-visible {
    outline: 1px solid var(--vscode-focus);
    outline-offset: -1px;
  }

  .chevron {
    flex: none;
    width: 16px;
    font-size: 16px;
  }

  .folder {
    color: #c09553;
    font-size: 16px;
  }

  .tree-label {
    overflow: hidden;
    line-height: 18px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
