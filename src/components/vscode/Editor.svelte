<script lang="ts">
  import FileIcon from "./FileIcon.svelte";
  import { fileIconFor } from "./file-icons";
  import type { DemoFileMeta, DemoToken } from "./types";

  let {
    files,
    projectName,
    activeFile,
    lines,
    isLoading,
    error,
    openTabs,
    activePath,
    previewPath,
    currentLine,
    onActivateTab,
    onCloseTab,
    onOpenFile,
    onLineClick,
    onRetry,
  }: {
    files: DemoFileMeta[];
    projectName: string;
    activeFile: DemoFileMeta | null;
    lines: DemoToken[][] | null;
    isLoading: boolean;
    error: string | null;
    openTabs: string[];
    activePath: string | null;
    previewPath: string | null;
    currentLine: number;
    onActivateTab: (path: string) => void;
    onCloseTab: (path: string) => void;
    onOpenFile: (path: string, options?: { preview?: boolean }) => void;
    onLineClick: (line: number) => void;
    onRetry: (path: string) => void;
  } = $props();

  const openFiles = $derived(
    openTabs
      .map((path) => files.find((file) => file.path === path))
      .filter((file): file is DemoFileMeta => file !== undefined),
  );

  const breadcrumbParts = $derived(
    activeFile ? activeFile.path.split("/") : [],
  );

  let breadcrumbsEl = $state<HTMLDivElement>();
  let imageError = $state<string | null>(null);
  let imageNonce = $state(0);

  $effect(() => {
    // Keep the file name visible when a deep path overflows.
    const file = activeFile;

    if (file && breadcrumbsEl) {
      breadcrumbsEl.scrollLeft = breadcrumbsEl.scrollWidth;
    }
  });

  $effect(() => {
    // Reset the image state whenever a different file becomes active.
    activeFile?.path;

    imageError = null;
    imageNonce = 0;
  });

  function fileName(path: string): string {
    return path.split("/").pop() ?? path;
  }

  /** Turn a Shiki token into inline styles without shipping a theme runtime. */
  function tokenStyle(token: DemoToken): string {
    const styles: string[] = [];

    if (token.color) styles.push(`color:${token.color}`);

    const fontStyle = token.fontStyle ?? 0;
    if (fontStyle & 1) styles.push("font-style:italic");
    if (fontStyle & 2) styles.push("font-weight:bold");
    if (fontStyle & 4) styles.push("text-decoration:underline");

    return styles.join(";");
  }

  function lineIndent(line: DemoToken[]): number {
    const leading = line[0]?.content.match(/^\s*/)?.[0].length ?? 0;
    return Math.min(leading * 0.6, 24);
  }

  function minimapWidth(token: DemoToken): number {
    return Math.max(Math.min(token.content.trim().length * 0.55, 46), 1);
  }
</script>

