import { EditorState, Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const uploadPlaceholderPlugin = new Plugin({
  state: {
    init() {
      return DecorationSet.empty;
    },
    apply(tr, set) {
      set = set.map(tr.mapping, tr.doc);

      const action = tr.getMeta(this as never);

      if (action && action.add) {
        const { type, width, height } = action.add;

        const widget = document.createElement("div");

        widget.className = "upload-placeholder";
        widget.style.width = `100%`;

        if (type.startsWith("image/") || type.startsWith("video/")) {
          widget.style.aspectRatio = `${width} / ${height}`;
          widget.style.maxWidth = `${width}px`;
        } else {
          widget.style.height = "80px";
        }

        const progress = document.createElement("div");

        progress.className = "upload-progress";

        widget.appendChild(progress);

        const deco = Decoration.widget(action.add.pos, widget, {
          id: action.add.id,
        });

        set = set.add(tr.doc, [deco]);
      } else if (action && action.progress) {
        const found = set.find(
          undefined,
          undefined,
          (spec) => spec.id === action.progress.id
        );

        if (found.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const widget = (found[0] as any).type.toDOM as HTMLElement;

          const progress = widget.querySelector(".upload-progress");

          if (progress) {
            progress.innerHTML = `${Math.round(action.progress.progress)}%`;
          }
        }
      } else if (action && action.remove) {
        set = set.remove(
          set.find(undefined, undefined, (spec) => spec.id === action.remove.id)
        );
      }

      return set;
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});

export const findPlaceholder = (state: EditorState, id: unknown) => {
  const decos = uploadPlaceholderPlugin.getState(state);

  if (!decos) {
    return null;
  }

  const found = decos.find(undefined, undefined, (spec) => spec.id === id);

  return found.length ? found[0].from : null;
};
