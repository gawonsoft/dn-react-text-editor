import {
  createElement,
  useLayoutEffect,
  useRef,
  type DetailedHTMLProps,
  type HTMLAttributes,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { decode } from "html-entities";
import { cn } from "./cn";
import type {
  EditorContentSlot,
  EditorElementAttributes,
  EditorMark,
  EditorNode,
} from "./elements";
import {
  highlighter,
  registerHighlightLanguage,
  supportedLanguages,
} from "./plugins/highlighter";
import { escapeHTML, sanitizeHTML } from "./sanitizer";

/**
 * Sanitizes editor output, highlights code blocks, and hardens external links
 * for use in an HTML preview.
 */
export function createInnerHTML(raw: string) {
  const transformed = sanitizeHTML(raw)
    .replace(/<\/p>/g, "<br></p>")
    .replace(/(<p><br><\/p>)+$/g, "")
    .replace(
      /<code class="language-(\w+)">([\s\S]*?)<\/code>/g,
      (_, lang, code) => {
        if (lang === "undefined") {
          return `<code>${escapeHTML(decode(code))}</code>`;
        }

        try {
          if (!highlighter.getLanguage(lang)) {
            return `<code class="language-${lang}">${escapeHTML(decode(code))}</code>`;
          }

          const { value } = highlighter.highlight(decode(code), {
            language: lang,
            ignoreIllegals: true,
          });
          return `<code class="language-${lang}">${value}</code>`;
        } catch {
          return `<code class="language-${lang}">${escapeHTML(decode(code))}</code>`;
        }
      },
    )
    .replace(
      /<a([^>]*target="_blank"[^>]*)>(.*?)<\/a>/g,
      (_, attrs, content) => {
        return `<a${attrs} rel="noopener noreferrer" target="_blank">${content}<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display:inline; height:1em;"><path d="M18.25 15.5a.75.75 0 0 1-.75-.75V7.56L7.28 17.78a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L16.44 6.5H9.25a.75.75 0 0 1 0-1.5h9a.75.75 0 0 1 .75.75v9a.75.75 0 0 1-.75.75Z"></path></svg></a>`;
      },
    );

  return sanitizeHTML(transformed);
}

type TextEditorViewOptions = {
  className?: string;
  /** Registered node renderers used to replace matching serialized HTML. */
  nodes?: readonly EditorNode[];
  /** Registered mark renderers used to replace matching serialized HTML. */
  marks?: readonly EditorMark[];
};

function mountMarkRenderers(
  container: HTMLElement,
  marks: readonly EditorMark[],
) {
  const roots: Root[] = [];

  for (const mark of marks) {
    if (!mark.render) continue;

    for (const source of container.querySelectorAll(mark.selectors.join(","))) {
      const attributes = mark.parse(source as HTMLElement);
      if (!attributes) continue;

      const host = document.createElement("span");
      const childHTML = source.innerHTML;
      source.replaceWith(host);
      const root = createRoot(host);
      const Content: EditorContentSlot = ({
        as = "span",
        html = childHTML,
      } = {}) =>
        createElement(as, { dangerouslySetInnerHTML: { __html: html } });
      root.render(mark.render(attributes as EditorElementAttributes, Content));
      roots.push(root);
    }
  }

  return roots;
}

function mountNodeRenderers(
  container: HTMLElement,
  nodes: readonly EditorNode[],
) {
  const roots: Root[] = [];

  for (const node of nodes) {
    if (!node.render) {
      continue;
    }

    const selectors = Array.isArray(node.selector)
      ? node.selector
      : [node.selector];

    for (const source of container.querySelectorAll(selectors.join(","))) {
      const attributes = node.parse(source as HTMLElement);
      if (!attributes) {
        continue;
      }

      const host = document.createElement("div");
      const childHTML = source.innerHTML;
      source.replaceWith(host);
      const root = createRoot(host);
      if (node.kind === "atomic") {
        root.render(node.render(attributes as EditorElementAttributes));
      } else {
        const Content: EditorContentSlot = ({
          as = "div",
          html = childHTML,
        } = {}) =>
          createElement(as, { dangerouslySetInnerHTML: { __html: html } });
        root.render(
          node.render(attributes as EditorElementAttributes, Content),
        );
      }
      roots.push(root);
    }
  }

  return () => roots.forEach((root) => root.unmount());
}

/** Creates a React preview component that sanitizes HTML and renders registered nodes and marks. */
export function createTextEditorView(options: TextEditorViewOptions = {}) {
  /** Renders sanitized HTML with the configured and caller-supplied class names. */
  return function Component({
    className,
    dangerouslySetInnerHTML,
    ...props
  }: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const html = createInnerHTML(String(dangerouslySetInnerHTML?.__html || ""));

    useLayoutEffect(() => {
      if (!containerRef.current || (!options.nodes && !options.marks)) {
        return;
      }

      const markRoots = options.marks
        ? mountMarkRenderers(containerRef.current, options.marks)
        : [];
      const unmountNodes = options.nodes
        ? mountNodeRenderers(containerRef.current, options.nodes)
        : undefined;
      return () => {
        markRoots.forEach((root) => root.unmount());
        unmountNodes?.();
      };
    }, [html]);

    return (
      <div
        {...props}
        ref={containerRef}
        className={cn(options.className, className)}
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    );
  };
}

export { registerHighlightLanguage, supportedLanguages };
