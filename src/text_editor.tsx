import {
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    type DetailedHTMLProps,
    type InputHTMLAttributes,
    type Ref,
} from "react";
import { useRef } from "react";
import { TextEditorInput } from "./input";
import {
    TextEditorController,
    type TextEditorControllerProps,
} from "./text_editor_controller";

type HTMLElementProps = DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
>;

export type TextEditorProps = Omit<HTMLElementProps, "ref" | "onChange"> & {
    name?: string;
    ref?: Ref<TextEditorController>;
    onChange?: Parameters<typeof TextEditorInput>[0]["onChange"];
} & TextEditorControllerProps;

export function TextEditor({
    ref,
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
    attachFile,
    style,
    ...props
}: TextEditorProps = {}) {
    const containerRef = useRef<HTMLDivElement>(null);

    const controller = useMemo(
        () =>
            new TextEditorController({
                mode,
                state,
                editor,
                autoFocus,
                placeholder,
                updateDelay,
                defaultValue,
                attachFile,
                style,
            }),
        [],
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
