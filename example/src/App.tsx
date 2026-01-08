import {
  createTextEditor,
  type TextEditorController,
} from "dn-react-text-editor";
import { useRef } from "react";

const { attachFile, Component: TextEditor } = createTextEditor();

export default function App() {
  const ref = useRef<TextEditorController>(null);

  return (
    <div>
      <Toolbar textEditorRef={ref} />
      <TextEditor
        ref={ref}
        className="text-editor"
        placeholder="Write something..."
        onChange={(e) => {
          console.log(e.target.value);
        }}
      />
    </div>
  );
}

function Toolbar({
  textEditorRef,
}: {
  textEditorRef: React.RefObject<TextEditorController | null>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="toolbar">
      <button
        type="button"
        onClick={() => {
          textEditorRef.current?.clear();
        }}
      >
        Clear
      </button>
      <button type="button" onClick={() => inputRef.current?.click()}>
        Attach File
      </button>
      <input
        ref={inputRef}
        type="file"
        onChange={(e) => {
          if (!textEditorRef.current) {
            return;
          }

          const files = Array.from(e.target.files || []);

          attachFile(textEditorRef.current.view, files).then(() => {
            e.target.value = "";
          });
        }}
        style={{
          display: "none",
        }}
      />
    </div>
  );
}
