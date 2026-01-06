import { Node } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { uploadPlaceholderPlugin } from "./upload_placeholder";

const getFirstChildDescendants = (view: EditorView): Node[] => {
  const nodes: Node[] = [];

  view.state.doc?.descendants((n) => {
    nodes.push(n);
  });

  return nodes;
};

export function placeholderPlugin(text: string) {
  const update = (view: EditorView) => {
    const decos = uploadPlaceholderPlugin.getState(view.state);

    if (
      (decos && decos.find().length > 0) ||
      view.state.doc.content.content.some((e) => e.type.name !== "paragraph") ||
      view.state.doc.childCount > 1 ||
      getFirstChildDescendants(view).length > 1 ||
      view.state.doc.textContent
    ) {
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
