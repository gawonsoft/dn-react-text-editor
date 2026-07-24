import { defineEditorMark } from "./define";

/** The default external link mark. */
export const linkMark = defineEditorMark({
  type: "link",
  attributes: { href: "", title: null as string | null },
  selectors: ["a[href]"],
  parse(element) {
    return {
      href: element.getAttribute("href") || "",
      title: element.getAttribute("title"),
    };
  },
  render({ href, title }, Content) {
    return Content({
      as: "a",
      href,
      title: title || href,
      target: "_blank",
      rel: "noopener noreferrer",
    });
  },
  inclusive: false,
});

/** The default bold mark. */
export const boldMark = defineEditorMark({
  type: "bold",
  attributes: {},
  selectors: ["strong", "b"],
  parse() {
    return {};
  },
  render(_attributes, Content) {
    return Content({ as: "strong" });
  },
});

/** The default italic mark. */
export const italicMark = defineEditorMark({
  type: "italic",
  attributes: {},
  selectors: ["em", "i"],
  parse() {
    return {};
  },
  render(_attributes, Content) {
    return Content({ as: "em" });
  },
});

/** The default underline mark. */
export const underlineMark = defineEditorMark({
  type: "underline",
  attributes: {},
  selectors: ["u"],
  parse() {
    return {};
  },
  render(_attributes, Content) {
    return Content({ as: "u" });
  },
});

/** Default inline marks. */
export const defaultEditorMarks = [
  linkMark,
  boldMark,
  italicMark,
  underlineMark,
];
