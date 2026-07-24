import {
  createTextEditorView,
  TextEditor,
  TextEditorController,
  TextEditorTool,
} from "gw-react-text-editor";
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

  const withTool = (fn: (tool: TextEditorTool) => void) => {
    if (controller.current) {
      fn(new TextEditorTool(controller.current));
    }
  };

  return (
    <div className="toolbar">
      <button type="button" onClick={() => withTool((t) => t.undo())}>
        Undo
      </button>
      <button type="button" onClick={() => withTool((t) => t.redo())}>
        Redo
      </button>
      <button type="button" onClick={() => withTool((t) => t.clear())}>
        Clear
      </button>
      <button type="button" onClick={() => withTool((t) => t.appendLink())}>
        Link
      </button>
      <button type="button" onClick={() => inputRef.current?.click()}>
        Attach File
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        onChange={(e) =>
          withTool((t) => {
            const files = Array.from(e.target.files || []);

            t.attachFile(files);
            e.target.value = "";
          })
        }
        style={{
          display: "none",
        }}
      />
      <button
        type="button"
        onClick={() =>
          withTool((t) => {
            t.toggleBlockType("heading", {
              level: 1,
            });
          })
        }
      >
        H1
      </button>
      <button
        type="button"
        onClick={() =>
          withTool((t) => {
            t.wrapInList("ordered_list");
          })
        }
      >
        Ordered List
      </button>
      <button
        type="button"
        onClick={() =>
          withTool((t) => {
            t.wrapInList("bullet_list");
          })
        }
      >
        Bullet List
      </button>
      <button
        type="button"
        onClick={() =>
          withTool((t) => {
            t.setBlockType("code_block");
          })
        }
      >
        Code Block
      </button>
    </div>
  );
}
