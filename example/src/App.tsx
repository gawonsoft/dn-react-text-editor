import {
  defineEditorElement,
  TextEditor,
  TextEditorController,
} from "gw-rich-text-editor";
import { TextEditorView } from "gw-rich-text-editor/view";
import { useRef, useState, type RefObject } from "react";
import "highlight.js/styles/github.css";

const initialValue = "<p>Hello world!</p>";

export default function App() {
  const controllerRef = useRef<TextEditorController>(null);
  const [content, setContent] = useState(initialValue);

  return (
    <div>
      <Toolbar controller={controllerRef} />
      <div className="app">
        <TextEditor
          ref={controllerRef}
          className="text-editor"
          placeholder="Start typings..."
          defaultValue={initialValue}
          nodes={[fileElement]}
          upload={{
            async upload(file, { onProgress }) {
              onProgress(100);
              return fileElement.create({
                href: URL.createObjectURL(file),
                name: file.name,
              });
            },
          }}
          onChange={setContent}
        />
        <TextEditorView className="text-editor-view" value={content} />
      </div>
    </div>
  );
}

const fileElement = defineEditorElement({
  type: "file",
  display: "inline",
  attributes: { href: "", name: "" },
  selector: 'a[data-editor-element="file"]',
  parse(element) {
    return {
      href: element.dataset.href || "",
      name: element.dataset.name || "",
    };
  },
  render({ href, name }) {
    return (
      <a
        data-editor-element="file"
        data-href={href}
        data-name={name}
        href={href}
        download={name}
      >
        {name}
      </a>
    );
  },
});

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
        accept="*/*"
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
