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
import { RichTextEditor } from "gw-rich-text-editor";

export function ArticleEditor() {
  const [value, setValue] = useState("<p>Hello world!</p>");

  return (
    <RichTextEditor
      name="content"
      value={value}
      placeholder="Write something..."
      className="editor"
      onChange={setValue}
    />
  );
}
```

The package provides the editor's behavioral styles. The application still
owns surface sizing and decoration:

```css
.editor .ProseMirror {
  min-height: 12rem;
  outline: none;
}
```

## Component API

`TextEditor` is a minimal paragraph editor. `RichTextEditor` adds the built-in
headings, lists, media, marks, history, keymap, and file-attachment plugin.
Both accept normal `div` attributes in addition to these props.

| Prop                | Type                                 | Description                                                          |
| ------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| `value`             | `string`                             | Controlled HTML or plain-text value.                                 |
| `defaultValue`      | `string`                             | Initial uncontrolled value.                                          |
| `mode`              | `"html" \| "text"`                   | Output and input format. Defaults to HTML.                           |
| `onChange`          | `(value: string) => void`            | Receives the current serialized value after document changes.        |
| `placeholder`       | `string`                             | Empty-editor placeholder text.                                       |
| `onValueChange`     | `(change: TextEditorChange) => void` | Read-only event with a `user`, `external`, or `command` origin.      |
| `onChangeDelay`     | `number`                             | Delay in milliseconds before change callbacks run.                   |
| `nodes`             | `EditorNode[]`                       | Adds or overrides atomic and container nodes by `type`.              |
| `marks`             | `EditorMark[]`                       | Adds or overrides inline text marks by `type`.                       |
| `plugins`           | `Plugin[]`                           | Adds native ProseMirror plugins to this editor.                       |
| `editorStyle`       | `string`                             | Inline CSS applied to the ProseMirror editor element.                |

`RichTextEditor` also accepts `history` and `fileAttachments`. Set either to
`false` to omit that preset feature, or pass its options object to configure it.

Controlled `value` updates are safe from React effects; consumers do not need
to defer them with a timer or microtask. Container and mark render callbacks
define synchronous DOM structure inside the editable surface, while atomic node
renderers remain React-mounted for interactive media and custom controls.

## Styling

The main `gw-rich-text-editor` entrypoint automatically injects scoped
ProseMirror, selection, text-placeholder, and upload-placeholder styles.
Override the default colors on the editor or an ancestor when the application
only needs a different theme:

```css
.editor {
  --gw-rich-text-placeholder-color: #64748b;
  --gw-rich-text-upload-placeholder-background: #f1f5f9;
  --gw-rich-text-selection-color: #60a5fa;
  --gw-rich-text-link-color: #1d4ed8;
}
```

### Full CSS control

Import the same editor API from `gw-rich-text-editor/unstyled` to disable every
package-provided style:

```tsx
import {
  TextEditor,
  type TextEditorController,
} from "gw-rich-text-editor/unstyled";
```

The unstyled entrypoint does not import or inject CSS. Applications can target
the stable `.gw-rich-text-editor` root class and these ProseMirror hooks:

- `[data-placeholder]::before` for the empty-editor placeholder;
- `.upload-placeholder` and `.upload-progress` during file uploads;
- `.ProseMirror-hideselection` while the native selection is hidden;
- `.ProseMirror-selectednode` for selected document nodes;
- `img.ProseMirror-separator` for cursor separator images.

The complete package defaults are available in
[`styles.css`](./styles.css). They can be copied as a starting point, or loaded
explicitly without automatic injection:

```ts
import "gw-rich-text-editor/styles.css";
```

Do not combine that explicit stylesheet import with the default styled
entrypoint, because the default entrypoint already injects the same rules.

Use `ref` to access the editor value and execute typed commands.

## Toolbar Commands

Pass exported commands to `editorRef.current?.execute()`. Each command uses the
editor's current selection and restores focus before changing formatting.

```tsx
import { useRef } from "react";
import {
  RichTextEditor,
  toggleBold,
  toggleBulletList,
  toggleHeading,
  type TextEditorController,
} from "gw-rich-text-editor";

