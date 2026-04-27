import type { Attrs, NodeType } from "prosemirror-model";
import * as prosemirrorCommands from "prosemirror-commands";
import * as schemaList from "prosemirror-schema-list";
import * as history from "prosemirror-history";
import type { TextEditorController } from "./text_editor_controller";

export class TextEditorTool {
  controller: TextEditorController;

  constructor(controller: TextEditorController) {
    this.controller = controller;
  }

  protected get view() {
    return this.controller.view!;
  }

  protected get schema() {
    return this.controller.schema;
  }

  attachFile = (files: File[]) => {
    this.view.focus();

    this.controller.attachFile(files);
  };

  appendLink = (href?: string) => {
    this.view.focus();

    const { from, to } = this.view.state.selection;

    if (!href) {
      const value = prompt("URL을 입력하세요");

      if (!value) {
        return;
      }

      href = value;
    }

    if (from === to) {
      const textNode = this.schema.text(href, [
        this.schema.marks.link.create({ href }),
      ]);

      const tr = this.view.state.tr.insert(from, textNode);

      this.view.dispatch(tr);

      return;
    }

    const markType = this.schema.marks.link;

    const command = prosemirrorCommands.toggleMark(markType, { href });

    command(this.view.state, this.view.dispatch);
  };

  isActiveBlock = (
    node: NodeType,
    attrs?: Attrs | null,
    excludes: NodeType[] = [],
  ) => {
    const state = this.view.state;

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

  setBlockType = (node: string, attrs?: Attrs | null) => {
    this.view.focus();

    const nodeType = this.schema.nodes[node];

    const command = prosemirrorCommands.setBlockType(nodeType, attrs);

    command(this.view.state, this.view.dispatch);
  };

  toggleBlockType = (node: string, attrs?: Attrs | null) => {
    this.view.focus();

    const nodeType = this.schema.nodes[node];

    const command = prosemirrorCommands.setBlockType(nodeType, attrs);

    if (this.isActiveBlock(nodeType, attrs)) {
      prosemirrorCommands.setBlockType(this.schema.nodes.paragraph, null)(
        this.view.state,
        this.view.dispatch,
      );
    } else {
      command(this.view.state, this.view.dispatch);
    }
  };

  toggleMark = (
    mark: string,
    attrs?: Attrs | null,
    options?: {
      removeWhenPresent?: boolean;
      enterInlineAtoms?: boolean;
      includeWhitespace?: boolean;
    },
  ) => {
    this.view.focus();

    const markType = this.schema.marks[mark];

    const command = prosemirrorCommands.toggleMark(markType, attrs, options);

    command(this.view.state, this.view.dispatch);
  };

  wrapInList = (listType: string, attrs?: Attrs | null) => {
    this.view.focus();

    const nodeType = this.schema.nodes[listType];

    const command = schemaList.wrapInList(nodeType, attrs);

    command(this.view.state, this.view.dispatch);
  };

  clear = () => {
    const tr = this.view.state.tr.replaceWith(
      0,
      this.view.state.doc.content.size,
      this.schema.nodes.doc.createAndFill()!,
    );

    this.view.dispatch(tr);
  };

  undo = () => {
    this.view.focus();

    history.undo(this.view.state, this.view.dispatch);
  };

  redo = () => {
    this.view.focus();

    history.redo(this.view.state, this.view.dispatch);
  };
}
