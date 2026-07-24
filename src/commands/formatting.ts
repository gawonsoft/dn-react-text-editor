import * as commands from "prosemirror-commands";
import type { EditorView } from "prosemirror-view";

export type Alignment = "left" | "center" | "right" | "justify";

function isActiveBlock(
  view: EditorView,
  nodeName: string,
  attrs?: Record<string, unknown>,
) {
  const { $from, $to } = view.state.selection;
  let active = false;

  view.state.doc.nodesBetween($from.pos, $to.pos, (node) => {
    if (node.type.name !== nodeName) {
      return;
    }

    if (
      !attrs ||
      Object.keys(attrs).every((key) => node.attrs[key] === attrs[key])
    ) {
      active = true;
    }
  });

  return active;
}

/** Toggles an inline mark on the current selection. */
export function toggleMark(
  view: EditorView,
  markName: "bold" | "italic" | "underline",
) {
  view.focus();
  commands.toggleMark(view.state.schema.marks[markName])(
    view.state,
    view.dispatch,
  );
}

/** Toggles a heading level, restoring a paragraph when it is already active. */
export function toggleHeading(view: EditorView, level: 1 | 2 | 3 | 4 | 5 | 6) {
  view.focus();
  const heading = view.state.schema.nodes.heading;

  if (isActiveBlock(view, "heading", { level })) {
    commands.setBlockType(view.state.schema.nodes.paragraph)(
      view.state,
      view.dispatch,
    );
    return;
  }

  commands.setBlockType(heading, { level })(view.state, view.dispatch);
}

/** Toggles alignment on the current paragraph or heading. */
export function toggleAlignment(view: EditorView, align: Alignment) {
  view.focus();
  const { $from } = view.state.selection;
  const node = $from.node();

  if (!["paragraph", "heading"].includes(node.type.name)) {
    return;
  }

  view.dispatch(
    view.state.tr.setNodeAttribute(
      $from.before(),
      "align",
      node.attrs.align === align ? null : align,
    ),
  );
}
