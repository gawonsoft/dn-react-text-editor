/** @vitest-environment jsdom */

import { act, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TextEditor } from "../src/text_editor";

const reactEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

reactEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("TextEditor", () => {
  it("binds the editor without nesting a React flush", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(
        <TextEditor name="content" defaultValue="<p>Initial value</p>" />,
      );
      await Promise.resolve();
    });

    expect(host.querySelector(".ProseMirror")?.textContent).toBe(
      "Initial value",
    );
    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).includes("flushSync was called from inside a lifecycle"),
      ),
    ).toBe(false);

    await act(async () => {
      root.unmount();
      await Promise.resolve();
    });
  });

  it("keeps the editor bound when React replays layout effects", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(
        <StrictMode>
          <TextEditor defaultValue="<p>Client navigation</p>" />
        </StrictMode>,
      );
      await Promise.resolve();
    });

    expect(host.querySelector(".ProseMirror")?.textContent).toBe(
      "Client navigation",
    );

    await act(async () => {
      root.unmount();
      await Promise.resolve();
    });

    expect(host.querySelector(".ProseMirror")).toBeNull();
  });

  it("applies controlled value changes inside React effects without nesting a flush", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(<TextEditor value="<p>Initial value</p>" />);
    });

    await act(async () => {
      root.render(
        <TextEditor value="<h2><strong>Controlled value</strong></h2>" />,
      );
    });

    expect(host.querySelector(".ProseMirror")?.textContent).toBe(
      "Controlled value",
    );
    expect(consoleError).not.toHaveBeenCalled();

    await act(async () => {
      root.unmount();
      await Promise.resolve();
    });
  });
});
