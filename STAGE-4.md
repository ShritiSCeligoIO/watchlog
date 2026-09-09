# Stage 4: Styling and accessible controls

## The gist
Stage 4 changes how WatchLog looks and how its controls behave.
It does not replace the Stage 3 architecture.
The routes, Context providers, hooks, and API clients keep their jobs.
The additions are:
- Tailwind CSS for styling
- reusable light and dark color tokens
- a persisted theme
- accessible Radix UI controls
- responsive cards and forms
- confirmation before removal

This is intentionally an appearance-only stage.

## Tailwind mental model
Tailwind gives you small CSS classes with one clear job:

```tsx
<h2 className="text-xl font-semibold">Your watchlist</h2>
```

`text-xl` sets the size and `font-semibold` sets the weight.
Classes can react to screen size:

```tsx
<div className="grid gap-4 sm:grid-cols-2">
```

The layout starts as one column.
At the `sm` breakpoint, it becomes two columns.
Classes can also react to interaction:

```tsx
className="hover:bg-accent focus-visible:ring-2"
```

The first class styles hover.
The second makes keyboard focus visible.

The Tailwind pipeline has three pieces:
1. `tailwind.config.js` tells Tailwind where components live.
2. `postcss.config.js` runs Tailwind and Autoprefixer.
3. `src/styles/globals.css` loads Tailwind's generated layers.

Vite follows that pipeline when it builds the app.

## Design tokens
Names such as `primary` and `background` are design tokens.
Components use the name instead of a fixed color:

```tsx
className="bg-card text-card-foreground"
```

Tailwind maps each name to a CSS variable.
The light theme defines variables under `:root`.
The dark theme replaces them under `.dark`.
Components therefore do not need separate theme class lists.

The token groups are:
- page: `background` and `foreground`
- surfaces: `card` and `popover`
- actions: `primary`, `secondary`, and `destructive`
- quiet content: `muted`
- interaction: `accent` and `ring`
- controls: `border` and `input`
- media: `type-movie` and `type-book`
- progress: `status-want`, `status-watching`, and `status-done`

The values are familiar hexadecimal colors.
Changing one token updates every component that uses it.

## The components/ui folder
`src/components/ui/` is clearly labeled library plumbing.
Its files wrap HTML or Radix primitives and attach shared classes.
They are not feature components.

Feature components include:
- `SearchPanel`
- `WatchlistItemCard`
- `RemoveItemDialog`
- `ThemeToggle`

UI plumbing includes:
- `Button`
- `Input`
- `Badge`
- `Label`
- `Tabs`
- `Select`
- `Dialog`
- `RadioGroup`

This boundary keeps feature code readable.
The wrappers are deliberately small.
Button and badge variants use plain class maps.
There is no variant framework to learn in this stage.
Small Unicode symbols replace a separate icon package.
Accessible names remain text, such as “Close” and “Switch to dark mode”.

## Why Radix UI is here
Some controls are harder than they look.
A custom dialog must manage:
- focus entering the dialog
- focus returning to the trigger
- Escape to close
- a screen-reader title and description
- interaction outside the dialog

A custom select must manage:
- arrow keys
- Enter and Space
- highlighted options
- selected state
- focus

Tabs and radio groups have similar keyboard rules.
Radix supplies those behaviors without choosing the visual design.
Tailwind supplies the visual design.

WatchLog uses Radix for:
- search type tabs
- type and status filter selects
- the removal dialog
- edit-page status and rating radio groups

Native WatchLog state still controls the selected values.
Radix changes control behavior, not data ownership.

## Dark-mode flow
Theme code lives in `src/lib/theme.ts`.
The startup sequence is:
1. Read `watchlog_theme` from local storage.
2. Accept only `light` or `dark`.
3. Otherwise read the operating-system preference.
4. Add or remove `dark` on the document root.
5. Render React.

Applying the class before rendering avoids a wrong-theme flash.
The theme button starts from the same resolved value.
When clicked, it:
1. calculates the opposite theme
2. updates component state
3. updates the document class
4. saves the explicit choice

The saved choice wins on the next visit.
Tests cover preference, application, and persistence.

## Removal-dialog flow
Stage 3 removed an item immediately.
Stage 4 adds an intentional confirmation step.
Each card owns only whether its dialog is open.
The detail page does the same.

The flow is:
1. Select Remove.
2. Open the Radix dialog.
3. Move keyboard focus into the dialog.
4. Cancel, press Escape, or confirm.
5. Call the existing `removeItem` only after confirmation.
6. Close the dialog and return focus safely.

No data architecture changed.
The dialog is a UI guard around the existing action.

## Responsive layout
Pages use a narrow centered container.
Cards use one column on small screens.
Cards use two columns when space allows.
Filter fields follow the same pattern.
Forms keep comfortable touch targets.
Actions wrap instead of overflowing.
Spacing increases slightly on wider screens.

## Stage 1–3 behavior retained
- discriminated movie and book types
- reusable utility functions
- Open Library and TMDB search
- request cancellation and stale-result protection
- shared watchlist Context
- mock authentication Context
- nested React Router routes
- protected edit routes
- URL query-string filters
- filter state passed through detail, login, edit, and back navigation
- validation of external navigation state
- separate app and library builds

These are proof that this stage is cumulative.

## Key files
- `tailwind.config.js`: maps token names to CSS variables
- `postcss.config.js`: enables Tailwind during builds
- `src/styles/globals.css`: light and dark token values
- `src/lib/theme.ts`: resolves, applies, and saves the theme
- `src/index.tsx`: applies the theme before rendering
- `src/components/ui/`: reusable control plumbing
- `src/components/ThemeToggle.tsx`: theme interaction
- `src/components/RemoveItemDialog.tsx`: confirmation feature
- `src/components/SearchPanel.tsx`: tabs with existing search state
- `src/pages/WatchlistPage.tsx`: selects with URL state
- `src/pages/ItemEditPage.tsx`: keyboard-friendly radio groups

## Commands
Install exact pinned dependencies:

```bash
npm install
```

Run tests and type-check the app:

```bash
npm test
npx tsc -p tsconfig.app.json
```

Build the reusable library and Vite application:

```bash
npm run build:lib
npm run build:app
```

Start local development:

```bash
npm run dev
```

## Transition to Stage 5
Stage 4 is still intentionally local.
Refreshing resets in-memory watchlist edits.
Sign-in is still a mock.
Stage 5 can introduce a real persistence boundary.
That may mean a backend, database, or authenticated API.
Keep the Stage 4 UI independent of that choice.
The next lesson should replace Context actions behind a clear data layer,
not redesign the interface again.
