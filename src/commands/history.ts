import { redo as redoHistory, undo as undoHistory } from "prosemirror-history";
import type { Command } from "prosemirror-state";

/** Applies the latest undoable editor transaction. */
export const undo: Command = (state, dispatch, view) => {
  view?.focus();
  return undoHistory(state, dispatch, view);
};

/** Reapplies the latest undone editor transaction. */
export const redo: Command = (state, dispatch, view) => {
  view?.focus();
  return redoHistory(state, dispatch, view);
};
