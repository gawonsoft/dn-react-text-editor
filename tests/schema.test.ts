/** @vitest-environment jsdom */

import { DOMParser as ProseMirrorDOMParser } from "prosemirror-model";
import { describe, expect, it } from "vitest";
import { createSchema } from "../src/schema";

/** Parses markup with the package schema for HTML round-trip assertions. */
function parseHTML(html: string) {
  const container = document.createElement("div");
  container.innerHTML = html;

  return ProseMirrorDOMParser.fromSchema(createSchema()).parse(container);
}

describe("createSchema", () => {
  it("preserves heading alignment", () => {
    const document = parseHTML('<h2 style="text-align: center">Title</h2>');

    expect(document.firstChild?.attrs).toMatchObject({
      level: 2,
      align: "center",
    });
  });

  it("normalizes media dimensions and iframe referrer policy", () => {
    const document = parseHTML(
      '<img src="image.png" width="320" height="180"><iframe src="https://example.com" width="640" height="360" referrerpolicy="no-referrer"></iframe>',
    );

    expect(document.child(0).attrs).toMatchObject({
      width: 320,
      height: 180,
    });
    expect(document.child(1).attrs).toMatchObject({
      width: 640,
      height: 360,
      referrerPolicy: "no-referrer",
    });
  });

  it("parses hard breaks through the inline element registry", () => {
    const document = parseHTML("<p>First<br>Second</p>");

    expect(document.firstChild?.childCount).toBe(3);
    expect(document.firstChild?.child(1).type.name).toBe("hard_break");
  });
});
