import React, {
  useImperativeHandle,
  type DetailedHTMLProps,
  type FC,
  type InputHTMLAttributes,
  type Ref,
} from "react";
import { Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { useEffect, useRef } from "react";
import { createSchema } from "./schema";
import { Subject } from "rxjs";
import { createCommands } from "./commands";
import { TextEditorInput } from "./input";
import {
  createTextEditorController,
  type CreateTextEditorOptions,
  type TextEditorControllerProps,
} from "./text_editor_controller";

export type TextEditorController = {
  schema: ReturnType<typeof createSchema>;
  view: EditorView;
  subject: Subject<Transaction>;
  set value(value: string);
  get value(): string;
} & { commands: ReturnType<typeof createCommands> };

type HTMLElementProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export type TextEditorProps = Omit<HTMLElementProps, "ref"> & {
  ref?: Ref<TextEditorController>;
  name?: string;
} & TextEditorControllerProps;

export function createTextEditor(
  options: CreateTextEditorOptions = {}
): FC<TextEditorProps> {
  const schema = createSchema();

  function Component({
    ref,
    className,
    autoFocus,
    onChange,
    mode,
    state,
    editor,
    defaultValue,
    updateDelay,
    placeholder,
    ...props
  }: TextEditorProps = {}) {
    const containerRef = useRef<HTMLDivElement>(null);

    const controllerRef = useRef<TextEditorController | null>(null);

    useImperativeHandle(ref || controllerRef, () => {
      const container = containerRef.current!;

      const textEditorController = createTextEditorController(
        container,
        schema,
        options,
        {
          mode,
          state,
          editor,
          defaultValue,
          updateDelay,
          placeholder,
        }
      );

      controllerRef.current = textEditorController;

      return textEditorController;
    });

    useEffect(() => {
      if (autoFocus) {
        controllerRef.current?.view.focus();
      }
    }, []);

    return (
      <>
        <div {...props} ref={containerRef} className={className} />
        <TextEditorInput
          ref={controllerRef}
          updateDelay={updateDelay}
          defaultValue={defaultValue}
          onChange={onChange}
        />
      </>
    );
  }

  return Component;
}
