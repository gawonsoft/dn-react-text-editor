import React, {
  useEffect,
  type DetailedHTMLProps,
  type HTMLAttributes,
  type RefObject,
} from "react";
import type { TextEditorController } from "./create_text_editor";
import { debounceTime, filter } from "rxjs";

type Props = Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  "ref"
> & {
  ref: RefObject<TextEditorController | null>;
  updateDelay?: number;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function TextEditorInput({
  ref,
  onChange,
  updateDelay = 0,
  ...props
}: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = ref.current;

    if (!controller) {
      return;
    }

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

      controller.view.destroy();
    };
  }, []);

  return <input {...props} ref={inputRef} type="hidden" onInput={onChange} />;
}
