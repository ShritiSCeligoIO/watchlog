# Stage 1 — Modern JavaScript & TypeScript, explained simply

**Branch:** `stage-1` · **After this:** [`stage-2`] a real screen you can click

---

## The one-sentence version

Before building the car, build the engine — and prove it runs on a test bench.

---

## What this stage is, and what it deliberately is not

At the end of Stage 1 there is **nothing to look at**. No web page, no buttons,
no colours. If you run it, you get output in a terminal.

That sounds like a strange place to start, but it is deliberate. Every app has
two separate concerns tangled together:

1. **The rules.** What is a watchlist item? What counts as "finished"? How do
   you work out an average rating? How do you ask the internet for books?
2. **The appearance.** Where does the button go? What colour is it?

Stage 1 is all rules and no appearance. Getting the rules right on their own,
with tests, means that when the screen arrives it has something solid to stand
on. And you get proof it worked: **79 passing tests** before a single pixel
exists.

The payoff shows up immediately. When Stage 2 built the entire user interface,
**not one line of this Stage 1 code had to change.**

---

## What actually exists at the end of this stage

A **library** — a box of tools other code can pick up and use:

- A precise definition of what a watchlist item is
- Four functions that do useful things to a list of them
- Two functions that fetch real data from the internet (Open Library for books,
  TMDB for movies)
- One place where configuration is read
- A test for every one of the above

You can prove it works from a terminal:

```bash
npm run build
node --input-type=module -e "
  import { searchBooks } from './dist/api/openLibraryClient.js';
  console.log(await searchBooks('dune'));
"
```

Real titles come back from a real API.

---

## The big ideas, one at a time

### 1. What TypeScript actually is

JavaScript is the language browsers speak. It is famously relaxed about types:

```javascript
let rating = 5;
rating = "five";       // JavaScript shrugs
rating = null;         // fine too
```

Relaxed sounds pleasant until you have written a few thousand lines. Then
`rating` arrives somewhere as the string `"five"`, your arithmetic produces
`NaN`, and the screen shows *"Average rating: NaN"* to a customer.

TypeScript is JavaScript plus a **checker**. You declare what a thing is meant
to be, and it complains before you run anything:

```typescript
let rating: number = 5;
rating = "five";       // Error: Type 'string' is not assignable to type 'number'
```

The single most important thing to understand: **TypeScript vanishes.** The
browser has never heard of it. A build step strips every type annotation out and
leaves plain JavaScript behind.

Which means types cannot protect you at runtime. If an API sends you rubbish,
TypeScript is not there to notice. It is a checker that runs *while you write*,
not a guard that stands watch while your app runs.

**The mental model:** TypeScript is a spellchecker. It catches mistakes as you
type. It does not follow the letter to its destination.

### 2. Types, interfaces, and describing the shape of data

Everything in this app revolves around one idea: a watchlist item. So we write
down exactly what one is.

Start with the simple pieces:

```typescript
export type WatchStatus = 'want' | 'watching' | 'done';
export type StarRating = 1 | 2 | 3 | 4 | 5;
```

That first line is a **union type** — it says a status is one of exactly three
strings. Not any string. `'watchng'` is a typo, and TypeScript will refuse it.
That whole category of bug is now impossible.

`StarRating` does the same with numbers. A rating is 1, 2, 3, 4, or 5. Not 0,
not 6, not 4.5.

Then an **interface** describes an object's shape:

```typescript
export interface BaseWatchlistItem {
  id: string;
  title: string;
  genre: string;
  status: WatchStatus;
  dateAdded: string;
  rating?: StarRating;
}
```

Note the `?` on `rating`. That means **optional** — an item might have a rating,
or might not. And because TypeScript knows it might be missing, it forces you to
check before using it. You cannot forget.

### 3. Discriminated unions — the trick that makes this whole app tidy

Here is a genuine design problem. A movie has a director and a release year. A
book has an author and a publication year. They share a title, a genre, and a
status.

