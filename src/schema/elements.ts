import type { NodeSpec } from "prosemirror-model";
import type { EditorElementAttributes, EditorNode } from "../elements";
import { renderAtomicDOM, renderContentDOM } from "./render";

/** Converts high-level atomic and container nodes into internal ProseMirror specs. */
export function createElementNodes(
  elements: readonly EditorNode[],
): Record<string, NodeSpec> {
  const nodes: Record<string, NodeSpec> = {};

  for (const element of elements) {
    if (!/^[a-z][a-z0-9_]*$/i.test(element.type) || nodes[element.type]) {
      throw new Error(
        `Invalid or duplicate editor element type: ${element.type}`,
      );
    }

    const base: NodeSpec = {
      attrs: Object.fromEntries(
        Object.entries(element.attributes).map(([name, value]) => [
          name,
          { default: value },
        ]),
      ),
      parseDOM: (Array.isArray(element.selector)
        ? element.selector
        : [element.selector]
      ).map((tag) => ({
        tag,
        // Registered element selectors must win over generic built-in marks
        // such as `a[href]` so their saved HTML round-trips to the same node.
        priority: 60,
        getAttrs: (dom: Node) => element.parse(dom as HTMLElement),
      })),
      toDOM(node) {
        if (element.kind === "atomic") {
          return renderAtomicDOM({
            type: element.type,
            attributes: node.attrs as EditorElementAttributes,
            render: element.render,
          });
        }

        return renderContentDOM({
          type: element.type,
          attributes: node.attrs as EditorElementAttributes,
          textContent: node.textContent,
          render: element.render,
        });
      },
    };

    nodes[element.type] =
      element.kind === "atomic"
        ? {
            ...base,
            atom: true,
            inline: element.display === "inline",
            group: element.display === "inline" ? "inline" : "block",
            selectable: true,
            draggable: true,
          }
        : {
            ...base,
            content: element.content,
            group: element.group,
            marks: element.marks,
            defining: element.defining,
            code: element.code,
          };
  }

  return nodes;
}
