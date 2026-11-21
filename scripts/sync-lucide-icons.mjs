#!/usr/bin/env node

// Vendor the Lucide icons used by the denokv-gui-client UI as plain Svelte
// components that render literal SVG markup.
//
// The application only needs the SVG geometry, not Lucide's icon renderer,
// icon data objects or per-icon wrapper components. Generating self-contained
// components keeps the runtime bundle free of that machinery.
//
// The generated files are committed. Re-run this script after upgrading
// @lucide/svelte to refresh them.
//
// Usage:
//   pnpm sync:lucide-icons

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// `source` is the icon slug inside @lucide/svelte/icons, `component` is the
// file name used by the app. Aliases (circle-alert, notepad-text) are kept on
// their app-side names so existing imports stay unchanged.
const ICONS = [
  { source: "arrow-left", component: "ArrowLeftIcon" },
  { source: "arrow-left-from-line", component: "ArrowLeftFromLineIcon" },
  { source: "arrow-right", component: "ArrowRightIcon" },
  { source: "atom", component: "AtomIcon" },
  { source: "calendar-clock", component: "CalendarClockIcon" },
  { source: "calendar-fold", component: "CalendarFoldIcon" },
  { source: "calendar-sync", component: "CalendarSyncIcon" },
  { source: "check", component: "CheckIcon" },
  { source: "chevron-down", component: "ChevronDownIcon" },
  { source: "circle-alert", component: "CircleAlertIcon" },
  { source: "circle-off", component: "CircleOffIcon" },
  { source: "circle-plus", component: "CirclePlusIcon" },
  { source: "clipboard-copy", component: "ClipboardCopyIcon" },
  { source: "copy", component: "CopyIcon" },
  { source: "database", component: "DatabaseIcon" },
  { source: "database-plus", component: "DatabasePlusIcon" },
  { source: "download", component: "DownloadIcon" },
  { source: "ellipsis", component: "EllipsisIcon" },
  { source: "ellipsis-vertical", component: "EllipsisVerticalIcon" },
  { source: "eye", component: "EyeIcon" },
  { source: "file", component: "FileIcon" },
  { source: "file-braces", component: "FileBracesIcon" },
  { source: "file-key", component: "FileKeyIcon" },
  { source: "file-pen-line", component: "FilePenIcon" },
  { source: "file-plus", component: "FilePlusIcon" },
  { source: "file-symlink", component: "FileSymlinkIcon" },
  { source: "folder-open", component: "OpenPathIcon" },
  { source: "funnel", component: "FunnelIcon" },
  { source: "funnel-plus", component: "FunnelPlusIcon" },
  { source: "funnel-x", component: "FunnelXIcon" },
  { source: "globe", component: "GlobeIcon" },
  { source: "gpu", component: "GPUIcon" },
  { source: "hard-drive", component: "HardDriveIcon" },
  { source: "hard-drive-download", component: "HardDriveDownloadIcon" },
  { source: "link", component: "LinkIcon" },
  { source: "loader", component: "LoaderIcon" },
  { source: "message-square-plus", component: "MessageSquarePlusIcon" },
  { source: "monitor-cog", component: "MonitorCogIcon" },
  { source: "moon", component: "MoonIcon" },
  { source: "notepad-text", component: "NotesIcon" },
  { source: "palette", component: "PaletteIcon" },
  { source: "pencil", component: "PencilIcon" },
  { source: "pencil-line", component: "PencilLineIcon" },
  { source: "plug-zap", component: "PlugZapIcon" },
  { source: "plus", component: "PlusIcon" },
  { source: "rotate-cw", component: "RotateCwIcon" },
  { source: "save", component: "SaveIcon" },
  { source: "scan-text", component: "ScanTextIcon" },
  { source: "search", component: "SearchIcon" },
  { source: "search-check", component: "SearchCheckIcon" },
  { source: "server", component: "ServerIcon" },
  { source: "settings", component: "SettingsIcon" },
  { source: "square-arrow-out-up-right", component: "SquareArrowOutUpRightIcon" },
  { source: "square-pen", component: "SquarePenIcon" },
  { source: "sun", component: "SunIcon" },
  { source: "tags", component: "TagsIcon" },
  { source: "trash", component: "TrashIcon" },
  { source: "x", component: "XIcon" },
];

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const lucideDirectory = path.join(
  projectDirectory,
  "node_modules/@lucide/svelte",
);
const iconsDirectory = path.resolve(
  projectDirectory,
  "src/components/denokv-gui-client/icons",
);

function readLucideVersion() {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(lucideDirectory, "package.json"), "utf8"),
  );

  return packageJson.version;
}

// Some icon modules only re-export another module (for example circle-alert
// points at circle-exclamation-point). Follow those re-exports until a module
// with icon data is found.
function resolveIconSource(slug, seen = new Set()) {
  const iconPath = path.join(lucideDirectory, "dist/icons", `${slug}.svelte`);
  const modulePath = path.join(lucideDirectory, "dist/icons", `${slug}.js`);

  if (!fs.existsSync(iconPath) && !fs.existsSync(modulePath)) {
    throw new Error(`Lucide icon "${slug}" does not exist`);
  }

  const source = fs.readFileSync(
    fs.existsSync(iconPath) ? iconPath : modulePath,
    "utf8",
  );
  const iconDataMatch = source.match(
    /export const __iconData = (\{.*?\});/s,
  );

  if (iconDataMatch) {
    return JSON.parse(iconDataMatch[1]);
  }

  const reExportMatch = source.match(
    /export \{ default \} from "\.\/([^"]+)\.svelte";/,
  );

  if (!reExportMatch) {
    throw new Error(`Lucide icon "${slug}" does not expose icon data`);
  }

  if (seen.has(slug)) {
    throw new Error(`Lucide icon "${slug}" re-exports itself`);
  }

  seen.add(slug);

  return resolveIconSource(reExportMatch[1], seen);
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderChild([tag, attributes, children]) {
  const serializedAttributes = Object.entries(attributes)
    .map(([name, value]) => `${name}="${escapeAttribute(value)}"`)
    .join(" ");

  if (children === undefined) {
    return `  <${tag} ${serializedAttributes} />`;
  }

  return `  <${tag} ${serializedAttributes}>${escapeText(children)}</${tag}>`;
}

function renderComponent(iconData, version) {
  if (iconData.size !== 24) {
    throw new Error(
      `Expected a 24px icon, got "${iconData.name}" at ${iconData.size}px`,
    );
  }

  const children = iconData.node.map(renderChild).join("\n");

  return `<script lang="ts">
  // Extracted from Lucide v${version} (ISC). See ./LICENSE.
  let { size = 24 }: { size?: number } = $props();
</script>

<svg
  class="app-icon"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  aria-hidden="true"
>
${children}
</svg>
`;
}

function main() {
  const version = readLucideVersion();

  fs.mkdirSync(iconsDirectory, { recursive: true });

  for (const icon of ICONS) {
    const iconData = resolveIconSource(icon.source);
    const contents = renderComponent(iconData, version);
    const outputPath = path.join(iconsDirectory, `${icon.component}.svelte`);

    fs.writeFileSync(outputPath, contents);
  }

  console.log(
    `[lucide-icons] Wrote ${ICONS.length} icons from Lucide v${version} to ${path.relative(process.cwd(), iconsDirectory)}.`,
  );
}

try {
  main();
} catch (error) {
  console.error(`[lucide-icons] ${error.message}`);
  process.exitCode = 1;
}
