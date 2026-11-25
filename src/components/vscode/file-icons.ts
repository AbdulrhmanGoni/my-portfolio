// Glyphs from VS Code's Seti file icon font, which ships with VS Code under
// the MIT license. The font itself is vendored at src/assets/vscode/seti.woff.
// Seti has no Astro glyph, so Astro files use the Astro mark as an inline SVG.

export type SetiIcon = {
  character: string;
  color: string;
};

export type SvgIcon = {
  path: string;
  viewBox: string;
  color: string;
  size?: number;
};

export type FileIcon = SetiIcon | SvgIcon;

export const setiIcons = {
  default: { character: "\uE023", color: "#d4d7d6" },
  info: { character: "\uE04D", color: "#519aba" },
  markdown: { character: "\uE060", color: "#519aba" },
  json: { character: "\uE055", color: "#cbcb41" },
  typescript: { character: "\uE099", color: "#519aba" },
  css: { character: "\uE01D", color: "#519aba" },
  html: { character: "\uE048", color: "#e34e2a" },
  svelte: { character: "\uE090", color: "#cc3e44" },
  sql: { character: "\uE022", color: "#f55385" },
  yaml: { character: "\uE0A7", color: "#a074c4" },
  shell: { character: "\uE089", color: "#8dc149" },
  xml: { character: "\uE0A5", color: "#e37933" },
  svg: { character: "\uE091", color: "#a074c4" },
  javascript: { character: "\uE051", color: "#cbcb41" },
  license: { character: "\uE05A", color: "#cbcb41" },
  changelog: { character: "\uE012", color: "#519aba" },
  npm: { character: "\uE067", color: "#cc3e44" },
  image: { character: "\uE04C", color: "#a074c4" },
} satisfies Record<string, SetiIcon>;

const astroIcon: SvgIcon = {
  path: "M8.358 20.162c-1.186-1.07-1.532-3.316-1.038-4.944.856 1.026 2.043 1.352 3.272 1.535 1.897.283 3.76.177 5.522-.678.202-.098.388-.229.608-.36.166.473.209.95.151 1.437-.14 1.185-.738 2.1-1.688 2.794-.38.277-.782.525-1.175.787-1.205.804-1.531 1.747-1.078 3.119l.044.148a3.158 3.158 0 0 1-1.407-1.188 3.31 3.31 0 0 1-.544-1.815c-.004-.32-.004-.642-.048-.958-.106-.769-.472-1.113-1.161-1.133-.707-.02-1.267.411-1.415 1.09-.012.053-.028.104-.045.165h.002zm-5.961-4.445s3.24-1.575 6.49-1.575l2.451-7.565c.092-.366.36-.614.662-.614.302 0 .57.248.662.614l2.45 7.565c3.85 0 6.491 1.575 6.491 1.575L16.088.727C15.93.285 15.663 0 15.303 0H8.697c-.36 0-.615.285-.784.727l-5.516 14.99z",
  viewBox: "0 0 24 24",
  color: "#7a00ff",
  size: 14,
};

/** Pick the icon VS Code would show for a file in the demo project. */
export function fileIconFor(path: string): FileIcon {
  const name = path.split("/").pop()?.toLowerCase() ?? "";

  if (name.startsWith("readme")) return setiIcons.info;
  if (name.startsWith("changelog")) return setiIcons.changelog;
  if (name.startsWith("license")) return setiIcons.license;
  if (name === ".npmrc") return setiIcons.npm;

  const extension = name.includes(".")
    ? name.slice(name.lastIndexOf(".") + 1)
    : "";

  switch (extension) {
    case "ts":
    case "tsx":
    case "mts":
    case "cts":
      return setiIcons.typescript;
    case "js":
    case "mjs":
    case "cjs":
      return setiIcons.javascript;
    case "svelte":
      return setiIcons.svelte;
    case "astro":
      return astroIcon;
    case "sql":
      return setiIcons.sql;
    case "yaml":
    case "yml":
      return setiIcons.yaml;
    case "sh":
    case "bash":
      return setiIcons.shell;
    case "xml":
      return setiIcons.xml;
    case "svg":
      return setiIcons.svg;
    case "html":
      return setiIcons.html;
    case "css":
      return setiIcons.css;
    case "json":
      return setiIcons.json;
    case "md":
    case "mdx":
      return setiIcons.markdown;
    case "png":
      return setiIcons.image;
    default:
      return setiIcons.default;
  }
}
