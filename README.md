# gw-rich-text-editor

A React 19 rich-text editor built on ProseMirror. It supports controlled and
uncontrolled values, safe read-only views, syntax-highlighted code blocks, media
uploads, drag and drop, history, and formatting tools.

## Installation

```bash
npm install gw-rich-text-editor
```

`react` and `react-dom` 19 are peer dependencies and must be installed by the
application.

## Quick Start

```tsx
import { useState } from "react";
import { TextEditor } from "gw-rich-text-editor";

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
| `nodes`             | `EditorNode[]`                       | Adds or overrides atomic and container nodes by `type`.              |
| `marks`             | `EditorMark[]`                       | Adds or overrides inline text marks by `type`.                       |
| `upload`            | `UploadAdapter`                      | Storage integration with cancellation, progress, and error handling. |
| `editorStyle`       | `string`                             | Inline CSS applied to the ProseMirror editor element.                |

Use `ref` to access the editor's value, uploads, and simple formatting commands.

## Toolbar Commands

Call methods on `editorRef.current?.commands`. Each command uses the editor's
current selection and restores focus before changing formatting.

```tsx
import { useRef } from "react";
import { TextEditor, TextEditorController } from "gw-rich-text-editor";

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

Call `editorRef.current?.attachFile()` with browser `File` objects to insert
images or videos at the current selection. The default uploader embeds data
URLs; use the [`upload`](#file-uploads) prop for production storage or custom
file elements.

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

When no uploader is supplied, images and videos are embedded as data URLs. An
uploader returns a value created by a registered element. For the default image
element, pass every declared attribute:

```tsx
<TextEditor
  upload={{
    async upload(file, { signal, onProgress }) {
      const response = await uploadToStorage(file);
      onProgress(100);
      return imageElement.create({
        src: response.url,
        alt: file.name,
        title: null,
        width: null,
        height: null,
        srcSet: null,
        sizes: null,
      });
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

## Custom Nodes And Marks

`defineEditorElement` defines an atomic node such as a file, image, or product
card. Set `display: "inline"` for an atomic inline node such as a custom hard
break; the built-in `hardBreakElement` uses this mode. `defineEditorContainer`
defines a node with editable content, such as a callout or heading.
`defineEditorMark` defines an inline text mark. Register nodes and marks with
`TextEditor`; their rendered HTML is stored in the editor value and can be shown
directly with `TextEditorView`. A matching built-in node or mark type overrides
its default definition. The root element returned by `render` must include the
attributes read by `selector` and `parse`. The same React tree is used for the
editor, saved HTML, and read-only view.

```tsx
import {
  defineEditorElement,
  defineEditorContainer,
  defineEditorMark,
  imageElement,
  TextEditor,
} from "gw-rich-text-editor";
import { TextEditorView } from "gw-rich-text-editor/view";

const fileElement = defineEditorElement({
  type: "file",
  display: "inline",
  attributes: { href: "", name: "", size: null as number | null },
  selector: 'a[data-editor-element="file"]',
  parse(element) {
    return {
      href: element.dataset.href || "",
      name: element.dataset.name || "",
      size: element.dataset.size ? Number(element.dataset.size) : null,
    };
  },
  render({ href, name, size }) {
    return (
      <a
        className="download-card"
        data-editor-element="file"
        data-href={href}
        data-name={name}
        data-size={size}
        href={href}
        download={name}
      >
        {name} {size ? `(${Math.ceil(size / 1024)} KB)` : null}
      </a>
    );
  },
});

const calloutNode = defineEditorContainer({
  type: "callout",
  attributes: { tone: "info" },
  selector: "aside[data-callout]",
  content: "inline*",
  group: "block",
  parse: (element) => ({ tone: element.dataset.tone || "info" }),
  render: ({ tone }, Content) => (
    <aside
      data-callout
      data-tone={tone}
      className={`callout callout-${tone}`}
    >
      <Content />
    </aside>
  ),
});

const highlightMark = defineEditorMark({
  type: "highlight",
  attributes: { color: "yellow" },
  selectors: ["mark[data-highlight]"],
  parse: (element) => ({ color: element.dataset.color || "yellow" }),
  render: ({ color }, Content) => (
    <mark data-highlight data-color={color}>
      <Content />
    </mark>
  ),
});

<TextEditor
  nodes={[fileElement, calloutNode]}
  marks={[highlightMark]}
  upload={{
    async upload(file, { onProgress }) {
      const stored = await uploadToStorage(file);
      onProgress(100);
      return fileElement.create({
        href: stored.url,
        name: file.name,
        size: file.size,
      });
    },
  }}
/>;

<TextEditorView value={value} />;
```

Call `controller.insertElement(fileElement.create(...))` to insert a registered
atomic node without an upload. Container and mark renderers receive a
package-managed `Content` slot; do not replace it with manually rendered text.
The HTML `download` attribute only guarantees a
download for same-origin or Blob URLs; configure `Content-Disposition:
attachment` on cross-origin storage URLs when a download must be forced.

## Read-only Views

Pass the saved editor value directly to `TextEditorView`. It sanitizes the
markup internally, so callers do not use `dangerouslySetInnerHTML`.

```tsx
import { TextEditorView } from "gw-rich-text-editor/view";
import "highlight.js/styles/github.css";

<TextEditorView className="article-content" value={value} />;
```

The view bundles JavaScript, TypeScript, JSON, HTML/XML, and CSS highlighting.
Register other Highlight.js languages only when the application needs them:

```tsx
import python from "highlight.js/lib/languages/python";
import { registerHighlightLanguage } from "gw-rich-text-editor/view";

registerHighlightLanguage("python", python);
```

Sanitization protects `TextEditorView`. Apply your application's
own content-security policy and validation rules when storing or rendering HTML
through another path.

## Package Boundaries

The main export intentionally exposes only the high-level editor API. Raw
ProseMirror types and the former `gw-rich-text-editor/prosemirror` export are
not supported. Import the read-only component and sanitization helpers from
`gw-rich-text-editor/view` and `gw-rich-text-editor/sanitizer`.

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
