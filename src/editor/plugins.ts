import * as commands from "prosemirror-commands";
import type { Schema } from "prosemirror-model";
import { history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { type Plugin } from "prosemirror-state";
import type { AttachFile } from "../attach_file";
import { dragAndDropPlugin } from "../plugins/drag_and_drop";
import { buildKeymap } from "../plugins/keymap";
import { placeholderPlugin } from "../plugins/placehoder";
import { uploadPlaceholderPlugin } from "../plugins/upload_placeholder";
import type { TextEditorControllerProps } from "./types";

/** Builds the default plugin set for a high-level text editor instance. */
export function createEditorPlugins({
  schema,
  props,
  attachFile,
}: {
  schema: Schema;
  props: TextEditorControllerProps;
  attachFile: AttachFile;
}): Plugin[] {
  return [
    history({
      newGroupDelay: props.historyGroupDelay,
    }),
    keymap(buildKeymap(schema)),
    keymap(commands.baseKeymap),
    uploadPlaceholderPlugin,
    dragAndDropPlugin({ attachFile }),
    props.placeholder && placeholderPlugin(props.placeholder),
  ].filter((plugin): plugin is Plugin => Boolean(plugin));
}

/** Returns the editor DOM attributes derived from presentation-only options. */
export function createEditorAttributes(props: TextEditorControllerProps) {
  return {
    class: props.className || "",
    spellcheck: "false",
    style: props.style || "width: 100%; height: inherit; outline: none;",
  };
}
