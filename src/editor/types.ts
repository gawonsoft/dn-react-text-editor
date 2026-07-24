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
  upload?: UploadAdapter;
  onUploadError?: (error: unknown, file: File) => void;
};
