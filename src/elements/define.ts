import type {
  EditorContainer,
  EditorContainerDefinition,
  EditorElement,
  EditorElementAttributes,
  EditorElementDefinition,
  EditorElementRenderDefinition,
  EditorMark,
  EditorMarkDefinition,
} from "./types";

/** Defines a high-level atomic editor element and its typed value factory. */
export function defineEditorElement<Attributes extends EditorElementAttributes>(
  definition:
    | EditorElementDefinition<Attributes>
    | EditorElementRenderDefinition<Attributes>,
): EditorElement<Attributes> {
  return {
    ...definition,
    kind: "atomic",
    create(attributes) {
      return { type: definition.type, attributes };
    },
    withRenderer(render) {
      return defineEditorElement({ ...definition, render });
    },
  };
}

/** Defines a container node whose renderer receives a package-managed content slot. */
export function defineEditorContainer<
  Attributes extends EditorElementAttributes,
>(
  definition: EditorContainerDefinition<Attributes>,
): EditorContainer<Attributes> {
  return {
    ...definition,
    kind: "container",
    create(attributes) {
      return { type: definition.type, attributes };
    },
    withRenderer(render) {
      return defineEditorContainer({ ...definition, render });
    },
  };
}

/** Defines a high-level inline mark and its typed value factory. */
export function defineEditorMark<Attributes extends EditorElementAttributes>(
  definition: EditorMarkDefinition<Attributes>,
): EditorMark<Attributes> {
  return {
    ...definition,
    create(attributes) {
      return { type: definition.type, attributes };
    },
    withRenderer(render) {
      return defineEditorMark({ ...definition, render });
    },
  };
}
