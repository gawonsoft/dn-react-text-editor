import type { Schema } from "prosemirror-model";
import {
  Plugin,
  PluginKey,
  type Command,
  type EditorState,
  type Transaction,
} from "prosemirror-state";
import {
  Decoration,
  DecorationSet,
  type EditorView,
} from "prosemirror-view";
import { editorChangeOriginKey } from "../../events";
import type {
  EditorElementAttributes,
  EditorElementValue,
} from "../../elements";
import type { UploadAdapter } from "../../upload";
import { uploadFileAsBase64 } from "./base64";

/** Configuration for the optional file-attachment plugin. */
export type FileAttachmentOptions = {
  upload?: UploadAdapter;
  onError?: (error: unknown, file: File) => void;
};

type PlaceholderAction =
  | {
      add: {
        id: object;
        pos: number;
        type: string;
        width?: number;
        height?: number;
      };
    }
  | { progress: { id: object; progress: number } }
  | { remove: { id: object } };

type FileAttachmentState = {
  decorations: DecorationSet;
  attach: (
    view: EditorView,
    files: readonly File[],
    pos?: number,
  ) => Promise<void>;
  cancel: () => void;
};

/** Identifies the file-attachment plugin and exposes its per-editor state. */
export const fileAttachmentPluginKey =
  new PluginKey<FileAttachmentState>("file-attachments");

function createPlaceholder(action: Extract<PlaceholderAction, { add: object }>) {
  const { type, width, height } = action.add;
  const widget = document.createElement("div");

  widget.className = "upload-placeholder";
  widget.dataset.editorPlaceholderBlocking = "true";
  widget.style.width = "100%";

  if (
    (type.startsWith("image/") || type.startsWith("video/")) &&
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width! > 0 &&
    height! > 0
  ) {
    widget.style.aspectRatio = `${width} / ${height}`;
    widget.style.maxWidth = `${width}px`;
  } else {
    widget.style.height = "80px";
  }

  const progress = document.createElement("div");
  progress.className = "upload-progress";
  widget.appendChild(progress);

  return Decoration.widget(action.add.pos, widget, { id: action.add.id });
}

function updateDecorations(
  transaction: Transaction,
  decorations: DecorationSet,
) {
  let next = decorations.map(transaction.mapping, transaction.doc);
  const action = transaction.getMeta(
    fileAttachmentPluginKey,
  ) as PlaceholderAction | undefined;

  if (!action) {
    return next;
  }

  if ("add" in action) {
    return next.add(transaction.doc, [createPlaceholder(action)]);
  }

  const actionId = "progress" in action ? action.progress.id : action.remove.id;
  const found = next.find(
    undefined,
    undefined,
    (spec) => spec.id === actionId,
  );

  if ("progress" in action) {
    const widget = (
      found[0] as unknown as { type?: { toDOM?: HTMLElement } } | undefined
    )?.type?.toDOM;
    const progress = widget?.querySelector(".upload-progress");
    if (progress) {
      progress.textContent = `${Math.round(action.progress.progress)}%`;
    }
    return next;
  }

  return next.remove(found);
}

function findPlaceholder(state: EditorState, id: object) {
  const pluginState = fileAttachmentPluginKey.getState(state);
  const found = pluginState?.decorations.find(
    undefined,
    undefined,
    (spec) => spec.id === id,
  );

  return found?.[0]?.from ?? null;
}

function createUploadedNode(schema: Schema, result: EditorElementValue) {
  const nodeType = schema.nodes[result.type];

  if (!nodeType) {
    throw new Error(
      `The uploaded element type is not registered: ${result.type}`,
    );
  }

  return nodeType.create(result.attributes as EditorElementAttributes);
}

