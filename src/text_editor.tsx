import React, {
    type DetailedHTMLProps,
    type InputHTMLAttributes,
    type Ref,
} from "react";
import {
    EditorState,
    type EditorStateConfig,
    Plugin,
    Transaction,
} from "prosemirror-state";
import { type DirectEditorProps, EditorView } from "prosemirror-view";
import { useEffect, useRef } from "react";
import { baseKeymap } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { dragAndDropPlugin } from "./plugins/drag_and_drop";
import { uploadPlaceholderPlugin } from "./plugins/upload_placeholder";
import { placeholderPlugin } from "./plugins/placehoder";
import { DOMSerializer, DOMParser } from "prosemirror-model";
import { history } from "prosemirror-history";
import { buildKeymap } from "./plugins/keymap";
import { createSchema } from "./schema";
import { debounceTime, filter, Subject } from "rxjs";
import { cn } from "./cn";
import { createAttachFile } from "./attach_file";

export type TextEditorController = {
    view: EditorView;
    subject: Subject<Transaction>;
    set value(value: string);
    get value(): string;
    clear: () => void;
};

export type TextEditorProps = Omit<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    "ref"
> & {
    ref?: Ref<TextEditorController>;
    state?: Partial<EditorStateConfig>;
    editor?: Partial<DirectEditorProps>;
    mode?: "html" | "text";
    updateDelay?: number;
    container?: string;
};

export function createTextEditor(
    options: {
        attachFile?: {
            generateMetadata: Parameters<
                typeof createAttachFile
            >[0]["generateMetadata"];
            uploadFile: Parameters<typeof createAttachFile>[0]["uploadFile"];
        };
    } = {}
) {
    const schema = createSchema();

    const prosemirrorParser = DOMParser.fromSchema(schema);

    const prosemirrorSerializer = DOMSerializer.fromSchema(schema);

    const attachFile = createAttachFile({
        schema,
        generateMetadata: options.attachFile?.generateMetadata,
        uploadFile: options.attachFile?.uploadFile,
    });

    function Component({
        ref,
        state,
        editor,
        mode = "html",
        container,
        autoFocus,
        name,
        placeholder,
        className,
        defaultValue,
        onClick,
        onChange,
        updateDelay = 0,
        ...props
    }: TextEditorProps = {}) {
        const containerRef = useRef<HTMLDivElement>(null);

        const inputRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            const element = containerRef.current;

            if (!element) {
                return;
            }

            const subject = new Subject<Transaction>();

            const wrapper = document.createElement("div");

            const toInnerHTML = (value: string) => {
                if (mode === "html") {
                    return value;
                }

                return value
                    .split("\n")
                    .map((line) => `<p>${line}</p>`)
                    .join("");
            };

            wrapper.innerHTML = toInnerHTML(
                defaultValue ? String(defaultValue) : ""
            );

            const view = new EditorView(element, {
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
                        class: cn(propsAttributes?.class, className),
                        spellcheck: propsAttributes?.spellcheck || "false",
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
                        keymap(baseKeymap),
                        uploadPlaceholderPlugin,
                        attachFile
                            ? dragAndDropPlugin({
                                  attachFile: attachFile,
                              })
                            : null,
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

            function clear() {
                const tr = view.state.tr.replaceWith(
                    0,
                    view.state.doc.content.size,
                    schema.nodes.doc.createAndFill()!
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

            const sub = subject
                .pipe(
                    filter((tr) => tr.docChanged),
                    debounceTime(updateDelay)
                )
                .subscribe(() => {
                    if (inputRef.current) {
                        switch (mode) {
                            case "text":
                                inputRef.current.value = toTextContent();
                                break;
                            default:
                                inputRef.current.value = toHTML();
                                break;
                        }

                        const event = new Event("input", { bubbles: true });

                        inputRef.current.dispatchEvent(event);
                    }
                });

            if (autoFocus) {
                view.focus();
            }

            const textEditorController = {
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
                clear,
            };

            if (typeof ref === "function") {
                ref(textEditorController);
            } else if (ref) {
                ref.current = textEditorController;
            }

            return () => {
                sub.unsubscribe();

                view.destroy();

                element.innerHTML = "";
            };
        }, []);

        return (
            <>
                <div ref={containerRef} className={container} {...props} />
                <input
                    ref={inputRef}
                    type="hidden"
                    name={name}
                    onInput={onChange}
                />
            </>
        );
    }

    return {
        schema,
        attachFile,
        Component,
    };
}