The lazy answer is one big object with every field optional:

```typescript
{ title, genre, status, director?, releaseYear?, author?, publishYear? }
```

This is a trap. Nothing stops you creating an item with both a director and an
author. Nothing tells you which fields to expect. Every piece of code that
touches an item has to defensively check everything.

The good answer is a **discriminated union**:

```typescript
export interface MovieWatchlistItem extends BaseWatchlistItem {
  type: 'movie';
  director?: string;
  releaseYear?: number;
}

export interface BookWatchlistItem extends BaseWatchlistItem {
  type: 'book';
  author?: string;
  publishYear?: number;
}

export type WatchlistItem = MovieWatchlistItem | BookWatchlistItem;
```

The `type` field is the **discriminant** — the label that says which kind this
is. And TypeScript is clever about it:

```typescript
if (item.type === 'movie') {
  console.log(item.director);   // fine — it knows this is a movie
  console.log(item.author);     // Error — movies do not have authors
}
```

That is called **narrowing**. Inside the `if`, TypeScript has narrowed "movie or
book" down to "definitely movie".

**The mental model:** a form with a tick-box at the top that says *"I am a
movie"* or *"I am a book"*, and the rest of the form changes depending on which
you ticked. You physically cannot fill in the wrong half.

### 4. Type guards — narrowing in your own functions

The `if (item.type === 'movie')` check works inline, but writing it everywhere is
tedious. So we wrap it:

```typescript
export function isMovieItem(item: WatchlistItem): item is MovieWatchlistItem {
  return item.type === 'movie';
}
```

Look carefully at the return type. Not `boolean`, but **`item is
MovieWatchlistItem`**. That is a **type predicate**, and it is a promise to the
compiler: *"if I return true, you may treat this as a movie."*

Now `if (isMovieItem(item))` narrows the type just as the inline check did.

There are three of these:

| Guard | Answers |
|-------|---------|
| `isMovieItem(item)` | Is this a movie? |
| `isBookItem(item)` | Is this a book? |
| `hasRating(item)` | Does this actually have a rating? |

`hasRating` is the interesting one:

```typescript
export function hasRating(
  item: WatchlistItem
): item is WatchlistItem & { rating: StarRating } {
  return item.rating !== undefined;
}
```

The `&` means "and" — the result is a watchlist item **and** something with a
definite rating. So after the guard, `item.rating` is no longer possibly
missing, and you can do arithmetic with it without TypeScript objecting.

Stage 2 uses all three of these in the detail panel to decide which fields to
show.

### 5. Utility types — describing a type in terms of another

Sometimes you want a variation on a type you already have. TypeScript ships
helpers for this:

```typescript
export type WatchlistItemUpdate = Partial<Omit<WatchlistItem, 'id' | 'type'>>;
```

Read that from the inside out:

- `Omit<WatchlistItem, 'id' | 'type'>` — a watchlist item **without** its `id`
  and `type` fields. Those two identify the thing; you should never be able to
  edit them.
- `Partial<...>` — every remaining field becomes optional.

The result describes exactly what an edit looks like: *"change any of these
fields, none of them required, and you may not change what it fundamentally
is."*

And:

```typescript
export type WatchlistItemSummary = Pick<
  WatchlistItem, 'id' | 'title' | 'status' | 'type' | 'genre'
>;
```

`Pick` takes only the named fields — a lightweight version for list rows.

**Why bother?** Because these stay correct on their own. Add a field to
`WatchlistItem` and both of these update automatically. Written out by hand, all
three would drift apart within a month.

### 6. Pure functions, and why they are easy to test

Look at the four list utilities. They all follow one shape:

```typescript
export function statsSummary(items: WatchlistItem[]): WatchlistStats {
  // ... work out the answer ...
  return { totalCount, completionRate, averageRating };
}
```

Data in, answer out. No saving to a database, no printing to the screen, no
reaching for the current time. This is a **pure function**, and it has two
properties that matter enormously:

