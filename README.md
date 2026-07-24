# gw-react-text-editor

A React 19 rich-text editor built on ProseMirror. It supports controlled and
uncontrolled values, safe HTML previews, syntax-highlighted code blocks, media
uploads, drag and drop, history, and formatting tools.

## Installation

```bash
npm install gw-react-text-editor
```

`react` and `react-dom` 19 are peer dependencies and must be installed by the
application.

## Quick Start

```tsx
import { useState } from "react";
import { TextEditor } from "gw-react-text-editor";

export function ArticleEditor() {
  const [value, setValue] = useState("<p>Hello world!</p>");

  return (
    <TextEditor
      name="content"
      value={value}
      placeholder="Write something..."
      className="editor"
      onChange={setValue}
    />
  );
}
```

Provide baseline styles for the editor surface in your application:

```css
.editor .ProseMirror {
  min-height: 12rem;
  outline: none;
}
```

## Component API

`TextEditor` accepts normal `div` attributes in addition to these props.

| Prop                | Type                                 | Description                                                          |
| ------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| `value`             | `string`                             | Controlled HTML or plain-text value.                                 |
| `defaultValue`      | `string`                             | Initial uncontrolled value.                                          |
| `mode`              | `"html" \| "text"`                   | Output and input format. Defaults to HTML.                           |
| `onChange`          | `(value: string) => void`            | Receives the current serialized value after document changes.        |
| `placeholder`       | `string`                             | Empty-editor placeholder text.                                       |
| `onValueChange`     | `(change: TextEditorChange) => void` | Read-only event with a `user`, `external`, or `command` origin.      |
| `onChangeDelay`     | `number`                             | Delay in milliseconds before change callbacks run.                   |
| `historyGroupDelay` | `number`                             | History grouping delay, independent from `onChangeDelay`.            |
| `upload`            | `UploadAdapter`                      | Storage integration with cancellation, progress, and error handling. |
| `editorStyle`       | `string`                             | Inline CSS applied to the ProseMirror editor element.                |

Use `ref` to access the editor's value, uploads, and simple formatting commands.

## Toolbar Commands

Call methods on `editorRef.current?.commands`. Each command uses the editor's
current selection and restores focus before changing formatting.

```tsx
import { useRef } from "react";
import { TextEditor, TextEditorController } from "gw-react-text-editor";

export function EditorWithToolbar() {
  const editorRef = useRef<TextEditorController>(null);

  return (
    <>
      <button type="button" onClick={() => editorRef.current?.commands.bold()}>
        Bold
      </button>
      <button
        type="button"
        onClick={() => editorRef.current?.commands.heading(2)}
      >
        Heading 2
      </button>
      <button
        type="button"
        onClick={() => editorRef.current?.commands.bulletList()}
      >
        Bullet list
      </button>
      <TextEditor ref={editorRef} defaultValue="<p>Select some text.</p>" />
    </>
  );
}
```

`commands` provides these methods:

| Method                              | Purpose                                                   |
| ----------------------------------- | --------------------------------------------------------- |
| `undo()`, `redo()`                  | Move through editor history.                              |
| `clear()`                           | Replace the document with an empty paragraph.             |
| `bold()`, `italic()`, `underline()` | Toggle inline formatting at the selection.                |
| `heading(level)`                    | Toggle a heading at levels 1 through 6.                   |
| `bulletList()`, `orderedList()`     | Wrap the selection in a list.                             |
| `codeBlock()`                       | Convert the current block to a code block.                |
| `align("center")`                   | Toggle `left`, `center`, `right`, or `justify` alignment. |
| `link(url?)`                        | Apply a link; omit the URL to use the browser prompt.     |

### Attach Files

Call `editorRef.current?.attachFile()` with browser `File` objects to insert images or videos
at the current selection. The default uploader embeds data URLs; use the
[`upload`](#file-uploads) prop for production storage.

```tsx
function attachFiles(files: FileList | null) {
  if (!files || !editorRef.current) {
    return;
  }

  editorRef.current.attachFile(Array.from(files));
}
```

Call `editorRef.current.cancelUploads()` to abort all in-flight uploads, for
example when closing an editor modal.

## File Uploads

When no uploader is supplied, images and videos are embedded as data URLs. For
production, pass an uploader that returns a durable URL:

```tsx
<TextEditor
  upload={{
    async upload(file, { signal, onProgress }) {
      const response = await uploadToStorage(file);
      onProgress(100);
      return { src: response.url, alt: file.name };
    },
    async getMetadata(file, signal) {
      return readMediaDimensions(file);
    },
    onError(error, file) {
      reportUploadError(error, file);
    },
  }}
/>
```

## Safe Previews

Use `createTextEditorView` for rendering saved editor HTML. It sanitizes the
provided markup before it reaches `dangerouslySetInnerHTML`.

```tsx
import { createTextEditorView } from "gw-react-text-editor/preview";
import "highlight.js/styles/github.css";

const ArticlePreview = createTextEditorView({ className: "article-preview" });

<ArticlePreview dangerouslySetInnerHTML={{ __html: value }} />;
```

Sanitization protects the bundled preview component. Apply your application's
own content-security policy and validation rules when storing or rendering HTML
through another path.

## Package Boundaries

The main export intentionally exposes only the high-level editor API. Raw
ProseMirror types and the former `gw-react-text-editor/prosemirror` export are
not supported. Import preview and sanitization helpers from
`gw-react-text-editor/preview` and `gw-react-text-editor/sanitizer`.

## Development

```bash
npm install
npm run verify
npm --prefix example run dev
```

`npm run verify` runs TypeScript checking, the Vitest regression suite, and the
package build. See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution and
release steps, and [CHANGELOG.md](CHANGELOG.md) for release history.

## License

[MIT](LICENSE)
