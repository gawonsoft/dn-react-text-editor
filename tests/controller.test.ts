/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { TextEditorController } from "../src/text_editor_controller";

function createController(defaultValue = "<p>Initial</p>") {
  const container = document.createElement("div");
  const controller = new TextEditorController({ defaultValue });
  controller.bind(container);

  return controller;
}

describe("TextEditorController", () => {
  it("keeps one mounted view and labels external and command changes", () => {
    const controller = createController();
    const changes: string[] = [];
    controller.subscribe((change) => changes.push(change.origin));

    controller.bind(document.createElement("div"));
    controller.value = "<p>External</p>";
    controller.commands.clear();

    expect(changes).toEqual(["external", "command"]);
    expect(controller.value).toBe("<p></p>");
  });

  it("cancels active upload adapters", async () => {
    let aborted = false;
    const controller = new TextEditorController({
      upload: {
        upload: (_file, { signal }) =>
          new Promise((_, reject) => {
            signal.addEventListener("abort", () => {
              aborted = true;
              reject(new DOMException("Aborted", "AbortError"));
            });
          }),
      },
    });
    controller.bind(document.createElement("div"));

    const upload = controller.attachFile([
      new File(["image"], "image.png", { type: "image/png" }),
    ]);
    controller.cancelUploads();
    await upload;

    expect(aborted).toBe(true);
  });

  it("serializes the same React trees used by default nodes and marks", () => {
    const controller = createController(
      '<h2 style="text-align: center">Title</h2><ul><li><p><strong>One</strong></p></li></ul><pre><code>const value = 1;</code></pre>',
    );

    expect(controller.value).toContain(
      '<h2 id="title" style="text-align: center;">Title</h2>',
    );
    expect(controller.value).toContain(
      "<ul><li><p><strong>One</strong></p></li></ul>",
    );
    expect(controller.value).toContain(
      '<pre class="hljs"><code>const value = 1;</code></pre>',
    );
  });
});
