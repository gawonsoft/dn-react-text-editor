/** Identifies how an editor document change was initiated. */
export type EditorChangeOrigin = "user" | "external" | "command" | "upload";

/** Internal transaction metadata key shared by editor integrations. */
export const editorChangeOriginKey = "gw-react-text-editor:change-origin";

/** Read-only event emitted after a document-changing editor transaction. */
export type TextEditorChange = {
  value: string;
  origin: EditorChangeOrigin;
  docChanged: boolean;
};
