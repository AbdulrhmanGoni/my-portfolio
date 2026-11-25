<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import ActivityBar from "./ActivityBar.svelte";
  import Editor from "./Editor.svelte";
  import Explorer from "./Explorer.svelte";
  import MenuBar from "./MenuBar.svelte";
  import StatusBar from "./StatusBar.svelte";
  import type { DemoFileMeta, DemoToken } from "./types";

  let { files, projectName }: { files: DemoFileMeta[]; projectName: string } =
    $props();

  let activePath = $state<string | null>(null);
  let openTabs = $state<string[]>([]);
  let previewPath = $state<string | null>(null);
  let expanded = $state<Set<string>>(new Set<string>());
  let currentLine = $state(0);

  let loadedLines = $state<Record<string, DemoToken[][]>>({});
  let loadingPaths = $state<Record<string, boolean>>({});
  let loadErrors = $state<Record<string, string | null>>({});
  const inflight = new Map<string, Promise<void>>();
  const lifecycle = new AbortController();

  const activeFile = $derived(
    activePath === null
      ? null
      : (files.find((file) => file.path === activePath) ?? null),
  );

  const activeLines = $derived(
    activePath === null ? null : (loadedLines[activePath] ?? null),
  );

  const activeLoading = $derived(
    activePath === null ? false : (loadingPaths[activePath] ?? false),
  );

  const activeError = $derived(
    activePath === null ? null : (loadErrors[activePath] ?? null),
  );

  onMount(() => {
    // Tell the desktop that the app window is ready. Keep the message in sync
    // with src/scripts/windows/embedded-app.ts.
    if (window.parent !== window) {
      window.parent.postMessage("embedded-app-ready", window.location.origin);
    }
  });

  onDestroy(() => {
    lifecycle.abort();
  });

  async function loadFile(path: string): Promise<void> {
    if (loadedLines[path]) return;

    const existing = inflight.get(path);
    if (existing) return existing;

    const meta = files.find((file) => file.path === path);
    if (!meta) {
      loadErrors[path] = "This file is not part of the demo project.";
      return;
    }

    // Images are rendered straight from their URL by Editor; there is no JSON
    // to fetch. The empty array is only a "this file is ready" marker.
    if (meta.kind === "image") {
      loadedLines[path] = [];
      return;
    }

    loadingPaths[path] = true;
    loadErrors[path] = null;

    const request = (async () => {
      try {
        const response = await fetch(meta.url, { signal: lifecycle.signal });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}.`);
        }

        const data = (await response.json()) as { lines?: DemoToken[][] };
        if (!Array.isArray(data.lines)) {
          throw new Error("The token data for this file is malformed.");
        }

        loadedLines[path] = data.lines;
      } catch (error) {
        if (lifecycle.signal.aborted) return;

        loadErrors[path] =
          error instanceof Error ? error.message : "Failed to load this file.";
      } finally {
        if (!lifecycle.signal.aborted) loadingPaths[path] = false;
        inflight.delete(path);
      }
    })();

    inflight.set(path, request);
    return request;
  }

  function openFile(path: string, options: { preview?: boolean } = {}) {
    const preview = options.preview ?? false;

    if (preview) {
      const previousPreview = previewPath;

      if (openTabs.includes(path)) {
        if (previousPreview && previousPreview !== path) {
          openTabs = openTabs.filter((tab) => tab !== previousPreview);
          previewPath = null;
        }
      } else {
        if (previousPreview && previousPreview !== path) {
          const previewIndex = openTabs.indexOf(previousPreview);

          if (previewIndex !== -1) {
            const nextTabs = [...openTabs];
            nextTabs[previewIndex] = path;
            openTabs = nextTabs;
          } else {
            openTabs = [...openTabs, path];
          }
        } else {
          openTabs = [...openTabs, path];
        }

        previewPath = path;
      }
    } else {
      if (!openTabs.includes(path)) openTabs = [...openTabs, path];
      previewPath = null;
    }

    activePath = path;
    currentLine = 0;
    void loadFile(path);
  }

  function activateTab(path: string) {
    activePath = path;
    currentLine = 0;
    void loadFile(path);
  }

  function closeTab(path: string) {
    const index = openTabs.indexOf(path);
    if (index === -1) return;

    const nextTabs = openTabs.filter((tab) => tab !== path);
    openTabs = nextTabs;

    if (previewPath === path) previewPath = null;
    if (activePath !== path) return;

    const nextPath = nextTabs[index] ?? nextTabs[index - 1] ?? null;
    activePath = nextPath;
    currentLine = 0;

    if (nextPath) void loadFile(nextPath);
  }

  function toggleFolder(path: string) {
    const next = new Set(expanded);

    if (next.has(path)) next.delete(path);
    else next.add(path);

    expanded = next;
  }

  function retryFile(path: string) {
    void loadFile(path);
  }
</script>

<main class="workbench">
  <MenuBar />

  <div class="workbench-body">
    <ActivityBar />
    <Explorer
      {files}
      {projectName}
      {expanded}
      {activePath}
      onToggleFolder={toggleFolder}
      onOpenFile={openFile}
    />
    <Editor
      {files}
      {projectName}
      {activeFile}
      lines={activeLines}
      isLoading={activeLoading}
      error={activeError}
      {openTabs}
      {activePath}
      {previewPath}
      {currentLine}
      onActivateTab={activateTab}
      onCloseTab={closeTab}
      onOpenFile={openFile}
      onLineClick={(line) => (currentLine = line)}
      onRetry={retryFile}
    />
  </div>

  <StatusBar {activeFile} {currentLine} />
</main>

<style>
  .workbench {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100dvh;
    overflow: hidden;
    background: var(--vscode-editor-bg);
  }

  .workbench-body {
    display: flex;
    flex: 1;
    min-height: 0;
  }
</style>
