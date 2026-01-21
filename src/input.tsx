import {
  useEffect,
  useRef,
  type ChangeEvent,
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
  name?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function TextEditorInput({ controller, onChange, ...props }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sub = controller.subject
      .pipe(
        filter((tr) => tr.docChanged),
        debounceTime(controller.props.updateDelay || 0),
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

  return (
    <input
      {...props}
      ref={inputRef}
      type="hidden"
      onInput={onChange}
      defaultValue={controller.props.defaultValue}
    />
  );
}