export function EditorWithToolbar() {
  const editorRef = useRef<TextEditorController>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => editorRef.current?.execute(toggleBold)}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editorRef.current?.execute(toggleHeading(2))}
      >
        Heading 2
      </button>
      <button
        type="button"
        onClick={() => editorRef.current?.execute(toggleBulletList)}
      >
        Bullet list
      </button>
      <RichTextEditor
        ref={editorRef}
        defaultValue="<p>Select some text.</p>"
      />
    </>
  );
}
```

The package exports these commands and command factories:

| Command                                                   | Purpose                                                   |
| --------------------------------------------------------- | --------------------------------------------------------- |
| `undo`, `redo`                                            | Move through editor history.                              |
| `clear`                                                   | Replace the document with an empty paragraph.             |
| `toggleBold`, `toggleItalic`, `toggleUnderline`           | Toggle built-in inline formatting.                        |
| `toggleHeading(level)`                                    | Toggle a heading at levels 1 through 6.                   |
| `toggleBulletList`, `toggleOrderedList`                   | Wrap the selection in a list.                             |
| `setCodeBlock`                                            | Convert the current block to a code block.                |
| `toggleAlignment("center")`                              | Toggle `left`, `center`, `right`, or `justify` alignment. |
| `link(url?)`                                              | Apply a link; omit the URL to use the browser prompt.     |
| `toggleEditorMark(name, attrs?)`                          | Toggle a registered custom mark.                          |
| `setBlockType(name, attrs?)`, `toggleBlockType(name, …)`  | Format with a registered custom text block.               |
| `wrapInNode(name, attrs?)`                                | Wrap the selection in a registered container.             |

### Attach Files

Execute `attachFiles()` with browser `File` objects to insert images or videos
at the current selection. The rich preset embeds data URLs by default; use
`fileAttachments.upload` for production storage or custom file elements.

```tsx
import { attachFiles } from "gw-rich-text-editor";

function handleFiles(files: FileList | null) {
  if (!files || !editorRef.current) {
    return;
  }

  editorRef.current.execute(attachFiles(Array.from(files)));
}
```

Execute `cancelFileAttachments` to abort all in-flight uploads, for example when
closing an editor modal.

## File Uploads

When no uploader is supplied, images and videos are embedded as data URLs. An
uploader returns a value created by a registered element. For the default image
element, pass every declared attribute:

```tsx
<RichTextEditor
  fileAttachments={{
    upload: {
      async upload(file, { signal, metadata, onProgress }) {
        const response = await uploadToStorage(file, signal);
        onProgress(100);
        return imageElement.create({
          src: response.url,
          alt: file.name,
          title: null,
          width: metadata.width ?? null,
          height: metadata.height ?? null,
          srcSet: null,
          sizes: null,
        });
      },
      async getMetadata(file, signal) {
        return readMediaDimensions(file, signal);
      },
      onError(error, file) {
        reportUploadError(error, file);
      },
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
  RichTextEditor,
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

<RichTextEditor
  nodes={[fileElement, calloutNode]}
  marks={[highlightMark]}
  fileAttachments={{
    upload: {
      async upload(file, { signal, onProgress }) {
        const stored = await uploadToStorage(file, signal);
        onProgress(100);
        return fileElement.create({
          href: stored.url,
          name: file.name,
          size: file.size,
        });
      },
    },
  }}
/>;

<TextEditorView value={value} />;
```

Call `controller.insertElement(fileElement.create(...))` to insert a registered
atomic node without an upload. Container and mark renderers receive a
package-managed `Content` slot; do not replace it with manually rendered text.
Use `toggleEditorMark`, `setBlockType`, `toggleBlockType`, and `wrapInNode` to
connect registered marks and containers to application-owned toolbar buttons.
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

The main and `unstyled` exports expose the same high-level editor API. The main
entrypoint includes automatic styles; `unstyled` includes none. Raw ProseMirror
types and the former `gw-rich-text-editor/prosemirror` export are not supported.
Import the read-only component and sanitization helpers from
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
