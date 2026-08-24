import type { EditorMark, EditorNode } from "./types";
import { defaultEditorElements } from "./builtins";
import { defaultEditorContainers, paragraphElement } from "./structures";
import { defaultEditorMarks } from "./marks";

/** Fundamental editable nodes used by the minimal text editor. */
export const baseEditorNodes: readonly EditorNode[] = [paragraphElement];

/** Atomic and container nodes included by the rich editor preset. */
export const defaultEditorNodes: readonly EditorNode[] = [
  ...defaultEditorContainers,
  ...defaultEditorElements,
];

/** Merges nodes into a chosen base registry, allowing same-type overrides. */
export function resolveEditorNodes(
  nodes: readonly EditorNode[] = [],
  defaults: readonly EditorNode[] = baseEditorNodes,
) {
  const registry = new Map<string, EditorNode>();
  for (const node of defaults) registry.set(node.type, node);
  for (const node of nodes) registry.set(node.type, node);
  return [...registry.values()];
}

/** Merges marks into a chosen base registry, allowing same-type overrides. */
export function resolveEditorMarks(
  marks: readonly EditorMark[] = [],
  defaults: readonly EditorMark[] = [],
) {
  const registry = new Map<string, EditorMark>();
  for (const mark of defaults) registry.set(mark.type, mark);
  for (const mark of marks) registry.set(mark.type, mark);
  return [...registry.values()];
}
