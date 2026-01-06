import {
    createTextEditor,
    type TextEditorController,
} from "dn-react-text-editor";
import { useRef } from "react";

const { attachFile, Component: TextEditor } = createTextEditor();

export default function App() {
    const textEditorRef = useRef<TextEditorController>(null);

    return (
        <div>
            <button
                type="button"
                onClick={() => {
                    textEditorRef.current?.clear();
                }}
            >
                Clear
            </button>
            <input
                type="file"
                onChange={(e) => {
                    const files = Array.from(e.target.files || []);

                    if (textEditorRef.current) {
                        attachFile(textEditorRef.current.view, files).then(
                            () => {
                                e.target.value = "";
                            }
                        );
                    }
                }}
            />
            <TextEditor
                ref={textEditorRef}
                className="text-editor"
                name="content"
                placeholder="Write something..."
                onChange={(e) => {
                    console.log(e.target.value);
                }}
            />
        </div>
    );
}
