import type { MarkSpec } from "prosemirror-model";
import type { EditorElementAttributes, EditorMark } from "../elements";
import { renderContentDOM } from "./render";

/** Converts high-level marks into the internal ProseMirror mark specs. */
export function createEditorMarks(
  marks: readonly EditorMark[],
): Record<string, MarkSpec> {
  return Object.fromEntries(
    marks.map((mark) => [
      mark.type,
      {
        attrs: Object.fromEntries(
          Object.entries(mark.attributes).map(([name, value]) => [
            name,
            { default: value },
          ]),
        ),
        inclusive: mark.inclusive,
        parseDOM: mark.selectors.map((tag) => ({
          tag,
          getAttrs: (dom: Node) => mark.parse(dom as HTMLElement),
        })),
        toDOM(value) {
          return renderContentDOM({
            type: mark.type,
            attributes: value.attrs as EditorElementAttributes,
            textContent: "",
            render: mark.render,
          });
        },
      } satisfies MarkSpec,
    ]),
  );
}
