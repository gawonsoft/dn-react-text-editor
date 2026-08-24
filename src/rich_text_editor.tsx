import { history as historyPlugin } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import type { Plugin } from "prosemirror-state";
import {
  defaultEditorMarks,
  defaultEditorNodes,
  resolveEditorMarks,
  resolveEditorNodes,
} from "./elements";
import {
  fileAttachmentPlugin,
  type FileAttachmentOptions,
} from "./plugins/file_attachment";
import { buildKeymap } from "./plugins/keymap";
import { TextEditor, type TextEditorProps } from "./text_editor";

export type RichTextEditorProps = TextEditorProps & {
  /** Set to false to omit undo history from the rich preset. */
  history?: false | { newGroupDelay?: number };
  /** Set to false to omit file drops and attachment commands. */
  fileAttachments?: false | FileAttachmentOptions;
};

/**
 * Adds the built-in rich schema, history, key bindings, and file attachments
 * to the minimal TextEditor component.
 */
export function RichTextEditor({
  nodes,
  marks,
  plugins,
  history = {},
  fileAttachments = {},
  ...props
}: RichTextEditorProps) {
  const presetPlugins: Array<Plugin | false> = [
    history !== false &&
      historyPlugin({ newGroupDelay: history.newGroupDelay }),
    keymap(buildKeymap()),
    fileAttachments !== false && fileAttachmentPlugin(fileAttachments),
    ...(plugins ?? []),
  ];

  return (
    <TextEditor
      {...props}
      nodes={resolveEditorNodes(nodes, defaultEditorNodes)}
      marks={resolveEditorMarks(marks, defaultEditorMarks)}
      plugins={presetPlugins.filter((plugin): plugin is Plugin => Boolean(plugin))}
    />
  );
}
