import { EditorView } from "prosemirror-view";
import {
  findPlaceholder,
  uploadPlaceholderPlugin,
} from "./plugins/upload_placeholder";
import { createSchema } from "./schema";
import { base64FileUploader } from "./base64_file_uploader";
import { editorChangeOriginKey } from "./events";
import type { UploadAdapter } from "./upload";

export type AttachFileOptions = {
  schema: ReturnType<typeof createSchema>;
  upload?: UploadAdapter;
  onError?: (error: unknown, file: File) => void;
};

export type AttachFile = (
  view: EditorView,
  files: File[],
  pos?: number,
  signal?: AbortSignal,
) => Promise<void>;

/**
 * Creates an upload handler that replaces placeholders with image or video nodes.
 */
export function createAttachFile({
  schema,
  upload,
  onError,
}: AttachFileOptions): AttachFile {
  /** Uploads one file while preserving its insertion position through edits. */
  const attachEachFile = async (
    view: EditorView,
    file: File,
    pos?: number,
    signal = new AbortController().signal,
  ) => {
    const metadata = upload?.getMetadata
      ? await upload.getMetadata(file, signal)
      : {};

    const id = {};

    view.focus();

    const tr = view.state.tr;

    if (!tr.selection.empty) {
      tr.deleteSelection();
    }

    tr.setMeta(editorChangeOriginKey, "upload");
    tr.setMeta(uploadPlaceholderPlugin, {
      add: {
        id,
        pos: pos ?? tr.selection.from,
        type: file.type,
        ...metadata,
      },
    });

    view.dispatch(tr);

    const $pos = findPlaceholder(view.state, id);

    if (!$pos) {
      return;
    }

    try {
      const result = upload
        ? await upload.upload(file, {
            signal,
            onProgress(progress) {
              view.dispatch(
                view.state.tr.setMeta(uploadPlaceholderPlugin, {
                  progress: { id, progress },
                }),
              );
            },
          })
        : await base64FileUploader(file);

      const { src, alt } = result;

      const tr = view.state.tr
        .setMeta(editorChangeOriginKey, "upload")
        .setMeta(uploadPlaceholderPlugin, { remove: { id } });

      /** Converts a completed upload into the matching schema media node. */
      const createNode = () => {
        if (file.type.startsWith("image/")) {
          return schema.nodes.image.create({
            src,
            alt,
            width: metadata.width,
            height: metadata.height,
          });
        }

        if (file.type.startsWith("video/")) {
          return schema.nodes.video.create({
            src,
            width: metadata.width,
            height: metadata.height,
            poster: metadata.poster,
          });
        }
      };

      const node = createNode();

      if (!node) {
        return;
      }

      const current = view.state.doc.resolve($pos);

      if (current.parentOffset === 0) {
        view.dispatch(tr.replaceWith($pos - 1, $pos, node));
      } else {
        view.dispatch(tr.replaceWith($pos, $pos, node));
      }
    } catch (error) {
      view.dispatch(
        tr
          .setMeta(editorChangeOriginKey, "upload")
          .setMeta(uploadPlaceholderPlugin, { remove: { id } }),
      );
      upload?.onError?.(error, file);
      onError?.(error, file);
    }
  };

  /** Processes files sequentially so each placeholder remains addressable. */
  return async (
    view: EditorView,
    files: File[],
    pos?: number,
    signal?: AbortSignal,
  ) => {
    for (let i = 0; i < files.length; i++) {
      if (signal?.aborted) {
        return;
      }

      const file = files[i];

      await attachEachFile(view, file, pos, signal);
    }
  };
}
