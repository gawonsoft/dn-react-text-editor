import type { Mark } from "prosemirror-model";
import type { MarkView, MarkViewConstructor } from "prosemirror-view";
import type { EditorElementAttributes, EditorMark } from "../elements";
import { renderContentDOM } from "../schema/render";

class ReactMarkView implements MarkView {
  readonly dom = document.createElement("span");
  readonly contentDOM: HTMLElement;

  constructor(mark: Mark, definition: EditorMark) {
    const rendered = renderContentDOM({
      type: definition.type,
      attributes: mark.attrs as EditorElementAttributes,
      textContent: "",
      render: definition.render,
    });
    this.dom.append(rendered.dom);
    this.contentDOM = rendered.contentDOM;
  }
}

/** Creates internal React-backed mark views for registered mark renderers. */
export function createEditorMarkViews(marks: readonly EditorMark[]) {
  return Object.fromEntries(
    marks.map((mark) => [
      mark.type,
      (value: Mark) => new ReactMarkView(value, mark),
    ]),
  ) as Record<string, MarkViewConstructor>;
}
