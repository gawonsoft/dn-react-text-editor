/** The foundational text and paragraph node specifications. */
export const textNodes = {
  doc: { content: "block+" },
  paragraph: {
    attrs: { align: { default: null } },
    content: "inline*",
    group: "block",
    parseDOM: [
      {
        tag: "p",
        getAttrs(dom: HTMLElement) {
          return { align: dom.style.textAlign || null };
        },
      },
    ],
    toDOM(node: { attrs: { align: string | null } }) {
      return [
        "p",
        { style: node.attrs.align ? `text-align: ${node.attrs.align}` : null },
        0,
      ];
    },
  },
  text: { group: "inline" },
  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{ tag: "br" }],
    toDOM() {
      return ["br"];
    },
  },
  horizontal_rule: {
    group: "block",
    parseDOM: [{ tag: "hr" }],
    toDOM() {
      return ["hr"];
    },
  },
};
