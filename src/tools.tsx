import type { Attrs, NodeType } from "prosemirror-model";
import * as prosemirrorCommands from "prosemirror-commands";
import * as schemaList from "prosemirror-schema-list";
import * as history from "prosemirror-history";
import type { TextEditorController } from "./text_editor_controller";

/** Provides imperative formatting and history commands for a text editor controller. */
export class TextEditorTool {
  controller: TextEditorController;

  /** Creates a command facade for the supplied controller. */
  constructor(controller: TextEditorController) {
    this.controller = controller;
  }

  /** Returns the mounted editor view required by ProseMirror commands. */
  protected get view() {
    return this.controller.view!;
  }

  /** Returns the schema used to construct nodes and marks. */
  protected get schema() {
    return this.controller.schema;
  }

  /** Focuses the editor and uploads the supplied media files at the selection. */
  attachFile = (files: File[]) => {
    this.view.focus();

    this.controller.attachFile(files);
  };

  /** Inserts a link at the cursor or toggles the link mark across the selection. */
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

  /** Reports whether the selection contains a matching block node and attributes. */
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

  /** Changes the current block to the named schema node type. */
  setBlockType = (node: string, attrs?: Attrs | null) => {
    this.view.focus();

    const nodeType = this.schema.nodes[node];

    const command = prosemirrorCommands.setBlockType(nodeType, attrs);

    command(this.view.state, this.view.dispatch);
  };

  /** Toggles the current block type, restoring a paragraph when it is already active. */
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

  /** Toggles a named inline mark across the active selection. */
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

  /** Wraps the active selection in the named container node. */
  wrapIn = (node: string, attrs?: Attrs | null) => {
    this.view.focus();

    const nodeType = this.schema.nodes[node];

    const command = prosemirrorCommands.wrapIn(nodeType, attrs);

    command(this.view.state, this.view.dispatch);
  };

  /** Wraps the active selection in an ordered or bullet list. */
  wrapInList = (listType: string, attrs?: Attrs | null) => {
    this.view.focus();

    const nodeType = this.schema.nodes[listType];

    const command = schemaList.wrapInList(nodeType, attrs);

    command(this.view.state, this.view.dispatch);
  };

  /** Replaces the active selection with a newly created schema node. */
  replaceSelectionWith = (node: string, attrs?: Attrs | null) => {
    this.view.focus();

    const nodeType = this.schema.nodes[node];

    const tr = this.view.state.tr.replaceSelectionWith(nodeType.create(attrs));

    this.view.dispatch(tr);
  };

  /** Toggles alignment on the current paragraph or heading. */
  align = (align: "left" | "center" | "right" | "justify") => {
    this.view.focus();

    const state = this.view.state;

    const { $from } = state.selection;

    const pos = $from.before();

    const n = $from.node();

    let tr = state.tr;

    if (["paragraph", "heading"].includes(n.type.name)) {
      tr = tr.setNodeAttribute(
        pos,
        "align",
        n.attrs.align === align ? null : align,
      );
    }

    this.view.dispatch(tr);
  };

  /** Replaces the document with the schema's empty document content. */
  clear = () => {
    const tr = this.view.state.tr.replaceWith(
      0,
      this.view.state.doc.content.size,
      this.schema.nodes.doc.createAndFill()!,
    );

    this.view.dispatch(tr);
  };

  /** Applies the most recent undoable history transaction. */
  undo = () => {
    this.view.focus();

    history.undo(this.view.state, this.view.dispatch);
  };

  /** Reapplies the most recently undone history transaction. */
  redo = () => {
    this.view.focus();

    history.redo(this.view.state, this.view.dispatch);
  };
}
