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
  serialize({ align }) {
    return {
      tag: "p",
      attributes: { style: align ? `text-align: ${align}` : null },
    };
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
  serialize({ level, align }, { textContent }) {
    return {
      tag: `h${level}`,
      attributes: {
        id: textContent.toLowerCase().replace(/\s+/g, "-"),
        style: align ? `text-align: ${align};` : null,
      },
    };
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
  serialize() {
    return { tag: "blockquote" };
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
  contentTag: "code",
  parse() {
    return {};
  },
  serialize() {
    return { tag: "pre", attributes: { class: "hljs" } };
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
  serialize() {
    return { tag: "ul" };
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
  serialize({ order }) {
    return { tag: "ol", attributes: { start: order === 1 ? null : order } };
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
  serialize() {
    return { tag: "li" };
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
