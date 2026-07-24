/** Parses an optional HTML dimension attribute without admitting NaN or infinity. */
export function getNumericAttribute(element: HTMLElement, name: string) {
  const value = element.getAttribute(name);

  if (value === null || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}
