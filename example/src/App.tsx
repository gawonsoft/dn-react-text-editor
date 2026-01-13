import {
  createInnerHTML,
  TextEditor,
  TextEditorController,
} from "dn-react-text-editor";
import { useRef, type RefObject } from "react";
import "highlight.js/styles/github.css";

export default function App() {
  const controllerRef = useRef<TextEditorController>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <Toolbar controller={controllerRef} />
      <div className="app">
        <TextEditor
          ref={controllerRef}
          className="text-editor"
          placeholder="Start typings..."
          defaultValue={"<p>Hello world!</p>"}
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
  controller,
}: {
  controller: RefObject<TextEditorController | null>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const withController = (fn: (controller: TextEditorController) => void) => {
    if (controller.current) {
      fn(controller.current);
    }
  };

  return (
    <div className="toolbar">
      <button
        type="button"
        onClick={() =>
          withController((controller) => {
            alert("Submitted value:" + controller.value);
          })
        }
      >
        Submit
      </button>
      <button
        type="button"
        onClick={() =>
          withController((controller) => controller.commands.undo())
        }
      >
        Undo
      </button>
      <button
        type="button"
        onClick={() =>
          withController((controller) => controller.commands.redo())
        }
      >
        Redo
      </button>
      <button
        type="button"
        onClick={() =>
          withController((controller) => {
            controller.commands.clear();
          })
        }
      >
        Clear
      </button>
      <button
        type="button"
        onClick={() =>
          withController((controller) => {
            const href = prompt("Enter URL", "https://");

            if (!href) {
              return;
            }

            controller.commands.toggleMark("link", { href });
          })
        }
      >
        Link
      </button>
      <button type="button" onClick={() => inputRef.current?.click()}>
        Attach File
      </button>
      <input
        ref={inputRef}
        type="file"
        onChange={(e) =>
          withController((controller) => {
            const files = Array.from(e.target.files || []);

            controller.commands.attachFile(files);
          })
        }
        style={{
          display: "none",
        }}
      />
      <button
        type="button"
        onClick={() =>
          withController((controller) => {
            controller.commands.setBlockType("heading", { level: 1 });
          })
        }
      >
        H1
      </button>
      <button
        type="button"
        onClick={() =>
          withController((controller) => {
            controller.commands.wrapInList("ordered_list");
          })
        }
      >
        Ordered List
      </button>
      <button
        type="button"
        onClick={() =>
          withController((controller) => {
            controller.commands.wrapInList("bullet_list");
          })
        }
      >
        Bullet List
      </button>
      <button
        type="button"
        onClick={() =>
          withController((controller) => {
            controller.commands.setBlockType("code_block");
          })
        }
      >
        Code Block
      </button>
    </div>
  );
}
