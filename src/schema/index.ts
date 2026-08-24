import { Schema, type SchemaSpec } from "prosemirror-model";
import {
  baseEditorNodes,
  type EditorMark,
  type EditorNode,
} from "../elements";
import { createEditorMarks } from "./marks";
import { createElementNodes } from "./elements";
import { textNodes } from "./nodes/text";

/** Creates the default ProseMirror schema from the registered high-level elements. */
export function createSchema(
  nodes: readonly EditorNode[] = baseEditorNodes,
  marks: readonly EditorMark[] = [],
) {
  return new Schema({
    nodes: {
      ...textNodes,
      ...createElementNodes(nodes),
    } as unknown as SchemaSpec["nodes"],
    marks: createEditorMarks(marks) as unknown as SchemaSpec["marks"],
  });
}
