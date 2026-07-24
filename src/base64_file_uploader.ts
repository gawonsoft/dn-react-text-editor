import type { EditorElementValue } from "./elements";

/** Converts a browser file into an embeddable data URL for the default uploader. */
export const base64FileUploader = async (
  file: File,
): Promise<EditorElementValue> => {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  if (file.type.startsWith("image/")) {
    return {
      type: "image",
      attributes: {
        src: base64,
        alt: file.name,
        title: null,
        width: null,
        height: null,
        srcSet: null,
        sizes: null,
      },
    };
  }

  if (file.type.startsWith("video/")) {
    return {
      type: "video",
      attributes: {
        src: base64,
        title: null,
        width: null,
        height: null,
        poster: null,
      },
    };
  }

  throw new Error("A custom upload adapter is required for this file type.");
};
