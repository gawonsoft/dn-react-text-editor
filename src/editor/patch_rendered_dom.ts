function hasMatchingStructure(
  current: globalThis.Node,
  next: globalThis.Node,
  currentContentDOM?: HTMLElement,
  nextContentDOM?: HTMLElement,
): boolean {
  const isCurrentContent = current === currentContentDOM;
  const isNextContent = next === nextContentDOM;

  if (isCurrentContent || isNextContent) {
    return (
      isCurrentContent &&
      isNextContent &&
      current instanceof HTMLElement &&
      next instanceof HTMLElement &&
      current.tagName === next.tagName
    );
  }

  if (current.nodeType !== next.nodeType) {
    return false;
  }

  if (
    current instanceof HTMLElement &&
    next instanceof HTMLElement &&
    current.tagName !== next.tagName
  ) {
    return false;
  }

  if (current.childNodes.length !== next.childNodes.length) {
    return false;
  }

  return [...current.childNodes].every((child, index) =>
    hasMatchingStructure(
      child,
      next.childNodes[index],
      currentContentDOM,
      nextContentDOM,
    ),
  );
}

function syncAttributes(current: HTMLElement, next: HTMLElement) {
  for (const attribute of [...current.attributes]) {
    if (!next.hasAttribute(attribute.name)) {
      current.removeAttribute(attribute.name);
    }
  }

  for (const attribute of [...next.attributes]) {
    if (current.getAttribute(attribute.name) !== attribute.value) {
      current.setAttribute(attribute.name, attribute.value);
    }
  }
}

function applyPatch(
  current: globalThis.Node,
  next: globalThis.Node,
  currentContentDOM?: HTMLElement,
  nextContentDOM?: HTMLElement,
) {
  if (current instanceof HTMLElement && next instanceof HTMLElement) {
    syncAttributes(current, next);
  }

  if (current === currentContentDOM && next === nextContentDOM) {
    return;
  }

  if (current.nodeType === globalThis.Node.TEXT_NODE) {
    if (current.nodeValue !== next.nodeValue) {
      current.nodeValue = next.nodeValue;
    }
    return;
  }

  [...current.childNodes].forEach((child, index) => {
    applyPatch(
      child,
      next.childNodes[index],
      currentContentDOM,
      nextContentDOM,
    );
  });
}

/** Updates a rendered shell without replacing ProseMirror's managed content DOM. */
export function patchRenderedDOM(
  current: HTMLElement,
  next: HTMLElement,
  currentContentDOM?: HTMLElement,
  nextContentDOM?: HTMLElement,
) {
  if (
    !hasMatchingStructure(
      current,
      next,
      currentContentDOM,
      nextContentDOM,
    )
  ) {
    return false;
  }

  applyPatch(current, next, currentContentDOM, nextContentDOM);
  return true;
}
