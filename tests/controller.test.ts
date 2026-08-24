/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { history } from "prosemirror-history";
import { clear } from "../src/commands";
import { defaultEditorMarks, defaultEditorNodes } from "../src/elements";
import {
  attachFiles,
  cancelFileAttachments,
  fileAttachmentPlugin,
} from "../src/plugins/file_attachment";
import { TextEditorController } from "../src/text_editor_controller";

function createRichController(
  defaultValue = "<p>Initial</p>",
  fileAttachments = {},
) {
  const container = document.createElement("div");
  const controller = new TextEditorController({
    defaultValue,
    nodes: defaultEditorNodes,
    marks: defaultEditorMarks,
    plugins: [history(), fileAttachmentPlugin(fileAttachments)],
  });
  controller.bind(container);

  return controller;
}

describe("TextEditorController", () => {
  it("keeps one mounted view and labels external and command changes", () => {
    const controller = createRichController();
    const changes: string[] = [];
    controller.subscribe((change) => changes.push(change.origin));

    controller.bind(document.createElement("div"));
    controller.value = "<p>External</p>";
    controller.execute(clear);

    expect(changes).toEqual(["external", "command"]);
    expect(controller.value).toBe("<p></p>");
  });

  it("cancels active upload adapters", async () => {
    let aborted = false;
    const controller = createRichController("<p></p>", {
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

    controller.execute(
      attachFiles([
        new File(["image"], "image.png", { type: "image/png" }),
      ]),
    );
    await Promise.resolve();
    controller.execute(cancelFileAttachments);
    await Promise.resolve();

    expect(aborted).toBe(true);
  });

  it("serializes the same React trees used by default nodes and marks", () => {
    const controller = createRichController(
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

  it("does not serialize React image preload hints as editor content", () => {
    const controller = createRichController(
      '<img src="https://cdn.example.com/image.png" alt="Example">',
    );

    expect(controller.value).toContain(
      '<img src="https://cdn.example.com/image.png" alt="Example">',
    );
    expect(controller.value).not.toContain('<link rel="preload"');
  });

  it("updates rendered container attributes without replacing contentDOM", () => {
    const container = document.createElement("div");
    const controller = createRichController("<h2>Title</h2>");
    controller.dispose();
    controller.bind(container);
    const heading = container.querySelector("h2");
    const view = controller.getView();

    view.dispatch(view.state.tr.insertText(" Updated", 6));

    expect(container.querySelector("h2")).toBe(heading);
    expect(heading?.id).toBe("title-updated");
    expect(heading?.textContent).toBe("Title Updated");
  });
});
