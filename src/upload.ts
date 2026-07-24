/** Metadata used to size a media placeholder before an upload completes. */
export type MediaMetadata = {
  width?: number;
  height?: number;
  poster?: string;
};

/** A successfully uploaded media resource. */
export type UploadedMedia = {
  src: string;
  alt?: string;
  title?: string;
};

/** Context supplied to upload adapters for cancellation and progress reporting. */
export type UploadContext = {
  signal: AbortSignal;
  onProgress: (progress: number) => void;
};

/** Integrates a storage service with the editor's image and video upload flow. */
export type UploadAdapter = {
  getMetadata?: (file: File, signal: AbortSignal) => Promise<MediaMetadata>;
  upload: (file: File, context: UploadContext) => Promise<UploadedMedia>;
  onError?: (error: unknown, file: File) => void;
};
