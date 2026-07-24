import type { Transaction } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import {
  editorChangeOriginKey,
  type EditorChangeOrigin,
  type TextEditorChange,
} from "../events";

/** Applies a transaction and notifies subscribers when its document changes. */
export function dispatchEditorTransaction({
  view,
  transaction,
  nextOrigin,
  value,
  listeners,
}: {
  view: EditorView;
  transaction: Transaction;
  nextOrigin?: EditorChangeOrigin;
  value: () => string;
  listeners: ReadonlySet<(change: TextEditorChange) => void>;
}) {
  view.updateState(view.state.apply(transaction));

  if (!transaction.docChanged) {
    return;
  }

  const origin =
    (transaction.getMeta(editorChangeOriginKey) as EditorChangeOrigin | undefined) ??
    nextOrigin ??
    "user";
  const change: TextEditorChange = { value: value(), origin, docChanged: true };

  for (const listener of listeners) {
    listener(change);
  }
}