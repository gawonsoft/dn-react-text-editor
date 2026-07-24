import { createElement, createRef } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import type { Node as ProseMirrorNode } from "prosemirror-model";
import type { NodeView, NodeViewConstructor } from "prosemirror-view";
import type {
  EditorContainer,
  EditorContentSlot,
  EditorElementAttributes,
  EditorNode,
} from "../elements";

class ReactElementNodeView implements NodeView {
  readonly dom: HTMLElement;
  readonly #root: Root;

  constructor(
    private readonly element: Extract<EditorNode, { kind: "atomic" }>,
    node: ProseMirrorNode,
  ) {
    this.dom = document.createElement(
      element.display === "inline" ? "span" : "div",
    );
    this.#root = createRoot(this.dom);
    this.render(node);
  }

  update(node: ProseMirrorNode) {
    if (node.type.name !== this.element.type) return false;
    this.render(node);
    return true;
  }

  destroy() {
    this.#root.unmount();
  }

  ignoreMutation() {
    return true;
  }

  private render(node: ProseMirrorNode) {
    this.#root.render(
      this.element.render(node.attrs as EditorElementAttributes, {
        textContent: node.textContent,
      }),
    );
  }
}

class ReactContainerNodeView implements NodeView {
  readonly dom = document.createElement("div");
  contentDOM?: HTMLElement;
  readonly #root: Root;

  constructor(
    private readonly container: EditorContainer,
    node: ProseMirrorNode,
  ) {
    this.#root = createRoot(this.dom);
    this.render(node);
  }

  update(node: ProseMirrorNode) {
    if (node.type.name !== this.container.type) return false;
    this.render(node);
    return true;
  }

  destroy() {
    this.#root.unmount();
  }

  private render(node: ProseMirrorNode) {
    const slotRef = createRef<HTMLElement>();
    const Content: EditorContentSlot = ({
      as = "div",
      html: _html,
      ...props
    } = {}) => createElement(as, { ...props, ref: slotRef });

    flushSync(() => {
      this.#root.render(
        this.container.render(
          node.attrs as EditorElementAttributes,
          Content,
          { textContent: node.textContent },
        ),
      );
    });
    this.contentDOM = slotRef.current || undefined;
  }
}

/** Creates internal React-backed node views for registered atomic and container nodes. */
export function createElementNodeViews(nodes: readonly EditorNode[]) {
  const atomic = nodes
    .filter(
      (node): node is Extract<EditorNode, { kind: "atomic" }> =>
        node.kind === "atomic",
    )
    .map((node) => [
      node.type,
      (viewNode: ProseMirrorNode) => new ReactElementNodeView(node, viewNode),
    ]);
  const containers = nodes
    .filter(
      (node): node is EditorContainer => node.kind === "container",
    )
    .map((node) => [
      node.type,
      (viewNode: ProseMirrorNode) => new ReactContainerNodeView(node, viewNode),
    ]);

  return Object.fromEntries([...atomic, ...containers]) as Record<
    string,
    NodeViewConstructor
  >;
}
