import { DOMParser, DOMSerializer } from "prosemirror-model";
import { EditorState, type Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { createAttachFile } from "../attach_file";
import {
  editorChangeOriginKey,
  type EditorChangeOrigin,
  type TextEditorChange,
} from "../events";
import { createSchema } from "../schema";
import { TextEditorTool } from "../tools";
import {
  parseEditorValue,
  serializeHTML,
  serializeText,
  toInnerHTML,
} from "./document";
import { createEditorAttributes, createEditorPlugins } from "./plugins";
import type { TextEditorControllerProps } from "./types";
/** Owns one stable ProseMirror view and exposes only high-level editor operations. */
export class TextEditorController {
  readonly #schema = createSchema();
  readonly #parser = DOMParser.fromSchema(this.#schema);
  readonly #serializer = DOMSerializer.fromSchema(this.#schema);
  readonly #listeners = new Set<(change: TextEditorChange) => void>();
  readonly #uploads = new Set<AbortController>();
  #props: TextEditorControllerProps;
  #view?: EditorView;
  #nextOrigin?: EditorChangeOrigin;
  /** Provides simple imperative formatting commands for this editor. */
  readonly commands: TextEditorTool;
  /** Creates a controller whose schema remains the single source of truth. */
  constructor(props: TextEditorControllerProps = {}) {
    this.#props = props;
    this.commands = new TextEditorTool(this);
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

  /** Queues media uploads and keeps cancellation handles until they complete. */
  async attachFile(files: File[], pos?: number) {
    const abortController = new AbortController();
    this.#uploads.add(abortController);

    try {
      await createAttachFile({
        schema: this.#schema,
        upload: this.#props.upload,
        onError: this.#props.onUploadError,
      })(this.getView(), files, pos, abortController.signal);
    } finally {
      this.#uploads.delete(abortController);
    }
  }

  /** Cancels every in-flight media upload owned by this editor. */
  cancelUploads() {
    for (const upload of this.#uploads) {
      upload.abort();
    }
  }

  /** Runs an imperative command and labels its document change as a command event. */
  runCommand(callback: () => void) {
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

    this.#view = new EditorView(
      { mount: element },
      {
        attributes: () => createEditorAttributes(this.#props),
        state: EditorState.create({
          schema: this.#schema,
          doc: parseEditorValue(
            this.#parser,
            this.#props.defaultValue || "",
            this.#props.mode,
          ),
          plugins: createEditorPlugins({
            schema: this.#schema,
            props: this.#props,
            attachFile: (_view, files, pos) => this.attachFile(files, pos),
          }),
        }),
        dispatchTransaction: (transaction) =>
          this.dispatchTransaction(transaction),
      },
    );

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

  /** Destroys the view, aborts pending uploads, and releases subscribers. */
  dispose() {
    this.cancelUploads();
    this.#view?.destroy();
    this.#view = undefined;
    this.#listeners.clear();
  }

  private dispatchTransaction(transaction: Transaction) {
    const view = this.getView();
    view.updateState(view.state.apply(transaction));

    if (!transaction.docChanged) {
      return;
    }

    const origin =
      (transaction.getMeta(editorChangeOriginKey) as
        | EditorChangeOrigin
        | undefined) ??
      this.#nextOrigin ??
      "user";
    const change: TextEditorChange = {
      value: this.value,
      origin,
      docChanged: true,
    };

    for (const listener of this.#listeners) {
      listener(change);
    }
  }
}
