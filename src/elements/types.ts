import type { JSX, ReactNode } from "react";

type ElementHandler<Attributes, Result> = {
  bivarianceHack(
    attributes: Attributes,
    context: EditorRenderContext,
  ): Result;
}["bivarianceHack"];

type ValueHandler<Attributes, Result> = {
  bivarianceHack(attributes: Attributes): Result;
}["bivarianceHack"];

type ContainerHandler<Attributes, Result> = {
  bivarianceHack(
    attributes: Attributes,
    Content: EditorContentSlot,
    context: EditorRenderContext,
  ): Result;
}["bivarianceHack"];

/** Values that can be stored as attributes on an editor element. */
export type EditorElementAttributes = Record<
  string,
  string | number | boolean | null | undefined
>;

/** Serialized value that identifies an element registered with the editor. */
export type EditorElementValue<
  Attributes extends EditorElementAttributes = EditorElementAttributes,
> = {
  type: string;
  attributes: Attributes;
};

/** Document-derived values available while an element renders. */
export type EditorRenderContext = {
  textContent: string;
};

/** A package-managed slot where a node or mark renderer places its content. */
export type EditorContentSlot = (
  props?: {
    as?: keyof JSX.IntrinsicElements;
    html?: string;
    [attribute: string]: unknown;
  },
) => ReactNode;

/** Defines one atomic editor node without exposing ProseMirror schema details. */
export type EditorElementDefinition<
  Attributes extends EditorElementAttributes,
> = {
  type: string;
  /** Controls whether the atomic node participates in inline or block content. */
  display?: "inline" | "block";
  attributes: Attributes;
  selector: string | readonly string[];
  parse: (element: HTMLElement) => Attributes | null;
  /**
   * Produces one semantic root element used by the editor and saved HTML.
   * It must include the attributes read by `selector` and `parse`.
   */
  render: ElementHandler<Attributes, ReactNode>;
};

/** A registered element with a typed helper for creating upload or command values. */
export type EditorElement<
  Attributes extends EditorElementAttributes = EditorElementAttributes,
> = EditorElementDefinition<Attributes> & {
  kind: "atomic";
  create: ValueHandler<Attributes, EditorElementValue<Attributes>>;
  withRenderer: (
    render: ElementHandler<Attributes, ReactNode>,
  ) => EditorElement<Attributes>;
};

/** Defines a block node that contains editable inline, text, or block content. */
export type EditorContainerDefinition<
  Attributes extends EditorElementAttributes,
> = Omit<EditorElementDefinition<Attributes>, "render"> & {
  content: string;
  group?: string;
  marks?: string;
  defining?: boolean;
  code?: boolean;
  render: ContainerHandler<Attributes, ReactNode>;
};

/** A registered container node with a typed renderer helper. */
export type EditorContainer<
  Attributes extends EditorElementAttributes = EditorElementAttributes,
> = EditorContainerDefinition<Attributes> & {
  kind: "container";
  create: ValueHandler<Attributes, EditorElementValue<Attributes>>;
  withRenderer: (
    render: ContainerHandler<Attributes, ReactNode>,
  ) => EditorContainer<Attributes>;
};

/** A high-level node definition, either atomic or containing editable content. */
export type EditorNode = EditorElement | EditorContainer;

/** Defines an inline mark without exposing ProseMirror mark specifications. */
export type EditorMarkDefinition<Attributes extends EditorElementAttributes> = {
  type: string;
  attributes: Attributes;
  selectors: readonly string[];
  parse: (element: HTMLElement) => Attributes | null;
  render: ContainerHandler<Attributes, ReactNode>;
  inclusive?: boolean;
};

/** A registered inline mark with a typed value factory. */
export type EditorMark<
  Attributes extends EditorElementAttributes = EditorElementAttributes,
> = EditorMarkDefinition<Attributes> & {
  create: ValueHandler<Attributes, EditorElementValue<Attributes>>;
  withRenderer: (
    render: ContainerHandler<Attributes, ReactNode>,
  ) => EditorMark<Attributes>;
};
