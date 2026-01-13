import { TextSelection, type Command } from "prosemirror-state";
import { undo, redo } from "prosemirror-history";
import { chainCommands, splitBlockAs } from "prosemirror-commands";
import type { Schema } from "prosemirror-model";
import { splitListItem } from "prosemirror-schema-list";

export function buildKeymap(schema: Schema) {
  const keys: Record<string, Command> = {};

  function bind(key: string, cmd: Command) {
    keys[key] = cmd;
  }

  // undo
  bind("Mod-z", undo);

  // redo
  bind("Shift-Mod-z", redo);
  bind("Mod-y", redo);

  // ensure paragraph at end of document
  bind("ArrowDown", (state, dispatch) => {
    const doc = state.doc;

    const lastNode = doc.lastChild;

    if (lastNode && lastNode.type.name !== "paragraph") {
      const paragraphType = state.schema.nodes.paragraph;

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

  const li = schema.nodes.list_item;

  bind(
    "Enter",
    chainCommands(
      splitListItem(li),
      (state, dispatch) => {
        // default behavior: split block
        const { $head } = state.selection;

        if ($head.parent.type === state.schema.nodes.paragraph) {
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
        // code block indentation
        const { selection } = state;
        const { $from, $to } = selection;

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
      }
    )
  );

  // code block indentation
  bind("Tab", (state, dispatch) => {
    const { selection } = state;
    const { $from, $to } = selection;

    if ($from.parent.type === schema.nodes.code_block) {
      if (dispatch) {
        dispatch(state.tr.insertText("  ", $from.pos, $to.pos));
      }
      return true;
    }
    return false;
  });

  return keys;
}
