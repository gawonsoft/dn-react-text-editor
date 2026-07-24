# Changelog

All notable changes to this project are documented in this file.

## 0.4.0 - 2026-07-24

### Added

- Stable controller lifecycle, read-only change events, typed commands, and
  cancellable upload adapters.
- Separate `preview` and `sanitizer` package subpaths.

### Changed

- Split `onChangeDelay` from `historyGroupDelay`.
- Removed the RxJS runtime dependency.

### Breaking Changes

- Removed raw schema/state/editor configuration and the
  `gw-react-text-editor/prosemirror` export.
- Moved preview helpers to `gw-react-text-editor/preview` and sanitizer helpers
  to `gw-react-text-editor/sanitizer`.

## 0.3.0 - 2026-07-24

### Added

- Controlled `value` support and a safe HTML preview component.
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
