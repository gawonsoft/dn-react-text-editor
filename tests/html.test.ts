/** @vitest-environment jsdom */

import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { TextEditorView } from "../src/view";

function renderValue(value: string) {
  const container = document.createElement("div");
  const root = createRoot(container);
  flushSync(() => root.render(createElement(TextEditorView, { value })));
  return { container, root };
}

describe("TextEditorView", () => {
  it("removes executable HTML and unsafe iframe URLs", () => {
    const { container, root } = renderValue(
      '<img src="image.png" onerror="alert(1)"><script>alert(1)</script><iframe src="javascript:alert(1)"></iframe>',
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")?.hasAttribute("onerror")).toBe(false);
    expect(
      container.querySelector("iframe")?.getAttribute("src") ?? "",
    ).not.toMatch(/^javascript:/i);
    root.unmount();
  });

  it("keeps highlighted code as text rather than executable markup", () => {
    const { container, root } = renderValue(
      '<pre><code class="language-javascript">&lt;img src=x onerror=alert(1)&gt;</code></pre>',
    );

    expect(container.querySelector("code")?.textContent).toContain(
      "<img src=x",
    );
    expect(container.querySelector("code img")).toBeNull();
    root.unmount();
  });

  it("preserves blank link targets and hardens their relationship", () => {
    const { container, root } = renderValue(
      '<p><a href="https://example.com" target="_blank">External</a></p>',
    );
    const link = container.querySelector("a");

    expect(link?.getAttribute("target")).toBe("_blank");
    expect(link?.getAttribute("rel")?.split(" ")).toEqual(
      expect.arrayContaining(["noopener", "noreferrer"]),
    );
    root.unmount();
  });
});