function createFileAttachmentState(options: FileAttachmentOptions) {
  const activeUploads = new Set<AbortController>();

  async function attachEachFile(
    view: EditorView,
    file: File,
    signal: AbortSignal,
    pos?: number,
  ) {
    const id = {};

    try {
      const metadata = options.upload?.getMetadata
        ? await options.upload.getMetadata(file, signal)
        : {};
      const transaction = view.state.tr;

      view.focus();
      if (!transaction.selection.empty) {
        transaction.deleteSelection();
      }

      transaction
        .setMeta(editorChangeOriginKey, "upload")
        .setMeta(fileAttachmentPluginKey, {
          add: {
            id,
            pos: pos ?? transaction.selection.from,
            type: file.type,
            ...metadata,
          },
        } satisfies PlaceholderAction);
      view.dispatch(transaction);

      const result = options.upload
        ? await options.upload.upload(file, {
            signal,
            metadata,
            onProgress(progress) {
              view.dispatch(
                view.state.tr.setMeta(fileAttachmentPluginKey, {
                  progress: { id, progress },
                } satisfies PlaceholderAction),
              );
            },
          })
        : await uploadFileAsBase64(file);
      const currentPos = findPlaceholder(view.state, id);

      if (currentPos === null) {
        return;
      }

      const node = createUploadedNode(view.state.schema, result);
      const current = view.state.doc.resolve(currentPos);
      const completion = view.state.tr
        .setMeta(editorChangeOriginKey, "upload")
        .setMeta(fileAttachmentPluginKey, {
          remove: { id },
        } satisfies PlaceholderAction);

      view.dispatch(
        current.parentOffset === 0
          ? completion.replaceWith(currentPos - 1, currentPos, node)
          : completion.replaceWith(currentPos, currentPos, node),
      );
    } catch (error) {
      view.dispatch(
        view.state.tr
          .setMeta(editorChangeOriginKey, "upload")
          .setMeta(fileAttachmentPluginKey, {
            remove: { id },
          } satisfies PlaceholderAction),
      );
      options.upload?.onError?.(error, file);
      options.onError?.(error, file);
    }
  }

  const state: FileAttachmentState = {
    decorations: DecorationSet.empty,

    async attach(view, files, pos) {
      const abortController = new AbortController();
      activeUploads.add(abortController);

      try {
        for (const file of files) {
          if (abortController.signal.aborted) {
            return;
          }
          await attachEachFile(view, file, abortController.signal, pos);
        }
      } finally {
        activeUploads.delete(abortController);
      }
    },

    cancel() {
      for (const upload of activeUploads) {
        upload.abort();
      }
    },
  };

  return state;
}

/**
 * Creates a native ProseMirror plugin for file drops, upload placeholders,
 * progress, cancellation, and uploaded-node insertion.
 */
export function fileAttachmentPlugin(
  options: FileAttachmentOptions = {},
) {
  return new Plugin<FileAttachmentState>({
    key: fileAttachmentPluginKey,
    state: {
      init: () => createFileAttachmentState(options),
      apply(transaction, state) {
        return {
          ...state,
          decorations: updateDecorations(transaction, state.decorations),
        };
      },
    },
    props: {
      decorations(state) {
        return fileAttachmentPluginKey.getState(state)?.decorations ?? null;
      },
      handleDOMEvents: {
        drop(view, event) {
          const files = event.dataTransfer?.files;
          const pluginState = fileAttachmentPluginKey.getState(view.state);

          if (!pluginState || !files || files.length === 0) {
            return false;
          }

          event.preventDefault();
          const pos =
            view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            })?.pos ?? view.state.selection.$from.pos;

          void pluginState.attach(view, Array.from(files), pos);
          return true;
        },
      },
    },
    view(view) {
      return {
        destroy() {
          fileAttachmentPluginKey.getState(view.state)?.cancel();
        },
      };
    },
  });
}

/** Creates a ProseMirror command that starts attaching browser files. */
export function attachFiles(files: readonly File[], pos?: number): Command {
  return (state, _dispatch, view) => {
    const pluginState = fileAttachmentPluginKey.getState(state);

    if (!view || !pluginState || files.length === 0) {
      return false;
    }

    void pluginState.attach(view, files, pos);
    return true;
  };
}

/** Cancels every upload owned by the file-attachment plugin in this editor. */
export const cancelFileAttachments: Command = (state) => {
  const pluginState = fileAttachmentPluginKey.getState(state);

  if (!pluginState) {
    return false;
  }

  pluginState.cancel();
  return true;
};

/** @internal Awaits attachment completion for the legacy controller facade. */
export function attachFilesToView(
  view: EditorView,
  files: readonly File[],
  pos?: number,
) {
  return fileAttachmentPluginKey.getState(view.state)?.attach(view, files, pos);
}
