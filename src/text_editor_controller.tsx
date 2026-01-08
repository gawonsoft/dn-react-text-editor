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

export type TextEditorControllerProps = {
  mode?: "html" | "text";
  state?: Partial<EditorStateConfig>;
  editor?: Partial<DirectEditorProps>;
  defaultValue?: string | readonly string[] | number;
  updateDelay?: number;
  placeholder?: string;
};

export type CreateTextEditorOptions = {
  className?: string;
  style?: string;
  attachFile?: {
    generateMetadata?: GenerateMetadata;
    uploadFile?: UploadFile;
  };
};

export function createTextEditorController(
  container: HTMLElement,
  schema: Schema,
  options: CreateTextEditorOptions,
  {
    mode = "html",
    state,
    editor,
    defaultValue,
    updateDelay = 500,
    placeholder,
  }: TextEditorControllerProps
) {
  const subject = new Subject<Transaction>();

  const prosemirrorParser = DOMParser.fromSchema(schema);

  const prosemirrorSerializer = DOMSerializer.fromSchema(schema);

  const wrapper = document.createElement("div");

  const toInnerHTML = (value: string) => {
    if (mode === "text") {
      return value
        .split("\n")
        .map((line) => `<p>${line}</p>`)
        .join("");
    }

    return value;
  };

  wrapper.innerHTML = toInnerHTML(defaultValue ? String(defaultValue) : "");

  const attachFile = createAttachFile({
    schema,
    generateMetadata: options.attachFile?.generateMetadata,
    uploadFile: options.attachFile?.uploadFile,
  });

  const view = new EditorView(container, {
    ...editor,
    attributes: (state) => {
      const propsAttributes = (() => {
        if (typeof editor?.attributes === "function") {
          return editor.attributes(state);
        }

        return editor?.attributes;
      })();

      return {
        ...propsAttributes,
        class: cn(options?.className, propsAttributes?.class),
        spellcheck: propsAttributes?.spellcheck || "false",
        style: options.style || "width: 100%; height: inherit; outline: none;",
      };
    },
    state: EditorState.create({
      ...state,
      schema: state?.schema || schema,
      doc: state?.doc || prosemirrorParser.parse(wrapper),
      plugins: [
        ...(state?.plugins || []),
        history({
          newGroupDelay: updateDelay,
        }),
        keymap(buildKeymap(schema)),
        keymap(commands.baseKeymap),
        uploadPlaceholderPlugin,
        dragAndDropPlugin({
          attachFile,
        }),
        placeholder && placeholderPlugin(placeholder),
      ].filter((e): e is Plugin => !!(e as Plugin)),
    }),
    dispatchTransaction(tr) {
      let result;

      if (editor?.dispatchTransaction) {
        result = editor.dispatchTransaction(tr);
      } else {
        view.updateState(view.state.apply(tr));
      }

      subject.next(tr);

      return result;
    },
  });

  function setValue(value: string) {
    const wrap = document.createElement("div");

    wrap.innerHTML = toInnerHTML(value);

    const doc = prosemirrorParser.parse(wrap);

    const tr = view.state.tr.replaceWith(
      0,
      view.state.doc.content.size,
      doc.content
    );

    view.dispatch(tr);
  }

  function toHTML(): string {
    const fragment = prosemirrorSerializer.serializeFragment(
      view.state.doc.content
    );

    const container = document.createElement("div");

    container.appendChild(fragment);

    return container.innerHTML;
  }

  function toTextContent(): string {
    const state = view.state;

    return state.doc.textBetween(0, state.doc.content.size, "\n");
  }

  const textEditorCommands = createCommands(schema, view, {
    attachFile,
  });

  const textEditorController = {
    schema,
    view,
    subject,
    set value(value: string) {
      setValue(value);
    },
    get value(): string {
      switch (mode) {
        case "text":
          return toTextContent();
        default:
          return toHTML();
      }
    },
    commands: textEditorCommands,
  };

  return textEditorController;
}
