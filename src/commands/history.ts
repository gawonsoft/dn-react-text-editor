import { redo as redoHistory, undo as undoHistory } from "prosemirror-history";
import type { EditorView } from "prosemirror-view";

/** Applies the latest undoable editor transaction. */
export function undo(view: EditorView) {
  view.focus();
  undoHistory(view.state, view.dispatch);
}

/** Reapplies the latest undone editor transaction. */
export function redo(view: EditorView) {
  view.focus();
  redoHistory(view.state, view.dispatch);
}
