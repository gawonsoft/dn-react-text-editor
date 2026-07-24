/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import {
  defineEditorContainer,
  defineEditorElement,
  defineEditorMark,
} from "../src/elements";
import { TextEditorController } from "../src/text_editor_controller";

const fileElement = defineEditorElement({
  type: "file",
  display: "inline",
  attributes: { href: "", name: "", size: null as number | null },
  selector: 'a[data-editor-element="file"]',
  parse(element) {
    return {
      href: element.dataset.href || "",
      name: element.dataset.name || "",
      size: element.dataset.size ? Number(element.dataset.size) : null,
    };
  },
  render({ href, name, size }) {
    return (
      <a
        data-editor-element="file"
        data-href={href}
        data-name={name}
        data-size={size}
        href={href}
        download={name}
      >
        {name}
      </a>
    );
  },
});

describe("registered editor elements", () => {
  it("inserts and serializes an uploaded custom file element", async () => {
    const controller = new TextEditorController({
      nodes: [fileElement],
      upload: {
        async upload(_file, { onProgress }) {
          onProgress(100);
          return fileElement.create({
            href: "https://storage.example.com/report.pdf",
            name: "report.pdf",
            size: 1024,
          });
        },
      },
    });
    controller.bind(document.createElement("div"));

    await controller.attachFile([
      new File(["report"], "report.pdf", { type: "application/pdf" }),
    ]);

    expect(controller.value).toContain('data-editor-element="file"');
    expect(controller.value).toContain('<a ');
    expect(controller.value).toContain('download="report.pdf"');
    expect(controller.value).toContain('data-name="report.pdf"');
    expect(controller.value).toContain(
      'data-href="https://storage.example.com/report.pdf"',
    );
    expect(controller.value).toContain(">report.pdf</a>");

    const preview = document.createElement("div");
    preview.innerHTML = controller.value;
    expect(preview.querySelector("a")?.textContent).toBe("report.pdf");
    expect(preview.querySelector("a")?.getAttribute("download")).toBe(
      "report.pdf",
    );

    const restored = new TextEditorController({
      nodes: [fileElement],
      defaultValue: controller.value,
    });
    restored.bind(document.createElement("div"));
    expect(restored.value).toContain('data-size="1024"');
    expect(restored.value).toContain(">report.pdf</a>");
  });

  const calloutNode = defineEditorContainer({
    type: "callout",
    attributes: { tone: "info" },
    selector: "aside[data-callout]",
    content: "inline*",
    group: "block",
    parse(element) {
      return { tone: element.dataset.tone || "info" };
    },
    serialize({ tone }) {
      return {
        tag: "aside",
        attributes: { "data-callout": "true", "data-tone": tone },
      };
    },
    render({ tone }, Content) {
      return (
        <aside data-testid="callout" data-tone={tone}>
          <Content as="span" />
        </aside>
      );
    },
  });

  const highlightMark = defineEditorMark({
    type: "highlight",
    attributes: { color: "yellow" },
    selectors: ["mark[data-highlight]"],
    parse(element) {
      return { color: element.dataset.color || "yellow" };
    },
    serialize({ color }) {
      return {
        tag: "mark",
        attributes: { "data-highlight": "true", "data-color": color },
      };
    },
    render({ color }, Content) {
      return (
        <mark data-testid="highlight" data-color={color}>
          <Content />
        </mark>
      );
    },
  });

  it("round-trips custom container and mark definitions", () => {
    const container = document.createElement("div");
    const controller = new TextEditorController({
      nodes: [calloutNode],
      marks: [highlightMark],
      defaultValue:
        '<aside data-callout data-tone="warning"><mark data-highlight data-color="orange">Read me</mark></aside>',
    });
    controller.bind(container);

    expect(controller.value).toContain('data-callout="true"');
    expect(controller.value).toContain('data-tone="warning"');
    expect(controller.value).toContain('data-highlight="true"');
    expect(container.querySelector('[data-testid="callout"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="highlight"]')).not.toBeNull();
  });
});
