import type { TreeNode } from "./types";

/**
 * Turn the flat file list into the nested tree the explorer renders.
 *
 * Folders come before files at every level, which matches VS Code's default
 * explorer sorting.
 */
export function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const path of paths) {
    const parts = path.split("/");
    let level = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      const isFile = index === parts.length - 1;
      const type = isFile ? "file" : "folder";
      let node = level.find((item) => item.name === part && item.type === type);

      if (!node) {
        node = isFile
          ? { name: part, path: currentPath, type: "file" }
          : { name: part, path: currentPath, type: "folder", children: [] };

        level.push(node);
      }

      if (!isFile) level = node.children ?? [];
    });
  }

  sortNodes(root);

  return root;
}

function sortNodes(nodes: TreeNode[]): void {
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  for (const node of nodes) {
    if (node.children) sortNodes(node.children);
  }
}
