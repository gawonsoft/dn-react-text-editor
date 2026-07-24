import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  type DetailedHTMLProps,
  type HTMLAttributes,
  type Ref,
} from "react";
import { useRef } from "react";
import { TextEditorInput } from "./input";
import {
  TextEditorController,
  type TextEditorControllerProps,
} from "./text_editor_controller";

type HTMLElementProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export type TextEditorProps = Omit<HTMLElementProps, "ref" | "onChange"> &
  Omit<TextEditorControllerProps, "className" | "style"> & {
    editorStyle?: string;
    name?: string;
    ref?: Ref<TextEditorController>;
    value?: string;
    onChange?: Parameters<typeof TextEditorInput>[0]["onChange"];
  };

/** Mounts a ProseMirror editor and optionally synchronizes it with a controlled value. */
export function TextEditor({
  ref,
  name,
  className,
  autoFocus,
  onChange,
  schema,
  mode,
  state,
  editor,
  defaultValue,
  updateDelay,
  placeholder,
  attachFile,
  style,
  editorStyle,
  value,
  ...props
}: TextEditorProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialDefaultValue = useRef(defaultValue);

  const controller = useMemo(
    () =>
      new TextEditorController({
        schema,
        mode,
        state,
        editor,
        autoFocus,
        placeholder,
        updateDelay,
        defaultValue: initialDefaultValue.current,
        attachFile,
        style: editorStyle,
      }),
    [
      attachFile,
      autoFocus,
      editor,
      editorStyle,
      mode,
      placeholder,
      schema,
      state,
      updateDelay,
    ],
  );

  useImperativeHandle(ref, () => controller, [controller]);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    controller.bind(container);

    return () => {
      controller.dispose();
    };
  }, [controller]);

  useEffect(() => {
    if (value !== undefined && controller.view && controller.value !== value) {
      controller.value = value;
    }
  }, [controller, value]);

  return (
    <>
      <div {...props} ref={containerRef} className={className} style={style} />
      <TextEditorInput
        name={name}
        controller={controller}
        onChange={onChange}
      />
    </>
  );
}
