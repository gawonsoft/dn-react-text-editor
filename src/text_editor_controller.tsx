import {
  EditorState,
  type EditorStateConfig,
  Plugin,
  Transaction,
} from "prosemirror-state";
import { type DirectEditorProps, EditorView } from "prosemirror-view";
import * as commands from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { dragAndDropPlugin } from "./plugins/drag_and_drop";
import { uploadPlaceholderPlugin } from "./plugins/upload_placeholder";
import { placeholderPlugin } from "./plugins/placehoder";
import { history } from "prosemirror-history";
import { buildKeymap } from "./plugins/keymap";
import { cn } from "./cn";
import {
  createAttachFile,
  type GenerateMetadata,
  type UploadFile,
} from "./attach_file";
import { createCommands } from "./commands";
import { DOMParser, DOMSerializer, type Schema } from "prosemirror-model";
import { Subject } from "rxjs";
import { createSchema } from "./schema";
import { highlightPlugin } from "prosemirror-highlightjs";
import { highlighter } from "./plugins/highlighter";

export type TextEditorControllerProps = {
  schema?: Schema;
  mode?: "html" | "text";
  state?: Partial<EditorStateConfig>;
  editor?: Partial<DirectEditorProps>;
  defaultValue?: string | readonly string[] | number;
  updateDelay?: number;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  style?: string;
  attachFile?: {
    generateMetadata?: GenerateMetadata;
    uploadFile?: UploadFile;
  };
};

export class TextEditorController {
  schema: Schema;

  props: TextEditorControllerProps;

  subject: Subject<Transaction>;

  view?: EditorView;

  prosemirrorParser: DOMParser;

  prosemirrorSerializer: DOMSerializer;

  element?: HTMLElement;

  get value(): string {
    if (this.props.mode === "text") {
      return this.toTextContent();
    }

    return this.toHTML();
  }

  set value(value: string) {
    const wrap = document.createElement("div");

    wrap.innerHTML = this.toInnerHTML(value);

    const doc = this.prosemirrorParser.parse(wrap);

    const tr = this.view!.state.tr.replaceWith(
      0,
      this.view!.state.doc.content.size,
      doc.content,
    );

    this.view!.dispatch(tr);
  }

  constructor(props: TextEditorControllerProps = {}) {
    this.schema = props.schema || createSchema();

    this.props = props;

    this.subject = new Subject<Transaction>();

    this.prosemirrorParser = DOMParser.fromSchema(this.schema);

    this.prosemirrorSerializer = DOMSerializer.fromSchema(this.schema);
  }

  toInnerHTML(value: string) {
    if (this.props.mode === "text") {
      return value
        .split("\n")
        .map((line) => `<p>${line}</p>`)
        .join("");
    }

    return value;
  }

  attachFile(files: File[]) {
    return createAttachFile({
      schema: this.schema,
      generateMetadata: this.props.attachFile?.generateMetadata,
      uploadFile: this.props.attachFile?.uploadFile,
    })(this.view!, files);
  }

  bind(element: HTMLElement) {
    this.element = element;

    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.toInnerHTML(
      this.props.defaultValue ? String(this.props.defaultValue) : "",
    );

    this.view = new EditorView(element, {
      ...this.props.editor,
      attributes: (state) => {
        const propsAttributes = (() => {
          if (typeof this.props.editor?.attributes === "function") {
            return this.props.editor.attributes(state);
          }

          return this.props.editor?.attributes;
        })();

        return {
          ...propsAttributes,
          class: cn(this.props.className, propsAttributes?.class),
          spellcheck: propsAttributes?.spellcheck || "false",
          style:
            this.props.style || "width: 100%; height: inherit; outline: none;",
        };
      },
      state: EditorState.create({
        ...this.props.state,
        schema: this.props.state?.schema || this.schema,
        doc: this.props.state?.doc || this.prosemirrorParser.parse(wrapper),
        plugins: [
          ...(this.props.state?.plugins || []),
          history({
            newGroupDelay: this.props.updateDelay,
          }),
          keymap(buildKeymap(this.schema)),
          keymap(commands.baseKeymap),
          uploadPlaceholderPlugin,
          dragAndDropPlugin({
            attachFile: (view, files: File[]) => this.attachFile(files),
          }),
          this.props.placeholder && placeholderPlugin(this.props.placeholder),
          highlightPlugin(highlighter, ["code_block"], (node) => {
            const auto = highlighter.highlightAuto(node.textContent);

            return auto.language || "";
          }),
        ].filter((e): e is Plugin => !!(e as Plugin)),
      }),
      dispatchTransaction: (tr) => {
        let result;

        if (this.props.editor?.dispatchTransaction) {
          result = this.props.editor.dispatchTransaction(tr);
        } else {
          this.view?.updateState(this.view.state.apply(tr));
        }

        this.subject.next(tr);

        return result;
      },
    });

    if (this.props.autoFocus) {
      this.view?.focus();
    }
  }

  toHTML(): string {
    const fragment = this.prosemirrorSerializer.serializeFragment(
      this.view!.state.doc.content,
    );

    const container = document.createElement("div");

    container.appendChild(fragment);

    return container.innerHTML;
  }

  toTextContent(): string {
    const state = this.view!.state;

    return state.doc.textBetween(0, state.doc.content.size, "\n");
  }

  get commands() {
    return createCommands(this.schema, this.view!, {
      attachFile: (view, files: File[]) => this.attachFile(files),
    });
  }

  dispose() {
    this.view?.destroy();
  }
}

export type ConfigTextEditorOptions = Pick<
  TextEditorControllerProps,
  "className" | "style" | "attachFile"
>;

export const configTextEditorController = (
  options: ConfigTextEditorOptions = {},
) => {
  return (props: TextEditorControllerProps = {}) =>
    new TextEditorController({
      ...props,
      className: props.className || options.className,
      style: props.style || options.style,
      attachFile: props.attachFile || options.attachFile,
    });
};
