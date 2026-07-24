import { Plugin } from "prosemirror-state";
import type { AttachFile } from "../attach_file";

/** Creates a drop handler that inserts supported media at the pointer location. */
export function dragAndDropPlugin({ attachFile }: { attachFile?: AttachFile }) {
  return new Plugin({
    props: {
      handleDOMEvents: {
        drop(view, event) {
          if (!attachFile) {
            return;
          }

          const files = event.dataTransfer?.files;

          if (!files || files.length === 0) {
            return;
          }

          event.preventDefault();

          const pos =
            view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            })?.pos ?? view.state.selection.$from.pos;

          if (pos === null) {
            return;
          }

          const medias = Array.from(files).filter(
            (file) =>
              file.type.startsWith("image/") || file.type.startsWith("video/"),
          );

          attachFile(view, medias, pos);

          return true;
        },
      },
    },
  });
}
