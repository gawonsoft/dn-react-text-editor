import type { Schema } from "prosemirror-model";
import type { EditorView } from "prosemirror-view";
import { createAttachFile } from "../attach_file";
import type { UploadAdapter } from "../upload";

/** Starts an upload and tracks its cancellation handle until completion. */
export async function attachFiles({
  schema,
  view,
  files,
  pos,
  uploads,
  upload,
  onError,
}: {
  schema: Schema;
  view: EditorView;
  files: File[];
  pos?: number;
  uploads: Set<AbortController>;
  upload?: UploadAdapter;
  onError?: (error: unknown, file: File) => void;
}) {
  const abortController = new AbortController();
  uploads.add(abortController);

  try {
    await createAttachFile({ schema, upload, onError })(
      view,
      files,
      pos,
      abortController.signal,
    );
  } finally {
    uploads.delete(abortController);
  }
}

/** Aborts all uploads tracked by an editor controller. */
export function cancelTrackedUploads(uploads: Set<AbortController>) {
  for (const upload of uploads) {
    upload.abort();
  }
}