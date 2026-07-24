import * as commands from "prosemirror-commands";
import { wrapInList } from "prosemirror-schema-list";
import type { EditorView } from "prosemirror-view";

/** Inserts or toggles a link at the current selection. */
export function link(view: EditorView, href?: string) {
  view.focus();
  const target = href || prompt("URL을 입력하세요");

  if (!target) {
    return;
  }

  const { from, to } = view.state.selection;
  if (from === to) {
    view.dispatch(
      view.state.tr.insert(
        from,
        view.state.schema.text(target, [
          view.state.schema.marks.link.create({ href: target }),
        ]),
      ),
    );
    return;
  }

  commands.toggleMark(view.state.schema.marks.link, { href: target })(
    view.state,
    view.dispatch,
  );
}

/** Wraps the current selection in the requested list type. */
export function list(view: EditorView, type: "bullet_list" | "ordered_list") {
  view.focus();
  wrapInList(view.state.schema.nodes[type])(view.state, view.dispatch);
}

/** Converts the current block into a code block. */
export function codeBlock(view: EditorView) {
  view.focus();
  commands.setBlockType(view.state.schema.nodes.code_block)(
    view.state,
    view.dispatch,
  );
}

/** Replaces the document with its empty default content. */
export function clear(view: EditorView) {
  view.dispatch(
    view.state.tr.replaceWith(
      0,
      view.state.doc.content.size,
      view.state.schema.nodes.doc.createAndFill()!,
    ),
  );
}
