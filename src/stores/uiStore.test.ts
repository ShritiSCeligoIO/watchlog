import { useUiStore } from './uiStore.js';
import { resetTestState } from '../testing/renderWithProviders.js';

describe('UI store actions', () => {
  beforeEach(resetTestState);

  it('updates search and developer controls', () => {
    useUiStore.getState().setMediaType('movie');
    useUiStore.getState().setQuery('Dune');
    useUiStore.getState().setSimulateWriteFailure(true);

    expect(useUiStore.getState()).toMatchObject({
      mediaType: 'movie',
      query: 'Dune',
      simulateWriteFailure: true,
    });
  });

  it('opens and cancels the shared removal target', () => {
    useUiStore.getState().requestRemoval({ id: 'book-2', title: 'Dune' });
    expect(useUiStore.getState().pendingRemoval).toEqual({
      id: 'book-2',
      title: 'Dune',
    });

    useUiStore.getState().cancelRemoval();
    expect(useUiStore.getState().pendingRemoval).toBeNull();
  });

  it('sets and toggles both theme values', () => {
    useUiStore.getState().setTheme('dark');
    expect(useUiStore.getState().theme).toBe('dark');
    useUiStore.getState().toggleTheme();
    expect(useUiStore.getState().theme).toBe('light');
    useUiStore.getState().toggleTheme();
    expect(useUiStore.getState().theme).toBe('dark');
  });
});
