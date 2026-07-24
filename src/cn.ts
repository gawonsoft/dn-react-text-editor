/** Joins truthy CSS class names into a normalized class attribute value. */
export function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ").trim();
}
