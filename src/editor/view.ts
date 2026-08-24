import type { DOMParser, Schema } from "prosemirror-model";
import { EditorState, type Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import type { EditorMark, EditorNode } from "../elements";
import { parseEditorValue } from "./document";
import { createElementNodeViews } from "./element_views";
import { createEditorMarkViews } from "./mark_views";
import { createEditorAttributes, createEditorPlugins } from "./plugins";
import type { TextEditorControllerProps } from "./types";

/** Creates the mounted ProseMirror view from the controller's high-level configuration. */
export function createEditorView({
  mount,
  schema,
  parser,
  props,
  nodes,
  marks,
  dispatchTransaction,
}: {
  mount: HTMLElement;
  schema: Schema;
  parser: DOMParser;
  props: TextEditorControllerProps;
  nodes: readonly EditorNode[];
  marks: readonly EditorMark[];
  dispatchTransaction: (transaction: Transaction) => void;
}) {
  return new EditorView(
    { mount },
    {
      attributes: () => createEditorAttributes(props),
      nodeViews: createElementNodeViews(nodes),
      markViews: createEditorMarkViews(marks),
      state: EditorState.create({
        schema,
        doc: parseEditorValue(parser, props.defaultValue || "", props.mode),
        plugins: createEditorPlugins({ props }),
      }),
      dispatchTransaction,
    },
  );
}
