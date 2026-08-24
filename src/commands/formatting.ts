import * as commands from "prosemirror-commands";
import type { Attrs } from "prosemirror-model";
import type { Command, EditorState } from "prosemirror-state";

export type Alignment = "left" | "center" | "right" | "justify";

function isActiveBlock(
  state: EditorState,
  nodeName: string,
  attrs?: Record<string, unknown>,
) {
  const { $from, $to } = state.selection;
  let active = false;

  state.doc.nodesBetween($from.pos, $to.pos, (node) => {
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

/** Creates a command that toggles a registered inline mark. */
export function toggleEditorMark(
  markName: string,
  attrs?: Attrs | null,
): Command {
  return (state, dispatch, view) => {
    const mark = state.schema.marks[markName];

    if (!mark) {
      return false;
    }

    view?.focus();
    return commands.toggleMark(mark, attrs)(state, dispatch, view);
  };
}

/** Toggles the built-in bold mark when it is registered. */
export const toggleBold = toggleEditorMark("bold");

/** Toggles the built-in italic mark when it is registered. */
export const toggleItalic = toggleEditorMark("italic");

/** Toggles the built-in underline mark when it is registered. */
export const toggleUnderline = toggleEditorMark("underline");

/** Toggles a heading level, restoring a paragraph when it is already active. */
export function toggleHeading(
  level: 1 | 2 | 3 | 4 | 5 | 6,
): Command {
  return (state, dispatch, view) => {
    const heading = state.schema.nodes.heading;
    const paragraph = state.schema.nodes.paragraph;

    if (!heading || !paragraph) {
      return false;
    }

    view?.focus();

    if (isActiveBlock(state, "heading", { level })) {
      return commands.setBlockType(paragraph)(state, dispatch, view);
    }

    return commands.setBlockType(heading, { level })(state, dispatch, view);
  };
}

/** Toggles alignment on the current paragraph or heading. */
export function toggleAlignment(align: Alignment): Command {
  return (state, dispatch, view) => {
    const { $from } = state.selection;
    const node = $from.node();

    if (!["paragraph", "heading"].includes(node.type.name)) {
      return false;
    }

    if (dispatch) {
      view?.focus();
      dispatch(
        state.tr.setNodeAttribute(
          $from.before(),
          "align",
          node.attrs.align === align ? null : align,
        ),
      );
    }

    return true;
  };
}
