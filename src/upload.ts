import type { EditorElementValue } from "./elements";

/** Metadata used to size a media placeholder before an upload completes. */
export type MediaMetadata = {
  width?: number;
  height?: number;
  poster?: string;
};

/** Context supplied to upload adapters for cancellation and progress reporting. */
export type UploadContext = {
  signal: AbortSignal;
  onProgress: (progress: number) => void;
  metadata: MediaMetadata;
};

/** Integrates a storage service with a registered editor element upload flow. */
export type UploadAdapter = {
  getMetadata?: (file: File, signal: AbortSignal) => Promise<MediaMetadata>;
  upload: (file: File, context: UploadContext) => Promise<EditorElementValue>;
  onError?: (error: unknown, file: File) => void;
};
