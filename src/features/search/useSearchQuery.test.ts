import { act, waitFor } from '@testing-library/react';
import { useUiStore } from '../../stores/uiStore.js';
import {
  delayedHobbit,
  openLibraryFailure,
} from '../../testing/msw/handlers.js';
import { renderHookWithProviders } from '../../testing/renderWithProviders.js';
import { server } from '../../testing/msw/server.js';
import { useSearchQuery } from './useSearchQuery.js';

function enterBookQuery(query: string) {
  act(() => {
    useUiStore.getState().setMediaType('book');
    useUiStore.getState().setQuery(query);
  });
}

describe('useSearchQuery', () => {
  it('exposes loading before returning mapped results', async () => {
    server.use(delayedHobbit());
    const { result } = renderHookWithProviders(useSearchQuery);

    enterBookQuery('hobbit');
    await waitFor(() => expect(result.current.isSearching).toBe(true));
    await waitFor(() =>
      expect(result.current.results).toEqual([
        {
          id: 'works/OL82586W',
          title: 'The Hobbit',
          author: 'J.R.R. Tolkien',
          publishYear: 1937,
          genre: 'Fantasy',
        },
      ])
    );
    expect(result.current.isSearching).toBe(false);
  });

  it('returns a successful search from MSW', async () => {
    const { result } = renderHookWithProviders(useSearchQuery);

    enterBookQuery('dune');
    await waitFor(() => expect(result.current.results).toHaveLength(3));
    expect(result.current.errorMessage).toBeNull();
  });

  it('turns an API failure into the hook error state', async () => {
    server.use(openLibraryFailure(500));
    const { result } = renderHookWithProviders(useSearchQuery);

    enterBookQuery('dune');
    await waitFor(() =>
      expect(result.current.errorMessage).toContain('HTTP 500')
    );
    expect(result.current.results).toEqual([]);
  });
});
