import type { EditorMark, EditorNode } from "./types";
import { defaultEditorElements } from "./builtins";
import { defaultEditorContainers } from "./structures";
import { defaultEditorMarks } from "./marks";

/** Default atomic and container nodes available in every editor instance. */
export const defaultEditorNodes: readonly EditorNode[] = [
  ...defaultEditorContainers,
  ...defaultEditorElements,
];

/** Merges user nodes into the defaults, allowing same-type overrides. */
export function resolveEditorNodes(nodes: readonly EditorNode[] = []) {
  const registry = new Map<string, EditorNode>();
  for (const node of defaultEditorNodes) registry.set(node.type, node);
  for (const node of nodes) registry.set(node.type, node);
  return [...registry.values()];
}

/** Merges user marks into the defaults, allowing same-type overrides. */
export function resolveEditorMarks(marks: readonly EditorMark[] = []) {
  const registry = new Map<string, EditorMark>();
  for (const mark of defaultEditorMarks) registry.set(mark.type, mark);
  for (const mark of marks) registry.set(mark.type, mark);
  return [...registry.values()];
}
