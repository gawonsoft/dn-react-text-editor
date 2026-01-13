import React, {
  useMemo,
  type DetailedHTMLProps,
  type FC,
  type InputHTMLAttributes,
} from "react";
import { useEffect, useRef } from "react";
import { TextEditorInput } from "./input";
import {
  TextEditorController,
  type TextEditorControllerProps,
} from "./text_editor_controller";

type HTMLElementProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export type TextEditorProps = Omit<HTMLElementProps, "ref"> & {
  controller?: TextEditorController;
  name?: string;
} & TextEditorControllerProps;

type CreateTextEditorOptions = Pick<
  TextEditorControllerProps,
  "className" | "style" | "attachFile"
>;

export function createTextEditor(
  options: CreateTextEditorOptions = {}
): FC<TextEditorProps> {
  function Component({
    controller: externalController,
    name,
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

    const innerController = useMemo(
      () =>
        new TextEditorController({
          mode,
          state,
          editor,
          autoFocus,
          placeholder,
          updateDelay,
          defaultValue,
          className: options.className,
          style: options.style,
          attachFile: options.attachFile,
        }),
      []
    );

    const controller = externalController || innerController;

    useEffect(() => {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      controller.bind(container);

      return () => {
        controller.dispose();
      };
    }, [controller]);

    return (
      <>
        <div {...props} ref={containerRef} className={className} />
        <TextEditorInput
          name={name}
          controller={controller}
          onChange={onChange}
        />
      </>
    );
  }

  return Component;
}
