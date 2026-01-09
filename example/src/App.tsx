import {
  createInnerHTML,
  createTextEditor,
  type TextEditorController,
} from "dn-react-text-editor";
import { useRef, useState } from "react";
import "highlight.js/styles/github.css";

const TextEditor = createTextEditor();

export default function App() {
  const ref = useRef<TextEditorController>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setState(!state)}>
        Toggle State ({state ? "true" : "false"})
      </button>
      <Toolbar textEditorRef={ref} />
      <div className="app">
        <TextEditor
          ref={ref}
          className="text-editor"
          placeholder="Write something..."
          onChange={(e) => {
            previewRef.current!.innerHTML = createInnerHTML(e.target.value);
          }}
        />
        <div ref={previewRef} className="preview" />
      </div>
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
          textEditorRef.current?.commands.clear();
        }}
      >
        Clear
      </button>
      <button
        type="button"
        onClick={() => {
          if (!textEditorRef.current) {
            return;
          }

          const href = prompt("Enter URL", "https://");

          if (!href) {
            return;
          }

          textEditorRef.current.commands.toggleMark("link", { href });
        }}
      >
        Link
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

          textEditorRef.current.commands.attachFile(files);
        }}
        style={{
          display: "none",
        }}
      />
      <button
        type="button"
        onClick={() => {
          if (!textEditorRef.current) {
            return;
          }

          textEditorRef.current.commands.setBlockType("heading", { level: 1 });
        }}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => {
          if (!textEditorRef.current) {
            return;
          }

          textEditorRef.current.commands.wrapInList("ordered_list");
        }}
      >
        Ordered List
      </button>
      <button
        type="button"
        onClick={() => {
          if (!textEditorRef.current) {
            return;
          }

          textEditorRef.current.commands.wrapInList("bullet_list");
        }}
      >
        Bullet List
      </button>
      <button
        type="button"
        onClick={() => {
          if (!textEditorRef.current) {
            return;
          }

          textEditorRef.current.commands.setBlockType("code_block");
        }}
      >
        Code Block
      </button>
    </div>
  );
}
