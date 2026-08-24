import * as commands from "prosemirror-commands";
import type { Attrs } from "prosemirror-model";
import { wrapInList } from "prosemirror-schema-list";
import type { Command, EditorState } from "prosemirror-state";

function isActiveBlock(
  state: EditorState,
  nodeName: string,
  attrs?: Attrs | null,
) {
  const { from, to, $from } = state.selection;
  const matches = (node: import("prosemirror-model").Node) =>
    node.type.name === nodeName &&
    Object.entries(attrs ?? {}).every(
      ([name, value]) => node.attrs[name] === value,
    );

  if (from === to) {
    return matches($from.parent);
  }

  let active = false;
  state.doc.nodesBetween(from, to, (node) => {
    active ||= matches(node);
  });

  return active;
}

/** Inserts or toggles a link at the current selection. */
export function link(href?: string): Command {
  return (state, dispatch, view) => {
    const linkMark = state.schema.marks.link;

    if (!linkMark) {
      return false;
    }

    const target = href || prompt("URL을 입력하세요");

    if (!target) {
      return false;
    }

    view?.focus();
    const { from, to } = state.selection;
    if (from === to) {
      dispatch?.(
        state.tr.insert(
          from,
          state.schema.text(target, [linkMark.create({ href: target })]),
        ),
      );
      return true;
    }

    return commands.toggleMark(linkMark, { href: target })(
      state,
      dispatch,
      view,
    );
  };
}

/** Wraps the current selection in the requested list type. */
export function toggleList(
  type: "bullet_list" | "ordered_list",
): Command {
  return (state, dispatch, view) => {
    const listType = state.schema.nodes[type];

    if (!listType) {
      return false;
    }

    view?.focus();
    return wrapInList(listType)(state, dispatch, view);
  };
}

/** Wraps the current selection in a bullet list. */
export const toggleBulletList = toggleList("bullet_list");

/** Wraps the current selection in an ordered list. */
export const toggleOrderedList = toggleList("ordered_list");

/** Changes the selected text blocks to a registered node type. */
export function setBlockType(
  nodeName: string,
  attrs?: Attrs | null,
): Command {
  return (state, dispatch, view) => {
    const nodeType = state.schema.nodes[nodeName];

    if (!nodeType) {
      return false;
    }

    view?.focus();
    return commands.setBlockType(nodeType, attrs)(state, dispatch, view);
  };
}

/** Toggles a registered text block, restoring a paragraph when active. */
export function toggleBlockType(
  nodeName: string,
  attrs?: Attrs | null,
): Command {
  return (state, dispatch, view) => {
    if (isActiveBlock(state, nodeName, attrs)) {
      return setBlockType("paragraph")(state, dispatch, view);
    }

    return setBlockType(nodeName, attrs)(state, dispatch, view);
  };
}

/** Wraps the current selection in a registered container node. */
export function wrapInNode(
  nodeName: string,
  attrs?: Attrs | null,
): Command {
  return (state, dispatch, view) => {
    const nodeType = state.schema.nodes[nodeName];

    if (!nodeType) {
      return false;
    }

    view?.focus();
    return commands.wrapIn(nodeType, attrs)(state, dispatch, view);
  };
}

/** Converts the current block into a code block. */
export const setCodeBlock = setBlockType("code_block");

/** Replaces the document with its empty default content. */
export const clear: Command = (state, dispatch) => {
  dispatch?.(
    state.tr.replaceWith(
      0,
      state.doc.content.size,
      state.schema.nodes.doc.createAndFill()!,
    ),
  );
  return true;
};