1. **Same input, same output. Always.** Call it a thousand times, get the same
   answer a thousand times.
2. **It changes nothing else.** The list you handed it is untouched afterwards.

Which makes testing almost trivial. There is nothing to set up and nothing to
clean up:

```typescript
expect(statsSummary([])).toEqual({
  totalCount: 0,
  completionRate: 0,
  averageRating: null,
});
```

Compare that to testing something that writes to a database, where you need a
database, in a known state, and reset between tests.

The four utilities:

| Function | What it does |
|----------|-------------|
| `filterByStatus` | Keep only items with a given status |
| `sortByRating` | Order by star rating |
| `groupByGenre` | Bundle items into genre buckets |
| `statsSummary` | Total count, completion rate, average rating |

### 7. Edge cases are the actual work

`statsSummary` looks like three lines of arithmetic. It is not, and the reason is
worth understanding.

**What is the average rating of an empty list?** Divide by zero and you get
`NaN`, which displays as *"Average rating: NaN"*. So an empty list returns early
with `averageRating: null` — `null` meaning *"there is genuinely no answer
here"*, which is honest, unlike `0`, which would be a lie.

**What about items finished but never rated?** They count towards the completion
rate but must be left out of the average, or they drag it towards zero. Hence:

```typescript
const ratedDoneItems = items.filter(
  (item): item is WatchlistItem & { rating: NonNullable<...> } =>
    item.status === 'done' && hasRating(item)
);
```

The tests cover exactly these situations — empty lists, unrated items, a single
item. That is where bugs actually live. The happy path almost always works.

### 8. Immutability — never modify what you were given

Every utility here returns a **new** array. None of them alters the one passed
in.

```typescript
items.filter(...)     // returns a new array
items.map(...)        // returns a new array
[...items, newItem]   // returns a new array
```

rather than:

```typescript
items.push(newItem)   // changes the original
items.sort()          // changes the original, in place
items.splice(0, 1)    // changes the original
```

Why be so strict? Because a function that quietly rearranges your list is a
nightmare to debug. You call `sortByRating(myList)` to display something sorted,
and now `myList` is permanently reordered everywhere else in the program. The
bug appears in a completely different file.

This becomes critical in Stage 2, where React relies on comparing old and new
values to decide what to redraw. Modify in place and React sees no change and
the screen silently goes stale.

**The mental model:** you are a photocopier, not a pen. Take the document, hand
back a copy with your changes, leave the original alone.

### 9. Promises and async/await — code that waits

Fetching from the internet takes time. Perhaps 50 milliseconds, perhaps five
seconds. JavaScript cannot simply stop and wait, because everything else — the
whole page — would freeze.

So a function that fetches returns a **Promise**: an IOU that says *"I do not
have your answer yet, but I will."*

The old way of collecting on that IOU was nested callbacks. The modern way is
`async`/`await`:

```typescript
export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  const response = await fetch(url);
  const data = await response.json();
  return mapResults(data);
}
```

- `async` marks a function as one that waits for things.
- `await` means "pause here until this Promise resolves, then continue".

The magic is that it *reads* like ordinary top-to-bottom code, while underneath
the browser is free to get on with other work during each pause.

`Promise<BookSearchResult[]>` is the return type: *"a promise that will
eventually produce an array of book results."*

### 10. Talking to a real API, and everything that can go wrong

The two API clients are where optimism goes to die. Consider what can happen
when you ask the internet for something:

- It works.
- The network is down.
- The server returns a 500 error.
- The server returns a 401 because your API key is wrong.
- It returns 200 OK but the body is not the shape you expected.
- It takes thirty seconds.
- You cancelled it because the user typed another letter.

Every one of those needs handling, and each client does. Two details worth
calling out:

**The response shape is not to be trusted.** TypeScript is gone at runtime. If
you write `const data: BookResponse = await response.json()`, you have told the
compiler a comforting story, not checked anything. The clients map the raw
response into our own shape explicitly, defending against missing fields.

