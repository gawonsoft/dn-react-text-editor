import React, {
  useEffect,
  type DetailedHTMLProps,
  type HTMLAttributes,
} from "react";
import { debounceTime, filter } from "rxjs";
import type { TextEditorController } from "./text_editor_controller";

type Props = Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  "ref"
> & {
  controller: TextEditorController;
  updateDelay?: number;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function TextEditorInput({
  controller,
  onChange,
  updateDelay = 0,
  ...props
}: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sub = controller.subject
      .pipe(
        filter((tr) => tr.docChanged),
        debounceTime(updateDelay)
      )
      .subscribe(() => {
        if (inputRef.current) {
          inputRef.current.value = controller.value;

          const event = new Event("input", { bubbles: true });

          inputRef.current.dispatchEvent(event);
        }
      });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  return <input {...props} ref={inputRef} type="hidden" onInput={onChange} />;
}
