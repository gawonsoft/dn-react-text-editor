import type { NodeSpec } from "prosemirror-model";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import type { EditorElementAttributes, EditorNode } from "../elements";

function renderAtomicElement(
  element: Extract<EditorNode, { kind: "atomic" }>,
  attributes: EditorElementAttributes,
) {
  const host = document.createElement("div");
  const root = createRoot(host);
  flushSync(() => root.render(element.render!(attributes)));

  if (host.childElementCount !== 1 || host.childNodes.length !== 1) {
    flushSync(() => root.unmount());
    throw new Error(
      `The render-only element "${element.type}" must return exactly one root HTML element.`,
    );
  }

  const rendered = host.firstElementChild!.cloneNode(true);
  flushSync(() => root.unmount());
  return rendered;
}

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
          if (!element.serialize) {
            return renderAtomicElement(
              element,
              node.attrs as EditorElementAttributes,
            );
          }

          const html = element.serialize(
            node.attrs as EditorElementAttributes,
            { textContent: node.textContent },
          );
          return html.content === undefined
            ? [html.tag, html.attributes || {}]
            : [html.tag, html.attributes || {}, html.content];
        }

        const html = element.serialize(node.attrs as EditorElementAttributes, {
          textContent: node.textContent,
        });

        return element.contentTag
          ? [html.tag, html.attributes || {}, [element.contentTag, 0]]
          : [html.tag, html.attributes || {}, 0];
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
