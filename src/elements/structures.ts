import { createElement, type CSSProperties } from "react";
import { defineEditorContainer } from "./define";

const alignedAttributes = { align: null as string | null };

/** The default paragraph container. */
export const paragraphElement = defineEditorContainer({
  type: "paragraph",
  attributes: alignedAttributes,
  selector: "p",
  content: "inline*",
  group: "block",
  parse(element) {
    return { align: element.style.textAlign || null };
  },
  render({ align }, Content) {
    return Content({
      as: "p",
      style: align
        ? { textAlign: align as CSSProperties["textAlign"] }
        : undefined,
    });
  },
});

/** The default heading container. */
export const headingElement = defineEditorContainer({
  type: "heading",
  attributes: { ...alignedAttributes, level: 1 },
  selector: ["h1", "h2", "h3", "h4", "h5", "h6"],
  content: "inline*",
  group: "block",
  defining: true,
  parse(element) {
    return {
      align: element.style.textAlign || null,
      level: Number(element.tagName.slice(1)) || 1,
    };
  },
  render({ level, align }, Content, { textContent }) {
    const tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    return Content({
      as: tag,
      id: textContent.toLowerCase().replace(/\s+/g, "-"),
      style: align
        ? { textAlign: align as CSSProperties["textAlign"] }
        : undefined,
    });
  },
});

/** The default block quotation container. */
export const blockquoteElement = defineEditorContainer({
  type: "blockquote",
  attributes: {},
  selector: "blockquote",
  content: "block+",
  group: "block",
  defining: true,
  parse() {
    return {};
  },
  render(_attributes, Content) {
    return Content({ as: "blockquote" });
  },
});

/** The default code-block container. */
export const codeBlockElement = defineEditorContainer({
  type: "code_block",
  attributes: {},
  selector: "pre",
  content: "text*",
  group: "block",
  marks: "",
  defining: true,
  code: true,
  parse() {
    return {};
  },
  render(_attributes, Content) {
    return createElement(
      "pre",
      { className: "hljs" },
      Content({ as: "code" }),
    );
  },
});

/** The default bullet-list container. */
export const bulletListElement = defineEditorContainer({
  type: "bullet_list",
  attributes: {},
  selector: "ul",
  content: "list_item+",
  group: "block",
  parse() {
    return {};
  },
  render(_attributes, Content) {
    return Content({ as: "ul" });
  },
});

/** The default ordered-list container. */
export const orderedListElement = defineEditorContainer({
  type: "ordered_list",
  attributes: { order: 1 },
  selector: "ol",
  content: "list_item+",
  group: "block",
  parse(element) {
    return { order: Number(element.getAttribute("start")) || 1 };
  },
  render({ order }, Content) {
    return Content({ as: "ol", start: order === 1 ? undefined : order });
  },
});

/** The default list-item container. */
export const listItemElement = defineEditorContainer({
  type: "list_item",
  attributes: {},
  selector: "li",
  content: "paragraph block*",
  defining: true,
  parse() {
    return {};
  },
  render(_attributes, Content) {
    return Content({ as: "li" });
  },
});

/** Default content-bearing editor nodes. */
export const defaultEditorContainers = [
  paragraphElement,
  headingElement,
  blockquoteElement,
  codeBlockElement,
  bulletListElement,
  orderedListElement,
  listItemElement,
];
