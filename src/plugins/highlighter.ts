import hljs from "highlight.js/lib/core";
import css from "highlight.js/lib/languages/css";
import ts from "highlight.js/lib/languages/typescript";
import js from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";

hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("javascript", js);
hljs.registerLanguage("typescript", ts);
hljs.registerLanguage("xml", xml);

/** Lists the language identifiers registered on the bundled Highlight.js core. */
export const supportedLanguages = [
  "css",
  "json",
  "javascript",
  "typescript",
  "xml",
];

/** Registers one application-selected Highlight.js language. */
export function registerHighlightLanguage(
  name: string,
  language: Parameters<typeof hljs.registerLanguage>[1],
) {
  hljs.registerLanguage(name, language);
}

/** Exposes the configured Highlight.js instance used by read-only views. */
export const highlighter = hljs;
