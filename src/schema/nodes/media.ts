import { getNumericAttribute } from "../attributes";

/** Media node specifications with normalized HTML dimensions. */
export const mediaNodes = {
  image: {
    attrs: {
      src: { validate: "string" },
      alt: { default: null, validate: "string|null" },
      title: { default: null, validate: "string|null" },
      width: { default: null, validate: "number|null" },
      height: { default: null, validate: "number|null" },
      srcSet: { default: null, validate: "string|null" },
      sizes: { default: null, validate: "string|null" },
    },
    inline: false,
    group: "block",
    draggable: true,
    parseDOM: [
      {
        tag: "img[src]",
        getAttrs(dom: HTMLElement) {
          return {
            src: dom.getAttribute("src"),
            alt: dom.getAttribute("alt"),
            width: getNumericAttribute(dom, "width"),
            height: getNumericAttribute(dom, "height"),
            srcSet: dom.getAttribute("srcset"),
            sizes: dom.getAttribute("sizes"),
          };
        },
      },
    ],
    toDOM(node: { attrs: Record<string, unknown> }) {
      const { src, alt, srcSet, sizes, width, height } = node.attrs;
      return ["img", { src, alt, srcSet, sizes, width, height }];
    },
  },
  video: {
    inline: false,
    group: "block",
    draggable: true,
    attrs: {
      src: { validate: "string" },
      title: { default: null, validate: "string|null" },
      width: { default: null, validate: "number|null" },
      height: { default: null, validate: "number|null" },
      poster: { default: null, validate: "string|null" },
    },
    parseDOM: [
      {
        tag: "video",
        getAttrs(dom: HTMLElement) {
          return {
            src: dom.getAttribute("src"),
            title: dom.getAttribute("title"),
            width: getNumericAttribute(dom, "width"),
            height: getNumericAttribute(dom, "height"),
            poster: dom.getAttribute("poster"),
          };
        },
      },
    ],
    toDOM(node: { attrs: Record<string, unknown> }) {
      const { src, title, width, height, poster } = node.attrs;
      return [
        "video",
        {
          src,
          title,
          poster,
          width,
          height,
          playsinline: "true",
          controls: "controls",
          style: `aspect-ratio: ${width} / ${height}`,
        },
      ];
    },
  },
  iframe: {
    group: "block",
    draggable: true,
    attrs: {
      src: { validate: "string" },
      title: { default: null, validate: "string|null" },
      width: { default: null, validate: "number|null" },
      height: { default: null, validate: "number|null" },
      allow: { default: null, validate: "string|null" },
      allowfullscreen: { default: null, validate: "string|null" },
      referrerPolicy: { default: null, validate: "string|null" },
      style: { default: null, validate: "string|null" },
    },
    parseDOM: [
      {
        tag: "iframe[src]",
        getAttrs(dom: HTMLElement) {
          return {
            src: dom.getAttribute("src"),
            title: dom.getAttribute("title"),
            width: getNumericAttribute(dom, "width"),
            height: getNumericAttribute(dom, "height"),
            style: dom.getAttribute("style"),
            allow: dom.getAttribute("allow"),
            allowfullscreen: dom.getAttribute("allowfullscreen"),
            referrerPolicy: dom.getAttribute("referrerpolicy"),
          };
        },
      },
    ],
    toDOM(node: { attrs: Record<string, unknown> }) {
      const {
        src,
        title,
        width,
        height,
        allow,
        allowfullscreen,
        referrerPolicy,
        style,
      } = node.attrs;
      return [
        "iframe",
        {
          src,
          title,
          width,
          height,
          style,
          allow,
          allowfullscreen,
          referrerpolicy: referrerPolicy,
          frameborder: "0",
        },
      ];
    },
  },
};
