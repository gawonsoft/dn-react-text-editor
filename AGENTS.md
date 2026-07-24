# Project Guidelines

## Scope

This package exposes a React 19 rich-text editor and a ProseMirror subpath
export. Keep public API changes backward compatible unless the task explicitly
calls for a breaking release.

## Layout

- `src/`: library implementation and public exports from `src/index.ts`.
- `tests/`: Vitest regression tests; use JSDOM for DOM-dependent behavior.
- `example/`: Vite consumer application for manual verification.
- `.github/workflows/publish.yaml`: npm publishing workflow.

## Code Conventions

- Use TypeScript with strict types and the existing formatting style.
- Keep HTML handling sanitized at every rendering boundary; do not introduce
  unsanitized `dangerouslySetInnerHTML` usage.
- Preserve the ProseMirror schema's HTML round-trip behavior when modifying
  nodes, marks, or attributes.
- Add concise documentation comments to new exported functions and non-obvious
  control flow.

## Validation

Run `npm run verify` for library changes. Run `npm --prefix example run build`
when changing the example or bundled dependencies. Before release-related
changes, run `npm pack --dry-run` and inspect its output.

## Documentation

Update `README.md`, `CHANGELOG.md`, and public TypeScript types together when
changing an exported API. Keep release details in `CHANGELOG.md` rather than
duplicating them here.
