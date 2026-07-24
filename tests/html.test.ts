/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { createInnerHTML } from "../src/html";

describe("createInnerHTML", () => {
  it("removes executable HTML and unsafe iframe URLs", () => {
    const container = document.createElement("div");

    container.innerHTML = createInnerHTML(
      '<img src="image.png" onerror="alert(1)"><script>alert(1)</script><iframe src="javascript:alert(1)"></iframe>',
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")?.hasAttribute("onerror")).toBe(false);
    expect(
      container.querySelector("iframe")?.getAttribute("src") ?? "",
    ).not.toMatch(/^javascript:/i);
  });

  it("keeps highlighted code as text rather than executable markup", () => {
    const container = document.createElement("div");

    container.innerHTML = createInnerHTML(
      '<pre><code class="language-javascript">&lt;img src=x onerror=alert(1)&gt;</code></pre>',
    );

    expect(container.querySelector("code")?.textContent).toContain(
      "<img src=x",
    );
    expect(container.querySelector("code img")).toBeNull();
  });
});
