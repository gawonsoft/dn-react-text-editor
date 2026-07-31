import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
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
    onValueChange?: Parameters<typeof TextEditorInput>[0]["onValueChange"];
  };

/** Mounts a ProseMirror editor and optionally synchronizes it with a controlled value. */
export function TextEditor({
  ref,
  name,
  className,
  autoFocus,
  onChange,
  mode,
  defaultValue,
  placeholder,
  nodes,
  marks,
  upload,
  onUploadError,
  onChangeDelay,
  historyGroupDelay,
  style,
  editorStyle,
  value,
  onValueChange,
  ...props
}: TextEditorProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialDefaultValue = useRef(defaultValue);
  const latestValue = useRef(value);
  const controllerRef = useRef<TextEditorController>(null);
  const bindingVersionRef = useRef(0);

  if (!controllerRef.current) {
    controllerRef.current = new TextEditorController({
      mode,
      autoFocus,
      placeholder,
      nodes,
      marks,
      onChangeDelay,
      historyGroupDelay,
      defaultValue: initialDefaultValue.current,
      upload,
      onUploadError,
      className,
      style: editorStyle,
    });
  }

  const controller = controllerRef.current;

  useImperativeHandle(ref, () => controller, [controller]);

  useLayoutEffect(() => {
    latestValue.current = value;
  }, [value]);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const bindingVersion = ++bindingVersionRef.current;
    controller.bind(container);

    if (
      latestValue.current !== undefined &&
      controller.value !== latestValue.current
    ) {
      controller.value = latestValue.current;
    }

    return () => {
      if (controller.isBound) {
        // Atomic node views own nested React roots. Release them after the
        // parent root finishes its current cleanup lifecycle. React may replay
        // layout effects without unmounting the component, so a newer binding
        // invalidates the deferred cleanup from the previous effect.
        queueMicrotask(() => {
          if (bindingVersionRef.current === bindingVersion) {
            controller.dispose();
          }
        });
      }
    };
  }, [controller]);

  useEffect(() => {
    controller.updateOptions({ className, style: editorStyle });
  }, [className, controller, editorStyle]);

  useEffect(() => {
    if (
      value !== undefined &&
      controller.isBound &&
      controller.value !== value
    ) {
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
        onValueChange={onValueChange}
        initialValue={initialDefaultValue.current || ""}
      />
    </>
  );
}
