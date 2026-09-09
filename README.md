# WatchLog — Stage 8

WatchLog tracks movies and books. Stage 8 keeps the Stage 7 application and
replaces its Vite app build with Webpack 5 and Module Federation.

## Run it

Use Node.js 22.11.0 and npm.

```bash
npm install
npm run install:host
npm run dev:mfe
```

- Host shell: <http://localhost:3000>
- Standalone WatchLog remote: <http://localhost:3001>

The host is an independent npm project. It downloads `remoteEntry.js` and
`./WatchLogApp` at runtime; it does not import the remote's source.

## Configuration

Copy `.env.example` to `.env` for remote settings. Copy
`host/.env.example` to `host/.env` to override `REMOTE_WATCHLOG_URL`.
Committed defaults make local builds work without either file.

## Checks and builds

```bash
npm test
npm run typecheck
npm run typecheck:locales
npm run build:lib
npm run build:mfe
npm run analyze
```

`npm run analyze` writes regenerable reports to `reports/`. For a production
remote gateway with explicit CORS and cache rules:

```bash
npm run build:app
npm run gateway
```

Read [STAGE-8.md](./STAGE-8.md) for the beginner guide and
[docs/bundle-analysis.md](./docs/bundle-analysis.md) for measured bundle
evidence.
