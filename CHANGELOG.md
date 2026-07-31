# Changelog

All notable changes to this project are documented in this file.

## 0.1.4 - 2026-07-31

### Fixed

- Added automatic baseline styles for text and upload placeholders so
  consumers no longer need to declare required placeholder CSS.
- Added scoped ProseMirror editing, selection, list, and separator styles that
  are required for consistent editor behavior.

### Added

- Added placeholder color and upload background CSS variables for application
  theme overrides.
- Added a CSS variable for the selected-node outline color.
- Added a `gw-rich-text-editor/unstyled` entrypoint for consumers that want to
  own every editor style, plus an explicit `gw-rich-text-editor/styles.css`
  export for manual stylesheet loading.

## 0.1.3 - 2026-07-31

### Fixed

- Prevented a deferred editor cleanup from disposing the active ProseMirror
  view when React replays layout effects during client-side navigation.

## 0.1.2 - 2026-07-31

### Fixed

- Removed the editor runtime's nested `flushSync` calls so controlled values
  and external controller updates are safe during React effect lifecycles.
- Preserved ProseMirror-managed content DOM while updating container renderer
  attributes and surrounding static structure.
- Excluded React 19 image preload hints from serialized editor content.

### Changed

- Container and mark renderers now create their synchronous ProseMirror DOM
  shells with React static markup instead of temporary nested React roots.

## 0.1.1 - 2026-07-31

### Fixed

- Bound and disposed React-backed ProseMirror views outside React lifecycle
  methods to avoid nested `flushSync` warnings in React 19.
- Marked the interactive editor and read-only React view entry points as client
  module boundaries for React Server Component consumers.

## 0.1.0 - 2026-07-24

### Added

- Stable controller lifecycle, read-only change events, typed commands, and
  cancellable upload adapters.
- Separate `view` and `sanitizer` package subpaths.
- High-level registered nodes and marks with shared editor/view React renderers.

### Changed

- Split `onChangeDelay` from `historyGroupDelay`.
- Removed the RxJS runtime dependency.
- Removed the React server renderer from browser bundles and reduced the
  default Highlight.js language set to JavaScript, TypeScript, JSON, HTML/XML,
  and CSS. Additional languages can be registered with
  `registerHighlightLanguage`.

### Breaking Changes

- Replaced separate element, container, and mark `serialize` callbacks with one
  required `render` callback used by the editor, saved HTML, and read-only view.
- Replaced the `createTextEditorView` factory and public
  `dangerouslySetInnerHTML` prop with `<TextEditorView value={value} />`.
- Removed raw schema/state/editor configuration and the
  `gw-rich-text-editor/prosemirror` export.
- Moved read-only views to `gw-rich-text-editor/view` and sanitizer helpers
  to `gw-rich-text-editor/sanitizer`.
- `UploadAdapter.upload()` now returns a value created by a registered editor
  element instead of a media URL object.
- Replaced the element-only `elements` prop with `nodes` and `marks` registries.

## 0.3.0 - 2026-07-24

### Added

- Controlled `value` support and a safe read-only HTML component.
- HTML sanitization, upload-position handling, and schema regression tests.
- Package verification scripts and provenance-enabled npm publishing.

### Changed

- Moved tests from `src/` to `tests/`.
- Reduced published files to the runtime bundle, license, README, and changelog.
- Split the example application's ProseMirror and Highlight.js bundles.

### Fixed

- Preserved heading alignment, media dimensions, and iframe referrer policy.
- Inserted dropped media at its drop position.
- Made the build command work on Windows shells.
