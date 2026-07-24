import { codeBlock, clear, link, list } from "./blocks";
import {
  toggleAlignment,
  toggleHeading,
  toggleMark,
  type Alignment,
} from "./formatting";
import { redo, undo } from "./history";
import type { TextEditorController } from "../text_editor_controller";

/** Provides simple imperative formatting commands for a text editor controller. */
export class TextEditorTool {
  constructor(private readonly controller: TextEditorController) {}

  /** Focuses the editor and uploads the supplied media files at the selection. */
  attachFile(files: File[]) {
    return this.controller.attachFile(files);
  }

  /** Toggles bold formatting at the current selection. */
  bold() {
    this.run(() => toggleMark(this.view, "bold"));
  }

  /** Toggles italic formatting at the current selection. */
  italic() {
    this.run(() => toggleMark(this.view, "italic"));
  }

  /** Toggles underline formatting at the current selection. */
  underline() {
    this.run(() => toggleMark(this.view, "underline"));
  }

  /** Toggles a heading at the requested level for the current block. */
  heading(level: 1 | 2 | 3 | 4 | 5 | 6) {
    this.run(() => toggleHeading(this.view, level));
  }

  /** Toggles a bullet list around the current selection. */
  bulletList() {
    this.run(() => list(this.view, "bullet_list"));
  }

  /** Toggles an ordered list around the current selection. */
  orderedList() {
    this.run(() => list(this.view, "ordered_list"));
  }

  /** Changes the current block to a code block. */
  codeBlock() {
    this.run(() => codeBlock(this.view));
  }

  /** Applies or prompts for a link at the current selection. */
  link(href?: string) {
    this.run(() => link(this.view, href));
  }

  /** Toggles alignment on the current paragraph or heading. */
  align(align: Alignment) {
    this.run(() => toggleAlignment(this.view, align));
  }

  /** Replaces the document with the schema's empty document content. */
  clear() {
    this.run(() => clear(this.view));
  }

  /** Applies the most recent undoable history transaction. */
  undo() {
    this.run(() => undo(this.view));
  }

  /** Reapplies the most recently undone history transaction. */
  redo() {
    this.run(() => redo(this.view));
  }

  private get view() {
    return this.controller.getView();
  }

  private run(callback: () => void) {
    this.controller.runCommand(callback);
  }
}
