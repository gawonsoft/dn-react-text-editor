import { TextEditor, TextEditorController } from "gw-react-text-editor";
import { createTextEditorView } from "gw-react-text-editor/preview";
import { useRef, useState, type RefObject } from "react";
import "highlight.js/styles/github.css";

const Preview = createTextEditorView({ className: "preview" });
const initialValue = "<p>Hello world!</p>";

export default function App() {
  const controllerRef = useRef<TextEditorController>(null);
  const [preview, setPreview] = useState(initialValue);

  return (
    <div>
      <Toolbar controller={controllerRef} />
      <div className="app">
        <TextEditor
          ref={controllerRef}
          className="text-editor"
          placeholder="Start typings..."
          defaultValue={initialValue}
          onChange={setPreview}
        />
        <Preview dangerouslySetInnerHTML={{ __html: preview }} />
      </div>
    </div>
  );
}

function Toolbar({
  controller,
}: {
  controller: RefObject<TextEditorController | null>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="toolbar">
      <button type="button" onClick={() => controller.current?.commands.undo()}>
        Undo
      </button>
      <button type="button" onClick={() => controller.current?.commands.redo()}>
        Redo
      </button>
      <button
        type="button"
        onClick={() => controller.current?.commands.clear()}
      >
        Clear
      </button>
      <button type="button" onClick={() => controller.current?.commands.link()}>
        Link
      </button>
      <button type="button" onClick={() => inputRef.current?.click()}>
        Attach File
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        onChange={(e) => {
          controller.current?.attachFile(Array.from(e.target.files || []));
          e.target.value = "";
        }}
        style={{
          display: "none",
        }}
      />
      <button
        type="button"
        onClick={() => controller.current?.commands.heading(1)}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => controller.current?.commands.orderedList()}
      >
        Ordered List
      </button>
      <button
        type="button"
        onClick={() => controller.current?.commands.bulletList()}
      >
        Bullet List
      </button>
      <button
        type="button"
        onClick={() => controller.current?.commands.codeBlock()}
      >
        Code Block
      </button>
    </div>
  );
}
