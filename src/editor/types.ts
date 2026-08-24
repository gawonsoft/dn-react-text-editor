import type { EditorMark, EditorNode } from "../elements";
import type { Plugin } from "prosemirror-state";

/** Configuration accepted by the high-level text editor controller. */
export type TextEditorControllerProps = {
  mode?: "html" | "text";
  defaultValue?: string;
  onChangeDelay?: number;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  style?: string;
  /** Nodes added to the minimal paragraph schema. A matching type overrides it. */
  nodes?: readonly EditorNode[];
  /** Inline marks registered with this editor. The minimal editor has none. */
  marks?: readonly EditorMark[];
  /** Native ProseMirror plugins installed before the package's base keymap. */
  plugins?: readonly Plugin[];
};