**Cancellation is built in.** Both clients accept an `AbortSignal`:

```typescript
searchBooks(query, { signal: controller.signal })
```

Nothing in Stage 1 uses it. It exists because Stage 2 will need it — when the
user types another letter, the previous search must be abandoned. Designing for
it now was cheaper than retrofitting it later.

### 11. One place for configuration

`src/config.ts` is the **only** file in the project that reads an environment
variable.

```typescript
const openLibraryBaseUrl =
  process.env.OPEN_LIBRARY_BASE_URL ?? 'https://openlibrary.org';

const tmdbApiKey = process.env.TMDB_API_KEY ?? '';

export const config = { openLibraryBaseUrl, tmdbApiKey, ... } as const;
```

An **environment variable** is a setting that comes from outside your code — from
the machine, or a `.env` file. API keys belong there and nowhere near your source
code, because source code gets committed, and committed secrets are permanently
public.

Two things this file does properly:

**A sensible default where one is safe.** The `??` means "if this is missing, use
that instead". The Open Library URL has a working default, so nobody needs a
`.env` file just to run the tests. Secrets get no default — the TMDB key falls
back to an empty string, which fails visibly rather than silently doing something
wrong.

**Failing fast when something required is missing:**

```typescript
export function validateMovieSearchConfig(...): void {
  if (apiKey) return;
  console.error('logName=requiredEnvVarMissing, envVar=TMDB_API_KEY');
  process.exit(1);
}
```

Notice the shape of that error message. It is deliberately machine-readable
`key=value` text, because in production these lines get vacuumed up by a log
search tool and you want to be able to search for `logName=requiredEnvVarMissing`
across every service at once.

Why exit rather than carry on? Because the alternative is a service that starts
happily, accepts requests, and then fails on whichever unlucky user first
triggers a movie search. Crashing at startup is the kinder failure.

`as const` on the config object marks it read-only, so no code anywhere can
reach in and change a setting at runtime.

### 12. Modules — how files find each other

```typescript
import type { WatchlistItem } from '../types/watchlistItem.js';
import { hasRating } from '../types/watchlistItem.js';
```

Two details that trip people up:

**`import type` versus `import`.** The first brings in something that only exists
for the compiler. Since types vanish in the build, `import type` disappears too,
leaving no trace in the output. The second brings in real code.

**The `.js` on the end of a `.ts` file.** This looks like a mistake and is not.
You write `watchlistItem.ts`, but the compiler outputs `watchlistItem.js`, and
the import path has to describe the *output* — because that is the file the
runtime will actually go looking for.

And `src/index.ts` is a **barrel** — a single front door:

```typescript
export * from './types/watchlistItem.js';
export * from './utils/index.js';
export * from './api/index.js';
export { config, validateMovieSearchConfig } from './config.js';
```

Anyone using this library imports from one place and does not need to know how
the folders are arranged inside. Which means you are free to rearrange them
later without breaking anybody.

### 13. Strict mode — turning the checker up

`tsconfig.json` is where you tell TypeScript how paranoid to be. Three settings
are worth knowing:

```json
"strict": true,
"noUncheckedIndexedAccess": true,
"exactOptionalPropertyTypes": true
```

**`strict`** switches on the whole family of serious checks. The most valuable is
that `null` and `undefined` stop being allowed everywhere. If something might be
absent, you must say so and you must check.

**`noUncheckedIndexedAccess`** is the pedantic one that pays off. Without it:

```typescript
const first = items[0];      // TypeScript claims: WatchlistItem
first.title;                 // crashes if the list was empty
```

With it, `items[0]` is typed as `WatchlistItem | undefined`, because reaching for
position 0 of a list you have not measured might well find nothing. Now you are
forced to check. This is genuinely annoying about once a week and prevents a
crash about once a month.

**`exactOptionalPropertyTypes`** distinguishes *"this field is absent"* from
*"this field is present and set to undefined"*. A fine distinction that matters
when you are merging updates onto existing objects — which Stage 3 does.

