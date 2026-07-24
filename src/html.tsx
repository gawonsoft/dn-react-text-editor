import type { DetailedHTMLProps, HTMLAttributes } from "react";
import DOMPurify from "dompurify";
import { highlighter } from "./plugins/highlighter";
import { decode } from "html-entities";
import { cn } from "./cn";

const sanitizerOptions = {
  ADD_TAGS: ["iframe", "video"],
  ADD_ATTR: [
    "allow",
    "allowfullscreen",
    "controls",
    "frameborder",
    "playsinline",
    "poster",
    "referrerpolicy",
  ],
  ADD_DATA_URI_TAGS: ["video"],
};

/** Sanitizes editor HTML while retaining the supported media elements and attributes. */
export function sanitizeHTML(raw: string) {
  return DOMPurify.sanitize(raw, sanitizerOptions);
}

/** Escapes text before it is inserted into an HTML string. */
export function escapeHTML(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
          const { language, value } = highlighter.highlightAuto(decode(code));

          return language
            ? `<code class="language-${language}">${value}</code>`
            : `<code>${value}</code>`;
        } catch (e) {
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

/** Creates a React preview component that sanitizes supplied editor HTML. */
export function createTextEditorView(options: { className?: string } = {}) {
  /** Renders sanitized HTML with the configured and caller-supplied class names. */
  return function Component({
    className,
    dangerouslySetInnerHTML,
    ...props
  }: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
    return (
      <div
        {...props}
        className={cn(options?.className, className)}
        dangerouslySetInnerHTML={{
          __html: createInnerHTML(
            String(dangerouslySetInnerHTML?.__html || ""),
          ),
        }}
      />
    );
  };
}
