import type { Schema } from "prosemirror-model";
import type { EditorView } from "prosemirror-view";
import type { EditorElementValue } from "../elements";

/** Inserts a registered atomic element at the current editor selection. */
export function insertEditorElement(
  view: EditorView,
  schema: Schema,
  value: EditorElementValue,
) {
  const nodeType = schema.nodes[value.type];

  if (!nodeType) {
    throw new Error(`The editor element is not registered: ${value.type}`);
  }

  view.focus();
  view.dispatch(
    view.state.tr.replaceSelectionWith(nodeType.create(value.attributes)),
  );
}
