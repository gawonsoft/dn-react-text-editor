import type { ReactNode } from "react";

type ElementHandler<Attributes, Result> = {
  bivarianceHack(attributes: Attributes): Result;
}["bivarianceHack"];

type ContainerHandler<Attributes, Result> = {
  bivarianceHack(attributes: Attributes, Content: EditorContentSlot): Result;
}["bivarianceHack"];

type EditorElementRenderer<Attributes> = ElementHandler<Attributes, ReactNode>;

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

/** Stable saved HTML used to preserve an element through HTML round-trips. */
export type EditorElementHTML = {
  tag: string;
  attributes?: Record<string, string | number | boolean | null | undefined>;
  /** Plain text rendered inside the saved element, escaped during serialization. */
  content?: string;
};

/** Context available while a node serializes document content to HTML. */
export type EditorElementSerializeContext = {
  textContent: string;
};

/** A package-managed slot where a node or mark renderer places its content. */
export type EditorContentSlot = (props?: {
  as?: "span" | "div";
  html?: string;
}) => ReactNode;

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
  /** Produces saved HTML; its tag and attributes must match `selector` and `parse`. */
  serialize: {
    bivarianceHack(
      attributes: Attributes,
      context: EditorElementSerializeContext,
    ): EditorElementHTML;
  }["bivarianceHack"];
  /** Optionally enhances the interactive editor and package preview UI. */
  render?: EditorElementRenderer<Attributes>;
};

/** Defines an atomic element from one React tree used for editing and saved HTML. */
export type EditorElementRenderDefinition<
  Attributes extends EditorElementAttributes,
> = Omit<EditorElementDefinition<Attributes>, "serialize" | "render"> & {
  /**
   * Produces one semantic root element. It is statically rendered for saved
   * HTML, so it must include the attributes read by `selector` and `parse`.
   */
  render: EditorElementRenderer<Attributes>;
  serialize?: never;
};

/** A registered element with a typed helper for creating upload or command values. */
export type EditorElement<
  Attributes extends EditorElementAttributes = EditorElementAttributes,
> = (EditorElementDefinition<Attributes> | EditorElementRenderDefinition<Attributes>) & {
  kind: "atomic";
  create: ElementHandler<Attributes, EditorElementValue<Attributes>>;
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
  contentTag?: string;
  render?: ContainerHandler<Attributes, ReactNode>;
};

/** A registered container node with a typed renderer helper. */
export type EditorContainer<
  Attributes extends EditorElementAttributes = EditorElementAttributes,
> = EditorContainerDefinition<Attributes> & {
  kind: "container";
  create: ElementHandler<Attributes, EditorElementValue<Attributes>>;
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
  serialize: ElementHandler<Attributes, EditorElementHTML>;
  render?: ContainerHandler<Attributes, ReactNode>;
  inclusive?: boolean;
};

/** A registered inline mark with a typed value factory. */
export type EditorMark<
  Attributes extends EditorElementAttributes = EditorElementAttributes,
> = EditorMarkDefinition<Attributes> & {
  create: ElementHandler<Attributes, EditorElementValue<Attributes>>;
  withRenderer: (
    render: ContainerHandler<Attributes, ReactNode>,
  ) => EditorMark<Attributes>;
};
