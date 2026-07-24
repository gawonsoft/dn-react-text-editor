import { createElement, createRef } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import type { Mark } from "prosemirror-model";
import type { MarkView, MarkViewConstructor } from "prosemirror-view";
import type {
  EditorContentSlot,
  EditorElementAttributes,
  EditorMark,
} from "../elements";

class ReactMarkView implements MarkView {
  readonly dom = document.createElement("span");
  contentDOM?: HTMLElement;
  readonly #root: Root;

  constructor(mark: Mark, definition: EditorMark) {
    this.#root = createRoot(this.dom);
    const slotRef = createRef<HTMLElement>();
    const Content: EditorContentSlot = ({ as = "span" } = {}) =>
      createElement(as, { ref: slotRef });

    flushSync(() => {
      this.#root.render(
        definition.render?.(mark.attrs as EditorElementAttributes, Content),
      );
    });
    this.contentDOM = slotRef.current || undefined;
  }

  destroy() {
    this.#root.unmount();
  }
}

/** Creates internal React-backed mark views for registered mark renderers. */
export function createEditorMarkViews(marks: readonly EditorMark[]) {
  return Object.fromEntries(
    marks
      .filter((mark) => mark.render)
      .map((mark) => [
        mark.type,
        (value: Mark) => new ReactMarkView(value, mark),
      ]),
  ) as Record<string, MarkViewConstructor>;
}
