import { EditorView } from "prosemirror-view";
import {
  findPlaceholder,
  uploadPlaceholderPlugin,
} from "./plugins/upload_placeholder";
import { createSchema } from "./schema";
import { base64FileUploader } from "./base64_file_uploader";

export type GenerateMetadata = (file: File) =>
  | Promise<{
      width?: number;
      height?: number;
      poster?: string;
    }>
  | {
      width?: number;
      height?: number;
      poster?: string;
    };

export type UploadFile = (
  file: File
) => Promise<{ src: string; alt?: string }> | { src: string; alt?: string };

export type AttachFileOptions = {
  schema: ReturnType<typeof createSchema>;
  generateMetadata?: GenerateMetadata;
  uploadFile?: UploadFile;
};

export type AttachFile = (view: EditorView, files: File[]) => Promise<void>;

export function createAttachFile({
  schema,
  generateMetadata,
  uploadFile = base64FileUploader,
}: AttachFileOptions): AttachFile {
  const attachEachFile = async (view: EditorView, file: File, pos?: number) => {
    const metadata = generateMetadata ? await generateMetadata(file) : {};

    const id = {};

    view.focus();

    const tr = view.state.tr;

    if (!tr.selection.empty) {
      tr.deleteSelection();
    }

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
      const { src, alt } = await uploadFile(file);

      const tr = view.state.tr.setMeta(uploadPlaceholderPlugin, {
        remove: { id },
      });

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

      view.dispatch(tr.replaceWith($pos, $pos, node));
    } catch (e) {
      view.dispatch(tr.setMeta(uploadPlaceholderPlugin, { remove: { id } }));
    }
  };

  return async (view: EditorView, files: File[], pos?: number) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      await attachEachFile(view, file, pos);
    }
  };
}
