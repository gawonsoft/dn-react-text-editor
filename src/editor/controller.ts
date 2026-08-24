import { DOMParser, DOMSerializer } from "prosemirror-model";
import type { Command } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import {
  editorChangeOriginKey,
  type EditorChangeOrigin,
  type TextEditorChange,
} from "../events";
import { createSchema } from "../schema";
import {
  resolveEditorMarks,
  resolveEditorNodes,
  type EditorMark,
  type EditorNode,
  type EditorElementValue,
} from "../elements";
import {
  parseEditorValue,
  serializeHTML,
  serializeText,
  toInnerHTML,
} from "./document";
import { createEditorAttributes } from "./plugins";
import { dispatchEditorTransaction } from "./changes";
import type { TextEditorControllerProps } from "./types";
import { insertEditorElement } from "./element_actions";
import { createEditorView } from "./view";
/** Owns one stable ProseMirror view and exposes only high-level editor operations. */
export class TextEditorController {
  readonly #nodes: readonly EditorNode[];
  readonly #marks: readonly EditorMark[];
  readonly #schema;
  readonly #parser;
  readonly #serializer;
  readonly #listeners = new Set<(change: TextEditorChange) => void>();
  #props: TextEditorControllerProps;
  #view?: EditorView;
  #nextOrigin?: EditorChangeOrigin;
  /** Creates a controller whose schema remains the single source of truth. */
  constructor(props: TextEditorControllerProps = {}) {
    this.#props = props;
    this.#nodes = resolveEditorNodes(props.nodes);
    this.#marks = resolveEditorMarks(props.marks);
    this.#schema = createSchema(this.#nodes, this.#marks);
    this.#parser = DOMParser.fromSchema(this.#schema);
    this.#serializer = DOMSerializer.fromSchema(this.#schema);
  }
  /** Reports whether the controller currently owns a mounted editor view. */
  get isBound() {
    return this.#view !== undefined;
  }
  /** Serializes the current document according to the configured output mode. */
  get value(): string {
    if (!this.#view) {
      return this.#props.defaultValue || "";
    }

    return this.#props.mode === "text" ? this.toTextContent() : this.toHTML();
  }
  /** Replaces editor content as an externally controlled value update. */
  set value(value: string) {
    this.setValue(value, "external");
  }
  /** Subscribes to read-only document change events and returns an unsubscribe function. */
  subscribe(listener: (change: TextEditorChange) => void) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }
  /** Returns the configured debounce delay for value-change notifications. */
  getChangeDelay() {
    return this.#props.onChangeDelay ?? 0;
  }
  /** Updates presentation-only options without recreating the document or view. */
  updateOptions(
    options: Pick<TextEditorControllerProps, "className" | "style">,
  ) {
    this.#props = { ...this.#props, ...options };
    this.#view?.setProps({
      attributes: () => createEditorAttributes(this.#props),
    });
  }
  /** Converts external text or HTML into safe markup for ProseMirror parsing. */
  toInnerHTML(value: string) {
    return toInnerHTML(value, this.#props.mode);
  }
  /** Replaces the document and tags the resulting change with its origin. */
  setValue(value: string, origin: EditorChangeOrigin = "external") {
    if (!this.#view || this.value === value) {
      return;
    }

    const documentNode = parseEditorValue(
      this.#parser,
      value,
      this.#props.mode,
    );
    this.#view.dispatch(
      this.#view.state.tr
        .replaceWith(0, this.#view.state.doc.content.size, documentNode.content)
        .setMeta(editorChangeOriginKey, origin),
    );
  }

  /** Inserts a value created by a registered high-level editor element. */
  insertElement(value: EditorElementValue) {
    this.runAsCommand(() =>
      insertEditorElement(this.getView(), this.#schema, value),
    );
  }

  /** Runs a native ProseMirror command against the mounted editor view. */
  execute(command: Command) {
    let result = false;
    this.runAsCommand(() => {
      const view = this.getView();
      result = command(view.state, view.dispatch, view);
    });
    return result;
  }

  /** Labels synchronous transactions produced by an imperative API as commands. */
  private runAsCommand(callback: () => void) {
    this.#nextOrigin = "command";
    try {
      callback();
    } finally {
      this.#nextOrigin = undefined;
    }
  }

  /** Mounts the editor view and installs standard high-level plugins. */
  bind(element: HTMLElement) {
    if (this.#view) {
      return;
    }

    this.#view = createEditorView({
      mount: element,
      schema: this.#schema,
      parser: this.#parser,
      props: this.#props,
      nodes: this.#nodes,
      marks: this.#marks,
      dispatchTransaction: (transaction) =>
        this.dispatchTransaction(transaction),
    });

    if (this.#props.autoFocus) {
      this.#view.focus();
    }
  }

  /** @internal Returns the mounted view for the package's typed command facade. */
  getView() {
    if (!this.#view) {
      throw new Error("The text editor has not been mounted.");
    }
    return this.#view;
  }

  /** Serializes the current ProseMirror document fragment as HTML. */
  toHTML() {
    return serializeHTML(this.getView(), this.#serializer);
  }

  /** Extracts plain text with paragraph boundaries represented as newlines. */
  toTextContent() {
    return serializeText(this.getView());
  }

  /** Destroys the view and releases subscribers and plugin-owned resources. */
  dispose() {
    this.#view?.destroy();
    this.#view = undefined;
    this.#listeners.clear();
  }

  private dispatchTransaction(
    transaction: import("prosemirror-state").Transaction,
  ) {
    const view = this.getView();
    dispatchEditorTransaction({
      view,
      transaction,
      nextOrigin: this.#nextOrigin,
      value: () => this.value,
      listeners: this.#listeners,
    });
  }
}
