import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type {
  EditorContentSlot,
  EditorElementAttributes,
  EditorRenderContext,
} from "../elements";

const contentSlotAttribute = "data-editor-content-slot";

function renderRoot(type: string, content: ReactNode) {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(content);

  // React 19 emits image preload hints next to an SSR-rendered image. They are
  // transport metadata, not part of the element definition's DOM contract.
  if (host.childElementCount > 1) {
    for (const child of [...host.children]) {
      if (
        child instanceof HTMLLinkElement &&
        child.rel === "preload" &&
        child.getAttribute("as") === "image"
      ) {
        child.remove();
      }
    }
  }

  if (host.childElementCount !== 1 || host.childNodes.length !== 1) {
    throw new Error(
      `The renderer for "${type}" must return exactly one root HTML element.`,
    );
  }

  const rendered = host.firstElementChild as HTMLElement;

  for (const element of [
    rendered,
    ...rendered.querySelectorAll<HTMLElement>("[style]"),
  ]) {
    if (element.hasAttribute("style")) {
      element.style.cssText = element.style.cssText;
    }
  }

  return rendered;
}

/** Renders an atomic React element to the DOM used by ProseMirror. */
export function renderAtomicDOM({
  type,
  attributes,
  render,
}: {
  type: string;
  attributes: EditorElementAttributes;
  render: (
    attributes: EditorElementAttributes,
    context: EditorRenderContext,
  ) => ReactNode;
}) {
  return renderRoot(type, render(attributes, { textContent: "" }));
}

/** Renders a content-bearing React tree and locates its managed content slot. */
export function renderContentDOM({
  type,
  attributes,
  textContent,
  render,
}: {
  type: string;
  attributes: EditorElementAttributes;
  textContent: string;
  render: (
    attributes: EditorElementAttributes,
    Content: EditorContentSlot,
    context: EditorRenderContext,
  ) => ReactNode;
}) {
  const Content: EditorContentSlot = ({
    as = "div",
    html: _html,
    ...props
  } = {}) =>
    createElement(as, {
      ...props,
      [contentSlotAttribute]: "",
    });
  const rendered = renderRoot(
    type,
    render(attributes, Content, { textContent }),
  );
  const slots = [
    ...(rendered.hasAttribute(contentSlotAttribute) ? [rendered] : []),
    ...rendered.querySelectorAll<HTMLElement>(`[${contentSlotAttribute}]`),
  ];

  if (slots.length !== 1) {
    throw new Error(
      `The renderer for "${type}" must include exactly one Content slot.`,
    );
  }

  const contentDOM = slots[0];
  contentDOM.removeAttribute(contentSlotAttribute);
  return { dom: rendered, contentDOM };
}
