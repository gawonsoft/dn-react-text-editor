import { TextSelection, type Command } from "prosemirror-state";
import { undo, redo } from "prosemirror-history";
import { chainCommands, splitBlockAs } from "prosemirror-commands";
import { splitListItem } from "prosemirror-schema-list";

/** Builds editor key bindings for history, block navigation, lists, and code blocks. */
export function buildKeymap() {
  const keys: Record<string, Command> = {};

  /** Registers a ProseMirror command under a platform-aware key binding. */
  function bind(key: string, cmd: Command) {
    keys[key] = cmd;
  }

  // Undo and redo use the platform modifier key.
  bind("Mod-z", undo);

  bind("Shift-Mod-z", redo);
  bind("Mod-y", redo);

  // Keep a writable paragraph after a terminal non-paragraph block.
  bind("ArrowDown", (state, dispatch) => {
    const doc = state.doc;

    const lastNode = doc.lastChild;

    if (lastNode && lastNode.type.name !== "paragraph") {
      const paragraphType = state.schema.nodes.paragraph;

      if (!paragraphType) {
        return false;
      }

      let tr = state.tr;

      const endPos = doc.content.size;

      tr = tr.insert(endPos, paragraphType.create());

      tr = tr.setSelection(TextSelection.create(tr.doc, tr.doc.content.size));

      if (dispatch) {
        dispatch(tr);
      }

      return true;
    }

    return false;
  });

  bind(
    "Enter",
    chainCommands(
      (state, dispatch, view) => {
        const listItem = state.schema.nodes.list_item;
        return listItem
          ? splitListItem(listItem)(state, dispatch, view)
          : false;
      },
      (state, dispatch) => {
        // Split a regular paragraph after list-item handling has declined.
        const { $head } = state.selection;

        if (
          state.schema.nodes.paragraph &&
          $head.parent.type === state.schema.nodes.paragraph
        ) {
          splitBlockAs((n) => {
            return {
              type: n.type,
              attrs: n.attrs,
            };
          })(state, dispatch);

          return true;
        }

        return false;
      },
      (state, dispatch) => {
        // Preserve the current leading whitespace when adding a code-block line.
        const { selection } = state;
        const { $from, $to } = selection;

        if ($from.parent.type !== state.schema.nodes.code_block) {
          return false;
        }

        const lines = state.doc
          .textBetween($from.before(), $to.pos)
          .split("\n");

        const currentLine = lines[lines.length - 1];

        const match = currentLine.match(/^(\s+).*$/);

        if (match) {
          if (dispatch) {
            dispatch(state.tr.insertText("\n" + match[1], $from.pos));
          }
          return true;
        }

        return false;
      },
    ),
  );

  // Insert two spaces instead of moving focus when Tab is pressed in code blocks.
  bind("Tab", (state, dispatch) => {
    const { selection } = state;
    const { $from, $to } = selection;

    if (
      state.schema.nodes.code_block &&
      $from.parent.type === state.schema.nodes.code_block
    ) {
      if (dispatch) {
        dispatch(state.tr.insertText("  ", $from.pos, $to.pos));
      }
      return true;
    }
    return false;
  });

  return keys;
}
