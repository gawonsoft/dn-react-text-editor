import { getNumericAttribute } from "../schema/attributes";
import { defineEditorElement } from "./define";

const mediaAttributes = {
  src: "",
  title: null as string | null,
  width: null as number | null,
  height: null as number | null,
};

/** The built-in image element. */
export const imageElement = defineEditorElement({
  type: "image",
  attributes: {
    ...mediaAttributes,
    alt: null as string | null,
    srcSet: null as string | null,
    sizes: null as string | null,
  },
  selector: "img[src]",
  parse(element) {
    return {
      src: element.getAttribute("src") || "",
      alt: element.getAttribute("alt"),
      title: element.getAttribute("title"),
      width: getNumericAttribute(element, "width"),
      height: getNumericAttribute(element, "height"),
      srcSet: element.getAttribute("srcset"),
      sizes: element.getAttribute("sizes"),
    };
  },
  serialize({ src, alt, title, width, height, srcSet, sizes }) {
    return {
      tag: "img",
      attributes: { src, alt, title, width, height, srcset: srcSet, sizes },
    };
  },
  render({ alt, title, width, height, srcSet, sizes, ...attributes }) {
    return (
      <img
        {...attributes}
        alt={alt ?? undefined}
        title={title ?? undefined}
        width={width ?? undefined}
        height={height ?? undefined}
        srcSet={srcSet ?? undefined}
        sizes={sizes ?? undefined}
      />
    );
  },
});

/** The built-in video element. */
export const videoElement = defineEditorElement({
  type: "video",
  attributes: { ...mediaAttributes, poster: null as string | null },
  selector: "video[src]",
  parse(element) {
    return {
      src: element.getAttribute("src") || "",
      title: element.getAttribute("title"),
      width: getNumericAttribute(element, "width"),
      height: getNumericAttribute(element, "height"),
      poster: element.getAttribute("poster"),
    };
  },
  serialize({ src, title, width, height, poster }) {
    return {
      tag: "video",
      attributes: {
        src,
        title,
        width,
        height,
        poster,
        playsinline: true,
        controls: true,
      },
    };
  },
  render({ width, height, poster, title, ...attributes }) {
    return (
      <video
        {...attributes}
        title={title ?? undefined}
        poster={poster ?? undefined}
        width={width ?? undefined}
        height={height ?? undefined}
        controls
        playsInline
      />
    );
  },
});

/** The built-in iframe element. */
export const iframeElement = defineEditorElement({
  type: "iframe",
  attributes: {
    ...mediaAttributes,
    allow: null as string | null,
    allowfullscreen: null as string | null,
    referrerPolicy: null as string | null,
    style: null as string | null,
  },
  selector: "iframe[src]",
  parse(element) {
    return {
      src: element.getAttribute("src") || "",
      title: element.getAttribute("title"),
      width: getNumericAttribute(element, "width"),
      height: getNumericAttribute(element, "height"),
      allow: element.getAttribute("allow"),
      allowfullscreen: element.getAttribute("allowfullscreen"),
      referrerPolicy: element.getAttribute("referrerpolicy"),
      style: element.getAttribute("style"),
    };
  },
  serialize(attributes) {
    return {
      tag: "iframe",
      attributes: {
        ...attributes,
        referrerpolicy: attributes.referrerPolicy,
        frameborder: 0,
      },
    };
  },
  render({
    width,
    height,
    referrerPolicy,
    allowfullscreen,
    title,
    allow,
    style: _style,
    ...attributes
  }) {
    return (
      <iframe
        {...attributes}
        title={title ?? undefined}
        allow={allow ?? undefined}
        width={width ?? undefined}
        height={height ?? undefined}
        referrerPolicy={
          referrerPolicy as React.HTMLAttributeReferrerPolicy | undefined
        }
        allowFullScreen={allowfullscreen === "true"}
      />
    );
  },
});

/** The default horizontal-rule element. */
export const horizontalRuleElement = defineEditorElement({
  type: "horizontal_rule",
  attributes: {},
  selector: "hr",
  parse() {
    return {};
  },
  serialize() {
    return { tag: "hr" };
  },
});

/** The default inline hard-break element. */
export const hardBreakElement = defineEditorElement({
  type: "hard_break",
  display: "inline",
  attributes: {},
  selector: "br",
  parse() {
    return {};
  },
  serialize() {
    return { tag: "br" };
  },
});

/** Default elements available in every editor instance. */
export const defaultEditorElements = [
  imageElement,
  videoElement,
  iframeElement,
  horizontalRuleElement,
  hardBreakElement,
];

/** Merges user elements into the default registry, allowing same-type overrides. */
