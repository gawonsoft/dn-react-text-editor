import { Node } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";

function getDescendants(view: EditorView) {
  const nodes: Node[] = [];
  view.state.doc.descendants((node) => {
    nodes.push(node);
  });
  return nodes;
}

/** Creates a plugin that exposes placeholder text on an empty editor DOM. */
export function placeholderPlugin(text: string) {
  const update = (view: EditorView) => {
    const blocksPlaceholder = view.dom.querySelector(
      '[data-editor-placeholder-blocking="true"]',
    );
    const hasContent =
      blocksPlaceholder ||
      view.state.doc.content.content.some(
        (node) => node.type.name !== "paragraph",
      ) ||
      view.state.doc.childCount > 1 ||
      getDescendants(view).length > 1 ||
      view.state.doc.textContent;

    if (hasContent) {
      view.dom.removeAttribute("data-placeholder");
    } else {
      view.dom.setAttribute("data-placeholder", text);
    }
  };

  return new Plugin({
    view(view) {
      update(view);
      return { update };
    },
  });
}
