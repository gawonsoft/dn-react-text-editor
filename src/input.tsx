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
    }, []);

    return (
        <input
            {...props}
            ref={inputRef}
            type="hidden"
            defaultValue={controller.props.defaultValue}
        />
    );
}
