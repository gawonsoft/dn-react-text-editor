/** Commands supported by the high-level editor API. */
export type TextEditorCommand =
  | { type: "undo" }
  | { type: "redo" }
  | { type: "clear" }
  | { type: "toggleBold" }
  | { type: "toggleItalic" }
  | { type: "toggleUnderline" }
  | { type: "toggleHeading"; level: 1 | 2 | 3 | 4 | 5 | 6 }
  | { type: "toggleBulletList" }
  | { type: "toggleOrderedList" }
  | { type: "setCodeBlock" }
  | { type: "align"; align: "left" | "center" | "right" | "justify" }
  | { type: "link"; href?: string };
