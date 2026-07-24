import { Schema, type SchemaSpec } from "prosemirror-model";
import { addListNodes } from "prosemirror-schema-list";
import { marks } from "./marks";
import { mediaNodes } from "./nodes/media";
import { structureNodes } from "./nodes/structure";
import { textNodes } from "./nodes/text";

/** Creates the default ProseMirror schema and merges caller-provided node and mark specs. */
export function createSchema(spec: SchemaSpec = { nodes: {}, marks: {} }) {
  const customSchema = new Schema({
    nodes: {
      ...textNodes,
      ...structureNodes,
      ...mediaNodes,
      ...(spec.nodes as Record<string, never>),
    } as unknown as SchemaSpec["nodes"],
    marks: {
      ...marks,
      ...(spec.marks as Record<string, never>),
    } as unknown as SchemaSpec["marks"],
    topNode: spec.topNode,
  });

  return new Schema({
    nodes: addListNodes(customSchema.spec.nodes, "paragraph block*", "block"),
    marks: customSchema.spec.marks,
  });
}
