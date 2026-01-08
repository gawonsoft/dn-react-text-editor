import type { Attrs, NodeType, Schema } from "prosemirror-model";
import type { EditorView } from "prosemirror-view";
import * as commands from "prosemirror-commands";
import * as schemaList from "prosemirror-schema-list";
import type { AttachFile } from "./attach_file";

export const createCommands = (
  schema: Schema,
  view: EditorView,
  options: {
    attachFile?: AttachFile;
  } = {}
) => {
  {
    const isBlockTypeActive = (
      node: NodeType,
      attrs?: Attrs | null,
      excludes: NodeType[] = []
    ) => {
      const state = view.state;

      const ranges = state.selection.ranges;

      let active = false;

      for (const range of ranges) {
        const { $from, $to } = range;

        state.doc.nodesBetween($from.pos, $to.pos, (n) => {
          if (active) {
            return true;
          }

          if (n.type !== node || excludes.includes(n.type)) {
            return;
          }

          if (
            !attrs ||
            Object.keys(attrs).every((key) => n.attrs[key] === attrs[key])
          ) {
            active = true;
          }
        });

        return active;
      }
    };

    const setBlockType = (node: string, attrs?: Attrs | null) => {
      view.focus();

      const nodeType = schema.nodes[node];

      const command = commands.setBlockType(nodeType, attrs);

      command(view.state, view.dispatch);
    };

    const toggleBlockType = (node: string, attrs?: Attrs | null) => {
      view.focus();

      const nodeType = schema.nodes[node];

      const command = commands.setBlockType(nodeType, attrs);

      if (isBlockTypeActive(nodeType, attrs)) {
        command(view.state, view.dispatch);
      }
    };

    const toggleMark = (
      mark: string,
      attrs?: Attrs | null,
      options?: {
        removeWhenPresent?: boolean;
        enterInlineAtoms?: boolean;
        includeWhitespace?: boolean;
      }
    ) => {
      view.focus();

      const markType = schema.marks[mark];

      const command = commands.toggleMark(markType, attrs, options);

      command(view.state, view.dispatch);
    };

    const wrapInList = (listType: string, attrs?: Attrs | null) => {
      view.focus();

      const nodeType = schema.nodes[listType];

      const command = schemaList.wrapInList(nodeType, attrs);

      command(view.state, view.dispatch);
    };

    const clear = () => {
      const tr = view.state.tr.replaceWith(
        0,
        view.state.doc.content.size,
        schema.nodes.doc.createAndFill()!
      );

      view.dispatch(tr);
    };

    return {
      isBlockTypeActive,
      setBlockType,
      toggleBlockType,
      toggleMark,
      wrapInList,
      clear,
      attachFile: (files: File[]) => {
        options.attachFile?.(view, files);
      },
    };
  }
};
