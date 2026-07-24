# Contributing

## Prerequisites

- Node.js 20 or later
- npm 10 or later

## Local Development

```bash
npm install
npm run dev
npm --prefix example run dev
```

The library watcher rebuilds `dist/`; the example imports the local package and
starts Vite with a forced dependency optimization refresh.

## Before Opening a Pull Request

```bash
npm run verify
npm --prefix example run build
npm pack --dry-run
```

Add or update tests in `tests/` for behavior changes. Keep public types,
README examples, and the changelog aligned with changes to exported APIs.

## Release Checklist

1. Update `package.json` and `CHANGELOG.md` with the release version.
2. Run the verification commands above.
3. Confirm `npm pack --dry-run` contains only intended runtime files.
4. Merge to `main`; the publish workflow publishes only a version that is not
   already available on npm.