<div class="editor-region">
  <div class="tabs" role="tablist" aria-label="Open Editors">
    {#each openFiles as file (file.path)}
      {@const icon = fileIconFor(file.path)}
      <div
        class="tab"
        class:active={file.path === activePath}
        class:preview={file.path === previewPath}
        role="presentation"
        onauxclick={(event) => {
          if (event.button === 1) {
            event.preventDefault();
            onCloseTab(file.path);
          }
        }}
      >
        <button
          type="button"
          class="tab-main"
          role="tab"
          aria-selected={file.path === activePath}
          onclick={() => onActivateTab(file.path)}
          ondblclick={() => onOpenFile(file.path, { preview: false })}
        >
          <FileIcon {icon} size={16} />
          <span class="tab-label">{fileName(file.path)}</span>
        </button>
        <button
          type="button"
          class="tab-close"
          title="Close"
          aria-label={`Close ${fileName(file.path)}`}
          onclick={() => onCloseTab(file.path)}
        >
          <span class="codicon codicon-close"></span>
        </button>
      </div>
    {/each}
  </div>

  {#if activeFile}
    <div class="breadcrumbs" bind:this={breadcrumbsEl} aria-label="Breadcrumbs">
      <span class="crumb">{projectName}</span>
      {#each breadcrumbParts as part, index (index)}
        <span class="codicon codicon-chevron-right crumb-sep"></span>
        <span class="crumb" class:last={index === breadcrumbParts.length - 1}>
          {part}
        </span>
      {/each}
    </div>

    {#if activeFile.kind === "image"}
      {#if imageError}
        <div class="editor-message" role="alert">
          <span class="codicon codicon-error message-icon" aria-hidden="true"
          ></span>
          <p class="message-title">
            Couldn't load {fileName(activeFile.path)}
          </p>
          <p class="message-detail">{imageError}</p>
          <button
            type="button"
            class="retry-button"
            onclick={() => {
              imageError = null;
              imageNonce += 1;
            }}
          >
            Retry
          </button>
        </div>
      {:else}
        <div class="image-preview">
          <img
            src={`${activeFile.url}?n=${imageNonce}`}
            alt={fileName(activeFile.path)}
            onload={() => (imageError = null)}
            onerror={() => (imageError = "The image could not be loaded.")}
          />
        </div>
      {/if}
    {:else if error}
      <div class="editor-message" role="alert">
        <span class="codicon codicon-error message-icon" aria-hidden="true"
        ></span>
        <p class="message-title">Couldn't load {fileName(activeFile.path)}</p>
        <p class="message-detail">{error}</p>
        <button
          type="button"
          class="retry-button"
          onclick={() => onRetry(activeFile.path)}
        >
          Retry
        </button>
      </div>
    {:else if lines}
      <div class="editor-body">
        <div class="code-scroll">
          <div class="code-lines">
            {#each lines as line, index (index)}
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div
                class="code-line"
                class:current={index === currentLine}
                onpointerdown={() => onLineClick(index)}
              >
                <span class="line-number" aria-hidden="true">{index + 1}</span>
                <span class="line-content">
                  {#each line as token, tokenIndex (tokenIndex)}
                    <span style={tokenStyle(token)}>{token.content}</span>
                  {/each}
                </span>
              </div>
            {/each}
          </div>
        </div>

        <div class="minimap" aria-hidden="true">
          <div class="minimap-slider"></div>
          {#each lines as line, index (index)}
            <div
              class="minimap-line"
              style:padding-left={`${lineIndent(line)}px`}
            >
              {#each line as token, tokenIndex (tokenIndex)}
                {#if token.content.trim()}
                  <span
                    class="minimap-token"
                    style:background={token.color ?? "#d4d4d4"}
                    style:width={`${minimapWidth(token)}px`}
                  ></span>
                {/if}
              {/each}
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="editor-message" aria-busy={isLoading}>
        <span
          class="codicon codicon-loading codicon-modifier-spin message-icon"
          aria-hidden="true"
        ></span>
        <p class="message-title">Loading {fileName(activeFile.path)}…</p>
      </div>
    {/if}
  {:else}
    <div class="watermark">
      <span class="codicon codicon-vscode watermark-logo" aria-hidden="true"
      ></span>
      <span class="watermark-title">Visual Studio Code</span>
      <span class="watermark-subtitle">Read-only project preview</span>
    </div>
  {/if}
</div>

<style>
  .editor-region {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    background: var(--vscode-editor-bg);
  }

  .tabs {
    display: flex;
    flex: none;
    height: 35px;
    overflow-x: auto;
    overflow-y: hidden;
    background: var(--vscode-sidebar-bg);
    scrollbar-width: none;
  }

  .tabs::-webkit-scrollbar {
    display: none;
  }

  .tab {
    display: flex;
    flex: none;
    align-items: center;
    max-width: 220px;
    height: 35px;
    border-top: 1px solid transparent;
    border-right: 1px solid var(--vscode-sidebar-bg);
    background: var(--vscode-tab-inactive-bg);
  }

  .tab.active {
    border-top-color: var(--vscode-accent);
    background: var(--vscode-editor-bg);
  }

  .tab-main {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    height: 100%;
    padding: 0 10px;
    color: var(--vscode-text-muted);
    cursor: pointer;
  }

  .tab.active .tab-main {
    color: var(--vscode-text-strong);
  }

  .tab-label {
    overflow: hidden;
    font-size: 13px;
    line-height: 18px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tab.preview .tab-label {
    font-style: italic;
  }

  .tab-close {
    display: grid;
    flex: none;
    place-items: center;
    width: 24px;
    height: 24px;
    margin-right: 4px;
    border-radius: 4px;
    color: var(--vscode-text-muted);
    cursor: pointer;
    opacity: 0;
  }

  .tab:hover .tab-close,
  .tab.active .tab-close,
  .tab-close:focus-visible {
    opacity: 1;
  }

  .tab-close:focus-visible {
    outline: 1px solid var(--vscode-focus);
    outline-offset: -1px;
  }

  .tab-close:hover {
    background: #ffffff1a;
    color: var(--vscode-text-strong);
  }

  .tab-close .codicon {
    font-size: 16px;
  }

  .breadcrumbs {
    display: flex;
    flex: none;
    align-items: center;
    gap: 2px;
    height: 22px;
    padding: 0 12px;
    overflow-x: auto;
    overflow-y: hidden;
    background: var(--vscode-editor-bg);
    color: #a9a9a9;
    font-size: 12px;
    scrollbar-width: none;
    white-space: nowrap;
  }

  .breadcrumbs::-webkit-scrollbar {
    display: none;
  }

  .crumb {
    flex: none;
  }

  .crumb.last {
    color: var(--vscode-text);
  }

  .crumb-sep {
    flex: none;
    color: #6f6f6f;
    font-size: 12px;
  }

  .editor-body {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .image-preview {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 0;
    overflow: auto;
    background: var(--vscode-editor-bg);
  }

  .image-preview img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .code-scroll {
    flex: 1;
    min-width: 0;
    overflow: auto;
  }

  .code-lines {
    width: max-content;
    min-width: 100%;
    padding: 8px 0;
  }

  .code-line {
    display: flex;
    min-width: 100%;
    height: 19px;
    cursor: pointer;
    font-family: var(--vscode-code-font);
    font-size: 14px;
    line-height: 19px;
    tab-size: 2;
  }

  .code-line.current {
    background: #ffffff08;
  }

  .line-number {
    position: sticky;
    left: 0;
    z-index: 1;
    flex: none;
    width: 54px;
    padding-right: 16px;
    background: var(--vscode-editor-bg);
    color: var(--vscode-line-number);
    text-align: right;
    user-select: none;
  }

  .code-line.current .line-number {
    background: #232323;
    color: #c6c6c6;
  }

  .line-content {
    flex: 1;
    padding-right: 16px;
    white-space: pre;
  }

  .minimap {
    position: relative;
    flex: none;
    width: 60px;
    padding: 4px 4px 0;
    overflow: hidden;
    background: var(--vscode-editor-bg);
  }

  .minimap-line {
    display: flex;
    gap: 1px;
    height: 2px;
    margin-bottom: 1px;
  }

  .minimap-token {
    flex: none;
    height: 2px;
    opacity: 0.55;
  }

  .minimap-slider {
    position: absolute;
    top: 4px;
    right: 0;
    left: 0;
    height: 40px;
    background: #ffffff0d;
    pointer-events: none;
  }

  .editor-message {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 24px;
    color: var(--vscode-text-muted);
    text-align: center;
    user-select: none;
  }

  .message-icon {
    font-size: 32px;
  }

  .editor-message .codicon-error {
    color: #f48771;
  }

  .message-title {
    margin: 0;
    color: var(--vscode-text);
    font-size: 13px;
  }

  .message-detail {
    max-width: 420px;
    margin: 0;
    color: var(--vscode-text-muted);
    font-size: 12px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .retry-button {
    margin-top: 4px;
    padding: 4px 14px;
    border: 1px solid var(--vscode-focus);
    border-radius: 2px;
    background: var(--vscode-accent);
    color: #ffffff;
    font-size: 12px;
    cursor: pointer;
  }

  .retry-button:hover {
    background: var(--vscode-statusbar-hover);
  }

  .watermark {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #2f2f2f;
    user-select: none;
  }

  .watermark-logo {
    font-size: 96px;
    opacity: 0.5;
  }

  .watermark-title {
    font-size: 24px;
    font-weight: 300;
  }

  .watermark-subtitle {
    font-size: 13px;
  }
</style>
