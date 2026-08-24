import * as commands from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { type Plugin } from "prosemirror-state";
import { placeholderPlugin } from "../plugins/placeholder";
import type { TextEditorControllerProps } from "./types";

/** Builds the default plugin set for a high-level text editor instance. */
export function createEditorPlugins({
  props,
}: {
  props: TextEditorControllerProps;
}): Plugin[] {
  return [
    ...(props.plugins ?? []),
    keymap(commands.baseKeymap),
    props.placeholder && placeholderPlugin(props.placeholder),
  ].filter((plugin): plugin is Plugin => Boolean(plugin));
}

/** Returns the editor DOM attributes derived from presentation-only options. */
export function createEditorAttributes(props: TextEditorControllerProps) {
  return {
    class: ["gw-rich-text-editor", props.className].filter(Boolean).join(" "),
    spellcheck: "false",
    style: props.style || "width: 100%; height: inherit; outline: none;",
  };
}
