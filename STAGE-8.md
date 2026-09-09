# Stage 8 — Webpack and Module Federation
## The gist
Stage 8 changes how WatchLog is built and delivered.
The Stage 7 features are still here:
- watchlist routes
- search
- optimistic updates
- English and Spanish
- light and dark themes
- reusable item cards
Webpack 5 now builds the browser application.
WatchLog can run in two ways:
1. by itself on port 3001
2. inside a small host on port 3000
The host downloads WatchLog while the page is running.
That second mode is a micro-frontend.
## The mall and shop model
Think of the host as a mall.
The mall owns the building and its main entrances.
Think of WatchLog as one shop inside the mall.
The shop owns its products, signs, colors, and staff.
The mall does not rebuild the shop.
It only knows where the shop entrance is.
In this project:
- the host is the mall
- the remote is the shop
- `remoteEntry.js` is the shop directory
- `./WatchLogApp` is the shop entrance
- shared React is the building's common electrical system
The same shop also has a standalone entrance on port 3001.
## Five terms
### 1. Host
The application that loads another application.
Here it is the separate project in `host/`.
### 2. Remote
The application that publishes code for a host.
Here it is the main WatchLog project.
### 3. Exposed module
A module the remote allows a host to import.
WatchLog exposes only `./WatchLogApp`.
### 4. `remoteEntry.js`
Webpack's small runtime manifest for the remote.
It tells the host how to find exposed and shared modules.
### 5. Shared singleton
A dependency for which the page must use one runtime copy.
React and the router are strict singletons here.
## Project shape
The remote has:
- the root `package.json`
- the root `webpack.config.js`
- application source in `src/`
- output in `build/`
The host has:
- `host/package.json`
- `host/webpack.config.js`
- shell source in `host/src/`
- output in `host/build/`
- its own `host/node_modules/`
The installs are intentionally independent.
This makes the sharing contract real.
## Request flow
Open `http://localhost:3000/about-host`.
The host server returns its HTML.
The browser downloads the host's main bundle.
Webpack also requests `http://localhost:3001/remoteEntry.js`.
That observed request initializes the remote and share scope.
The larger WatchLog application chunks are still deferred.
Click Watchlist.
`React.lazy` calls `import('watchlog/WatchLogApp')`.
Webpack asks the remote container for `./WatchLogApp`.
The browser downloads the remote's app, CSS, and vendor chunks.
`Suspense` shows a loading message while this happens.
The error boundary shows a useful fallback if it fails.
## The asynchronous boundary
Both projects enter through `index.tsx`.
That file only does:
```ts
import('./bootstrap');
```
Module Federation negotiates shared packages asynchronously.
The dynamic import gives that negotiation time to finish.
React is first imported inside `bootstrap.tsx`.
## Why React must be one copy
React hooks use internal state owned by the React module.
A component created by one React copy cannot safely use another copy's state.
Two copies can produce an invalid hook call.
`react-dom` and `react-dom/client` must agree with React too.
The router passes route state through React context.
Two router copies create two different context objects.
The remote would then fail to see the host's router.
The shared contract therefore includes:
- `react` at exactly `19.0.0`
- `react-dom` at exactly `19.0.0`
- `react-dom/client` at exactly `19.0.0`
- `react-router-dom` at exactly `6.28.0`
Every entry uses `singleton: true` and `strictVersion: true`.
## Ownership boundary
The host owns:
- one React root
- one `BrowserRouter`
- page-wide `StrictMode`
- shell navigation
- the host-only `/about-host` route
- loading and remote-failure UI
The remote owns:
- WatchLog routes
- TanStack Query
- Zustand stores
- theme setup
- i18next setup
- English and lazy Spanish resources
- Tailwind and global app styles
- the application error boundary
The exposed adapter creates no root and no router.
Standalone `bootstrap.tsx` supplies those missing page-level pieces.
It renders the same exposed `WatchLogApp` component.
## Webpack responsibilities
The root config handles:
- development and production modes
- TS, TSX, JS, and JSX through Babel
- CSS through PostCSS and Tailwind
- extracted production CSS
- image and font assets
- the `@` source alias
- environment substitution
- development and production source maps
- tree shaking
- ordinary async vendor splitting
- optional bundle reports
Babel removes TypeScript syntax.
`npm run typecheck` performs the separate type check.
The remote output uses `publicPath: 'auto'`.
Remote chunks therefore load from the remote origin.
Both HTML templates use `<base href="/">`.
That keeps direct deep links from requesting nested asset URLs.
The development remote allows cross-origin loading.
## Environment values
`REMOTE_WATCHLOG_URL` chooses the remote origin for the host.
Its safe local default is `http://localhost:3001`.
The host config reads it once and passes it to Webpack.
`env.yaml` declares every environment value used by this stage.
Gateway values have safe local defaults too.
No secret is committed.
## Production gateway
`gateway/server.js` serves the built remote on port 4001.
Its CORS rule allows only configured host origins.
`remoteEntry.js` uses `no-cache, must-revalidate`.
Its stable filename must be checked after each deployment.
Content-hashed assets use a one-year immutable cache.
Unknown paths return the standalone app for deep links.
## Commands
Install both projects:
```bash
npm install
npm run install:host
```
Run both development servers:
```bash
npm run dev:mfe
```
Run only the standalone remote:
```bash
npm run dev:remote
```
Run verification:
```bash
npm test
npm run typecheck
npm run typecheck:locales
npm run build:lib
```
Build both applications:
```bash
npm run build:mfe
```
Generate fresh bundle evidence:
```bash
npm run analyze
```
Serve the production remote:
```bash
npm run build:app
npm run gateway
```
## What the browser checks proved
The standalone remote rendered on port 3001.
The host rendered WatchLog on port 3000.
`/about-host` loaded `remoteEntry.js`, but not remote app chunks.
Opening Watchlist loaded the exposed remote chunks.
Spanish loaded and updated the document language to `es`.
The theme toggle changed the active theme.
A direct `/items/movie-1` host deep link rendered correctly.
Stopping port 3001 produced the host's remote error fallback.
## Stage 9 transition
Stage 8 proves runtime composition with a small contract.
Stage 9 can add automated component and network tests.
It can introduce Jest or Vitest browser helpers and MSW then.
Those tools are intentionally not added in this stage.
Keep the federation boundary small as testing grows.
