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
import "highlight.js/styles/github.css";

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

| Prop           | Type                           | Description                                                   |
| -------------- | ------------------------------ | ------------------------------------------------------------- |
| `value`        | `string`                       | Controlled HTML or plain-text value.                          |
| `defaultValue` | `string \| number \| string[]` | Initial uncontrolled value.                                   |
| `mode`         | `"html" \| "text"`             | Output and input format. Defaults to HTML.                    |
| `onChange`     | `(value: string) => void`      | Receives the current serialized value after document changes. |
| `placeholder`  | `string`                       | Empty-editor placeholder text.                                |
| `updateDelay`  | `number`                       | Delay in milliseconds before `onChange` is called.            |
| `attachFile`   | `object`                       | Optional metadata and upload callbacks for images and videos. |
| `editorStyle`  | `string`                       | Inline CSS applied to the ProseMirror editor element.         |

Use `ref` to access a `TextEditorController`, or create a `TextEditorTool` from
that controller to run commands such as `undo`, `redo`, `toggleMark`,
`toggleBlockType`, `wrapInList`, `align`, and `attachFile`.

## File Uploads

When no uploader is supplied, images and videos are embedded as data URLs. For
production, pass an uploader that returns a durable URL:

```tsx
<TextEditor
  attachFile={{
    async uploadFile(file) {
      const response = await uploadToStorage(file);
      return { src: response.url, alt: file.name };
    },
    async generateMetadata(file) {
      return readMediaDimensions(file);
    },
  }}
/>
```

## Safe Previews

Use `createTextEditorView` for rendering saved editor HTML. It sanitizes the
provided markup before it reaches `dangerouslySetInnerHTML`.

```tsx
import { createTextEditorView } from "gw-react-text-editor";

const ArticlePreview = createTextEditorView({ className: "article-preview" });

<ArticlePreview dangerouslySetInnerHTML={{ __html: value }} />;
```

Sanitization protects the bundled preview component. Apply your application's
own content-security policy and validation rules when storing or rendering HTML
through another path.

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
