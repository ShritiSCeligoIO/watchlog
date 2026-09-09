# WatchLog — Stage 9

WatchLog tracks movies and books. Stage 9 keeps the Webpack and Module
Federation application and adds a focused Jest, Testing Library, and MSW
safety net.

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
npm run test:coverage
npm run analyze
```

`npm run analyze` writes regenerable reports to `reports/`. For a production
remote gateway with explicit CORS and cache rules:

```bash
npm run build:app
npm run gateway
```

Read [STAGE-9.md](./STAGE-9.md) for the beginner testing guide.
