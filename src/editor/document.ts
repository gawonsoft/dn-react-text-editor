import {
  DOMParser,
  DOMSerializer,
  type Node as ProseMirrorNode,
} from "prosemirror-model";
import type { EditorView } from "prosemirror-view";
import { escapeHTML, sanitizeHTML } from "../sanitizer";
import type { TextEditorControllerProps } from "./types";

/** Converts controlled text or HTML into sanitized markup for ProseMirror parsing. */
export function toInnerHTML(
  value: string,
  mode: TextEditorControllerProps["mode"],
) {
  if (mode === "text") {
    return value
      .split("\n")
      .map((line) => `<p>${escapeHTML(line)}</p>`)
      .join("");
  }

  return sanitizeHTML(value);
}

/** Parses a sanitized editor value into the document node used by a transaction. */
export function parseEditorValue(
  parser: DOMParser,
  value: string,
  mode: TextEditorControllerProps["mode"],
): ProseMirrorNode {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = toInnerHTML(value, mode);
  return parser.parse(wrapper);
}

/** Serializes the current document fragment as HTML. */
export function serializeHTML(view: EditorView, serializer: DOMSerializer) {
  const container = document.createElement("div");
  container.appendChild(serializer.serializeFragment(view.state.doc.content));
  return container.innerHTML;
}

/** Extracts plain text with paragraph boundaries represented as newlines. */
export function serializeText(view: EditorView) {
  return view.state.doc.textBetween(0, view.state.doc.content.size, "\n");
}
