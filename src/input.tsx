import {
  useEffect,
  useRef,
  type DetailedHTMLProps,
  type HTMLAttributes,
} from "react";
import { debounceTime, filter } from "rxjs";
import type { TextEditorController } from "./text_editor_controller";

type Props = Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  "ref" | "onChange"
> & {
  controller: TextEditorController;
  name?: string;
  onChange?: (value: string) => void;
};

/** Keeps a hidden form input and change callback synchronized with editor transactions. */
export function TextEditorInput({ controller, onChange, ...props }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sub = controller.subject
      .pipe(
        filter((tr) => tr.docChanged),
        debounceTime(controller.props.updateDelay || 0),
      )
      .subscribe(() => {
        const input = inputRef.current;

        if (!input) return;

        input.value = controller.value;

        onChange?.(controller.value);
      });

    return () => {
      sub.unsubscribe();
    };
  }, [controller, onChange]);

  return (
    <input
      {...props}
      ref={inputRef}
      type="hidden"
      defaultValue={controller.props.defaultValue}
    />
  );
}
