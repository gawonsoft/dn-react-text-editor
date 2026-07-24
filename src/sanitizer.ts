import DOMPurify from "dompurify";

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
