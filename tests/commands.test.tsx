/** @vitest-environment jsdom */

import { TextSelection } from "prosemirror-state";
import { describe, expect, it } from "vitest";
import {
  toggleBlockType,
  toggleEditorMark,
  wrapInNode,
} from "../src/commands";
import {
  defaultEditorMarks,
  defaultEditorNodes,
  defineEditorContainer,
  defineEditorMark,
  horizontalRuleElement,
  resolveEditorMarks,
  resolveEditorNodes,
} from "../src/elements";
import { TextEditorController } from "../src/text_editor_controller";

const paragraphElement = defineEditorContainer({
  type: "paragraph",
  attributes: { class: null as string | null },
  selector: "p",
  content: "inline*",
  group: "block",
  parse(element) {
    return { class: element.getAttribute("class") };
  },
  render({ class: className }, Content) {
    return Content({ as: "p", className: className ?? undefined });
  },
});

const codeMark = defineEditorMark({
  type: "code",
  attributes: {},
  selectors: ["code"],
  parse() {
    return {};
  },
  render(_attributes, Content) {
    return Content({ as: "code" });
  },
});

describe("custom editor commands", () => {
  it("formats custom marks and blocks registered by a consumer", () => {
    const controller = new TextEditorController({
      defaultValue: "<p>Body</p>",
      nodes: resolveEditorNodes([paragraphElement], defaultEditorNodes),
      marks: resolveEditorMarks([codeMark], defaultEditorMarks),
    });
    controller.bind(document.createElement("div"));

    const view = controller.getView();
    view.dispatch(
      view.state.tr.setSelection(TextSelection.create(view.state.doc, 1, 5)),
    );

    expect(controller.execute(toggleEditorMark("code"))).toBe(true);
    expect(
      controller.execute(toggleBlockType("paragraph", { class: "subheading" })),
    ).toBe(true);
    expect(controller.execute(wrapInNode("blockquote"))).toBe(true);

    expect(controller.value).toContain(
      '<blockquote><p class="subheading"><code>Body</code></p></blockquote>',
    );

    view.dispatch(
      view.state.tr.setSelection(TextSelection.atEnd(view.state.doc)),
    );
    controller.insertElement(horizontalRuleElement.create({}));

    expect(controller.value).toContain("<hr>");
  });
});
