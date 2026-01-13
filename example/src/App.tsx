import {
  createInnerHTML,
  createTextEditor,
  TextEditorController,
} from "dn-react-text-editor";
import { useRef } from "react";
import "highlight.js/styles/github.css";

const TextEditor = createTextEditor();

export default function App() {
  const controller = new TextEditorController();

  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <Toolbar controller={controller} />
      <div className="app">
        <TextEditor
          controller={controller}
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

function Toolbar({ controller }: { controller: TextEditorController }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="toolbar">
      <button
        type="button"
        onClick={() => {
          controller.commands.clear();
        }}
      >
        Clear
      </button>
      <button
        type="button"
        onClick={() => {
          const href = prompt("Enter URL", "https://");

          if (!href) {
            return;
          }

          controller.commands.toggleMark("link", { href });
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
          const files = Array.from(e.target.files || []);

          controller.commands.attachFile(files);
        }}
        style={{
          display: "none",
        }}
      />
      <button
        type="button"
        onClick={() => {
          controller.commands.setBlockType("heading", { level: 1 });
        }}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => {
          controller.commands.wrapInList("ordered_list");
        }}
      >
        Ordered List
      </button>
      <button
        type="button"
        onClick={() => {
          controller.commands.wrapInList("bullet_list");
        }}
      >
        Bullet List
      </button>
      <button
        type="button"
        onClick={() => {
          controller.commands.setBlockType("code_block");
        }}
      >
        Code Block
      </button>
    </div>
  );
}
