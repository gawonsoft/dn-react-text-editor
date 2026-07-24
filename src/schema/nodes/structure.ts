/** Block node specifications for headings, quotes, and code. */
export const structureNodes = {
  heading: {
    attrs: { level: { default: 1 }, align: { default: null } },
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [1, 2, 3, 4, 5, 6].map((level) => ({
      tag: `h${level}`,
      getAttrs(node: HTMLElement) {
        return { level, align: node.style.textAlign || null };
      },
    })),
    toDOM(node: {
      attrs: { level: number; align: string | null };
      textContent: string;
    }) {
      return [
        `h${node.attrs.level}`,
        {
          id: node.textContent.toLowerCase().replace(/\s+/g, "-"),
          style: node.attrs.align ? `text-align: ${node.attrs.align};` : null,
        },
        0,
      ];
    },
  },
  blockquote: {
    content: "block+",
    group: "block",
    defining: true,
    parseDOM: [{ tag: "blockquote" }],
    toDOM() {
      return ["blockquote", 0];
    },
  },
  code_block: {
    content: "text*",
    marks: "",
    group: "block",
    code: true,
    defining: true,
    parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
    toDOM() {
      return ["pre", { class: "hljs" }, ["code", 0]];
    },
  },
};
