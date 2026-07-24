import {
  useEffect,
  useRef,
  type DetailedHTMLProps,
  type HTMLAttributes,
} from "react";
import type { TextEditorChange } from "./events";
import type { TextEditorController } from "./text_editor_controller";

type Props = Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  "ref" | "onChange"
> & {
  controller: TextEditorController;
  name?: string;
  initialValue?: string;
  onChange?: (value: string) => void;
  onValueChange?: (change: TextEditorChange) => void;
};

/** Keeps a hidden form input and change callback synchronized with editor transactions. */
export function TextEditorInput({
  controller,
  initialValue = "",
  onChange,
  onValueChange,
  ...props
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = controller.subscribe((change) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        const input = inputRef.current;

        if (!input) {
          return;
        }

        input.value = change.value;
        onValueChange?.(change);

        if (change.origin !== "external") {
          onChange?.(change.value);
        }
      }, controller.getChangeDelay());
    });

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }

      unsubscribe();
    };
  }, [controller, onChange, onValueChange]);

  return (
    <input
      {...props}
      ref={inputRef}
      type="hidden"
      defaultValue={initialValue}
    />
  );
}
