import type { DetailedHTMLProps, HTMLAttributes } from "react";
import { decode } from "html-entities";
import { cn } from "./cn";
import { highlighter } from "./plugins/highlighter";
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
          const { language, value } = highlighter.highlightAuto(decode(code));

          return language
            ? `<code class="language-${language}">${value}</code>`
            : `<code>${value}</code>`;
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
        className={cn(options.className, className)}
        dangerouslySetInnerHTML={{
          __html: createInnerHTML(
            String(dangerouslySetInnerHTML?.__html || ""),
          ),
        }}
      />
    );
  };
}
