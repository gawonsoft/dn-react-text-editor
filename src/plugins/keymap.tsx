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

  bind("Mod-z", undo);

  bind("Shift-Mod-z", redo);

  bind("Mod-y", redo);

  const li = schema.nodes.list_item;

  // bind("Mod-[", liftListItem(li));
  // bind("Mod-]", sinkListItem(li));

  bind(
    "Enter",
    chainCommands(splitListItem(li), (state, dispatch) => {
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
    })
  );

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

  return keys;
}
