import { Plugin } from "prosemirror-state";

export function trailingParagraph() {
  return new Plugin({
    appendTransaction(transactions, oldState, newState) {
      const doc = newState.doc;

      const lastNode = doc.lastChild;

      if (lastNode && lastNode.type.name !== "paragraph") {
        const paragraphType = newState.schema.nodes.paragraph;

        const tr = newState.tr;

        const endPos = doc.content.size;

        tr.insert(endPos, paragraphType.create());

        return tr;
      }

      return null;
    },
  });
}
