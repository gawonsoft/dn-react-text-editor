/** Inline mark specifications for the default editor schema. */
export const marks = {
  link: {
    attrs: { href: { default: "" }, title: { default: null } },
    inclusive: false,
    parseDOM: [
      {
        tag: "a[href]",
        getAttrs(dom: HTMLElement) {
          return {
            href: dom.getAttribute("href"),
            title: dom.getAttribute("title"),
          };
        },
      },
    ],
    toDOM(node: { attrs: { href: string; title: string | null } }) {
      const { href, title } = node.attrs;
      return [
        "a",
        {
          href,
          title: title || href,
          target: "_blank",
          rel: "noopener noreferrer",
        },
        0,
      ];
    },
  },
  bold: {
    parseDOM: [
      { tag: "strong" },
      {
        tag: "b",
        getAttrs: (node: HTMLElement) =>
          node.style.fontWeight !== "normal" && null,
      },
      {
        style: "font-weight=400",
        clearMark: (mark: { type: { name: string } }) =>
          mark.type.name === "strong",
      },
      {
        style: "font-weight",
        getAttrs: (value: string) =>
          /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
      },
    ],
    toDOM() {
      return ["strong", 0];
    },
  },
  italic: {
    parseDOM: [
      { tag: "em" },
      { tag: "i" },
      { style: "font-style=italic" },
      {
        style: "font-style=normal",
        clearMark: (mark: { type: { name: string } }) =>
          mark.type.name === "em",
      },
    ],
    toDOM() {
      return ["em", 0];
    },
  },
  underline: {
    parseDOM: [
      { tag: "u" },
      {
        style: "text-decoration",
        getAttrs: (value: string) => value === "underline" && null,
      },
    ],
    toDOM() {
      return ["u", 0];
    },
  },
};