The theme: turn the checks up while the project is small, because turning them
up later means fixing hundreds of errors at once.

### 14. Tests that live next to the code

Every source file has a `.test.ts` twin in the same folder:

```text
src/utils/statsSummary.ts
src/utils/statsSummary.test.ts
```

Not in a distant `tests/` folder. Right there. Two reasons: you can see at a
glance whether something is tested, and when you move a file its tests come with
it.

A test reads like a sentence:

```typescript
describe('statsSummary', () => {
  it('returns null average for an empty list', () => {
    expect(statsSummary([])).toEqual({
      totalCount: 0,
      completionRate: 0,
      averageRating: null,
    });
  });
});
```

- `describe` groups related tests
- `it` is one specific claim
- `expect(...).toEqual(...)` is the claim itself

The test runner here is **Vitest**. `npm test` runs all 79.

`src/fixtures/mockWatchlist.ts` holds a shared set of pretend items so every test
works from the same believable data rather than inventing its own.

For the API tests, real network calls would be a disaster — slow, and failing
whenever the internet hiccups or Open Library changes something. So `fetch` is
**mocked**: replaced with a fake that returns a canned response. That lets the
tests cover the interesting cases (a 500 error, a malformed body, a cancelled
request) which would be almost impossible to trigger on demand against a real
server.

---

## The files, and what each one is for

### The data model

| File | Job |
|------|-----|
| `src/types/watchlistItem.ts` | Every type in the app: `WatchStatus`, `StarRating`, the movie/book union, the update and summary types, the stats shape, and the three type guards. |

### The list utilities

| File | Job |
|------|-----|
| `src/utils/filterByStatus.ts` | Keep only items with a given status. |
| `src/utils/sortByRating.ts` | Order by star rating. |
| `src/utils/groupByGenre.ts` | Bundle items into genre buckets. |
| `src/utils/statsSummary.ts` | Total, completion rate, average rating — with the empty and unrated cases handled. |
| `src/utils/index.ts` | Barrel export for the folder. |

### Talking to the internet

| File | Job |
|------|-----|
| `src/api/openLibraryClient.ts` | Book search. No API key needed. |
| `src/api/tmdbClient.ts` | Movie search. Needs `TMDB_API_KEY`. |
| `src/api/index.ts` | Barrel export for the folder. |

### Everything else

| File | Job |
|------|-----|
| `src/config.ts` | The only place environment variables are read, plus startup validation. |
| `src/fixtures/mockWatchlist.ts` | Shared pretend data for tests. |
| `src/index.ts` | The library's single front door. |
| `tsconfig.json` | Compiler settings, including the strict checks. |
| `vitest.config.ts` | Test runner settings. |
| `.env.example` | A template showing which variables exist, with no real values in it. |
| `.github/workflows/ci.yml` | Runs the tests and the build automatically on every push. |

---

## What is missing at the end of this stage

**There is no user interface.** That is the honest headline. A real person cannot
use any of this. → **Stage 2** builds the screen.

**Nothing is stored.** No database, no file, not even browser storage. Every
function takes a list and returns a list; nobody is keeping one.

**Three utilities are never used yet.** `sortByRating`, `groupByGenre`, and
`statsSummary` are written and tested but nothing calls them. `statsSummary`
finally reaches the screen in Stage 5.

**Movie search needs setting up.** Book search works out of the box. Movies need
a free TMDB key in a `.env` file.

---

## Running it

```bash
npm install
npm test             # 79 tests
npm run build        # src/ -> dist/
```

Then try it for real:

```bash
node --input-type=module -e "
  import { searchBooks } from './dist/api/openLibraryClient.js';
  console.log(await searchBooks('dune'));
"
```

---

## Next

```bash
git checkout stage-2
```

Stage 2 puts a face on all of this — cards, a search box, and a detail panel,
using nothing but React itself.
