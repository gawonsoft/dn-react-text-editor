import type { EditorMark, EditorNode } from "../elements";
import type { UploadAdapter } from "../upload";

/** Configuration accepted by the high-level text editor controller. */
export type TextEditorControllerProps = {
  mode?: "html" | "text";
  defaultValue?: string;
  onChangeDelay?: number;
  historyGroupDelay?: number;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  style?: string;
  /** Registered atomic and container nodes. A matching type overrides its built-in node. */
  nodes?: readonly EditorNode[];
  /** Registered inline marks. A matching type overrides its built-in mark. */
  marks?: readonly EditorMark[];
  upload?: UploadAdapter;
  onUploadError?: (error: unknown, file: File) => void;
};
