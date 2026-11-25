import type { APIRoute, GetStaticPaths } from "astro";
import { demoEntries } from "../../../lib/vscode-demo/manifest";
import type { DemoTextEntry } from "../../../lib/vscode-demo/manifest";
import { tokenizeDemoEntry } from "../../../lib/vscode-demo/tokenize";

// One static JSON file per demo text file. The browser fetches these on demand.
export const prerender = true;

// Only the paths listed here are generated, so each one carries its entry
// instead of looking it up again in GET.
export const getStaticPaths = (() =>
  demoEntries
    .filter((entry) => entry.kind === "text")
    .map((entry) => ({
      params: { id: entry.id },
      props: { entry },
    }))) satisfies GetStaticPaths;

export const GET: APIRoute<{ entry: DemoTextEntry }> = async ({ props }) => {
  return Response.json({ lines: await tokenizeDemoEntry(props.entry) });
};
