import { memo, useCallback, useDeferredValue, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { toErrorMessage } from '../api/isRetryableError.js';
import type { BookSearchResult } from '../api/openLibraryClient.js';
import type { MovieSearchResult } from '../api/tmdbClient.js';
import { MIN_SEARCH_QUERY_LENGTH } from '../constants/search.js';
import { countRender } from '../dev/renderLog.js';
import type {
  MediaSearchResult,
  SearchMediaType,
} from '../features/search/searchTypes.js';
import { useSearchQuery } from '../features/search/useSearchQuery';
import {
  useAddWatchlistItem,
  useWatchlist,
} from '../features/watchlist/watchlistQueries';
import { MEDIA_TYPE_PLURAL_KEYS } from '../i18n/labelKeys.js';
import { cn } from '../lib/utils';
import { useUiStore } from '../stores/uiStore';
import {
  bookSearchResultToWatchlistItem,
  movieSearchResultToWatchlistItem,
  watchlistIdForBookSearch,
  watchlistIdForMovieSearch,
} from '../utils/searchMappers.js';
import SearchResultRow from './SearchResultRow';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

/**
 * `memo` on a component that takes no props at all.
 *
 * That reads like a no-op, but props are only half of what makes a component
 * re-render — the other half is its parent re-rendering, and this one sits
 * inside `WatchlistPage`. Opening the removal dialog changed a field in the UI
 * store, `WatchlistPage` re-rendered, and the entire search panel re-rendered
 * with it for no reason. With no props there is nothing to compare, so memo
 * always skips, and the panel now renders only when its *own* subscriptions
 * change: the query, the media type, or the search results.
 */
const SearchPanel = memo(function SearchPanel() {
  countRender('SearchPanel');
  const { t } = useTranslation(['search', 'common']);

  const mediaType = useUiStore((state) => state.mediaType);
  const query = useUiStore((state) => state.query);
  const setMediaType = useUiStore((state) => state.setMediaType);
  const setQuery = useUiStore((state) => state.setQuery);

  const {
    results,
    isSearching,
    errorMessage,
    movieSearchUnavailable,
    queryLongEnough,
    trimmedQuery,
  } = useSearchQuery();

  const { data: items = [] } = useWatchlist();
  const addItem = useAddWatchlistItem();

  // Rebuilding this on every keystroke threw away a set that had not changed.
  const watchlistIds = useMemo(
    () => new Set(items.map((entry) => entry.id)),
    [items]
  );

  /**
   * Deferring the *results* rather than the query.
   *
   * The input itself is already fast: its value is urgent state and the request
   * behind it is debounced. What can still stall is the commit when a large
   * batch of results arrives — React would render every row before it got
   * around to the keystroke that is already queued.
   *
   * `useDeferredValue` marks that render as interruptible. React keeps the
   * previous list on screen, stays responsive to typing, and finishes the new
   * list when there is nothing more urgent to do. With ten results the
   * difference is invisible; with several hundred it is the difference between
   * a responsive field and a stuttering one.
   */
  const deferredResults = useDeferredValue(results);
  const resultsAreStale = deferredResults !== results;
  // Driven by what has actually been typed, not by the debounced value, so the
  // hint does not reappear for a moment after a long query is entered.
  const liveQueryTooShort =
    query.trim().length > 0 && query.trim().length < MIN_SEARCH_QUERY_LENGTH;
  const showNoResults =
    !movieSearchUnavailable &&
    queryLongEnough &&
    !isSearching &&
    errorMessage === null &&
    results.length === 0;

  /**
   * Wrapped because it is a prop on every memoised row. A fresh function each
   * render is a fresh prop, and a fresh prop defeats the memo on all of them.
   * `mutate` keeps a stable identity for the life of the mutation, so this
   * changes only when the media type does.
   */
  const handleAdd = useCallback(
    (result: MediaSearchResult) => {
      addItem.mutate(
        mediaType === 'book'
          ? bookSearchResultToWatchlistItem(result as BookSearchResult)
          : movieSearchResultToWatchlistItem(result as MovieSearchResult)
      );
    },
    [mediaType, addItem.mutate]
  );

  return (
    <section
      aria-label={t('search:label')}
      className="mb-6 rounded-xl border bg-card p-4 shadow-sm sm:p-6"
    >
      <h2 className="mb-4 text-lg font-semibold">{t('search:heading')}</h2>

      <Tabs
        value={mediaType}
        onValueChange={(value) => setMediaType(value as SearchMediaType)}
      >
        <TabsList aria-label={t('search:mediaTypeLabel')}>
          <TabsTrigger value="book">
            {t(`common:${MEDIA_TYPE_PLURAL_KEYS.book}`)}
          </TabsTrigger>
          <TabsTrigger value="movie">
            {t(`common:${MEDIA_TYPE_PLURAL_KEYS.movie}`)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="book">
          <Input
            type="search"
            name="searchQuery"
            value={query}
            placeholder={t('search:books.placeholder')}
            aria-label={t('search:books.label')}
            onChange={(event) => setQuery(event.target.value)}
          />
        </TabsContent>

        <TabsContent value="movie">
          <Input
            type="search"
            name="searchQuery"
            value={query}
            placeholder={t('search:movies.placeholder')}
            aria-label={t('search:movies.label')}
            onChange={(event) => setQuery(event.target.value)}
          />
        </TabsContent>
      </Tabs>

      {movieSearchUnavailable && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {/* `<Trans>` rather than `t()` because the sentence has an element in
              the middle of it. The translator moves `<code>` to wherever the
              grammar needs it and the styling comes from here, so neither side
              has to hard-code the other's job. */}
          <Trans
            i18nKey="movieUnavailable"
            ns="search"
            components={{
              code: <code className="rounded bg-muted px-1 py-0.5 text-xs" />,
            }}
          />
        </p>
      )}

      {liveQueryTooShort && (
        <p className="mt-3 text-sm text-muted-foreground">
          {/* A real plural: `count` picks `minLength_one` or `minLength_other`,
              so a threshold of 1 reads "1 character" rather than "1 characters". */}
          {t('search:minLength', { count: MIN_SEARCH_QUERY_LENGTH })}
        </p>
      )}

      {showNoResults && (
        <p className="mt-3 text-sm text-muted-foreground">
          {t('search:noResults', { query: trimmedQuery })}
        </p>
      )}

      {!movieSearchUnavailable && isSearching && (
        <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
          {t('search:searching')}
        </p>
      )}

      {!movieSearchUnavailable && errorMessage !== null && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      {/* The optimistic add already flipped this row to "Added" and back, so
          this explains why the label reverted. */}
      {addItem.isError && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {toErrorMessage(addItem.error, t('search:errors.add'))}
        </p>
      )}

      {!movieSearchUnavailable &&
        !isSearching &&
        errorMessage === null &&
        deferredResults.length > 0 && (
        <ul
          className={cn(
            'mt-4 space-y-2 transition-opacity',
            resultsAreStale && 'opacity-60'
          )}
        >
          {deferredResults.map((result) => {
            const watchlistId =
              mediaType === 'book'
                ? watchlistIdForBookSearch(result as BookSearchResult)
                : watchlistIdForMovieSearch(result as MovieSearchResult);

            return (
              <SearchResultRow
                key={`${mediaType}-${result.id}`}
                result={result}
                alreadyAdded={watchlistIds.has(watchlistId)}
                onAdd={handleAdd}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
});

export default SearchPanel;
