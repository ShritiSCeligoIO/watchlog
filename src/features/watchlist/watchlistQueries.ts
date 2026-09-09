import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import {
  createWatchlistItem,
  deleteWatchlistItem,
  fetchWatchlist,
  patchWatchlistItem,
} from './watchlistApi.js';
import { WATCHLIST_STALE_TIME_MS } from '../../queries/queryClient.js';
import { queryKeys } from '../../queries/queryKeys.js';
import { useUiStore } from '../../stores/uiStore';
import type {
  WatchlistItem,
  WatchlistItemUpdate,
} from '../../types/watchlistItem.js';
import { applyWatchlistUpdate } from '../../utils/applyWatchlistUpdate.js';

/** Shared options keep list and item reads on one cache entry. */
export const watchlistQueryOptions = queryOptions({
  queryKey: queryKeys.watchlist,
  queryFn: ({ signal }) => fetchWatchlist({ signal }),
  staleTime: WATCHLIST_STALE_TIME_MS,
});

export function useWatchlist() {
  return useQuery(watchlistQueryOptions);
}

/** Select one item from the cached list without another request. */
export function useWatchlistItem(id: string | undefined) {
  return useQuery({
    ...watchlistQueryOptions,
    select: (items) => items.find((item) => item.id === id),
  });
}

interface OptimisticContext {
  previous: WatchlistItem[] | undefined;
}

/** Cancel, snapshot, and predict the next watchlist. */
async function beginOptimisticWrite(
  queryClient: QueryClient,
  recipe: (current: WatchlistItem[]) => WatchlistItem[]
): Promise<OptimisticContext> {
  await queryClient.cancelQueries({ queryKey: queryKeys.watchlist });

  const previous = queryClient.getQueryData<WatchlistItem[]>(
    queryKeys.watchlist
  );

  queryClient.setQueryData<WatchlistItem[]>(queryKeys.watchlist, (current) =>
    recipe(current ?? [])
  );

  return { previous };
}

function rollback(
  queryClient: QueryClient,
  context: OptimisticContext | undefined
): void {
  if (context?.previous !== undefined) {
    queryClient.setQueryData(queryKeys.watchlist, context.previous);
  }
}

/** Reconcile the prediction with the server after success or failure. */
function settleWatchlist(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: queryKeys.watchlist });
}

export function useAddWatchlistItem() {
  const queryClient = useQueryClient();
  const shouldFail = useUiStore((state) => state.simulateWriteFailure);

  return useMutation({
    mutationFn: (item: WatchlistItem) =>
      createWatchlistItem(item, { shouldFail }),
    onMutate: (item) =>
      beginOptimisticWrite(queryClient, (current) => [...current, item]),
    onError: (_error, _item, context) => rollback(queryClient, context),
    onSettled: () => settleWatchlist(queryClient),
  });
}

export function useRemoveWatchlistItem() {
  const queryClient = useQueryClient();
  const shouldFail = useUiStore((state) => state.simulateWriteFailure);

  return useMutation({
    mutationFn: (id: string) => deleteWatchlistItem(id, { shouldFail }),
    onMutate: (id) =>
      beginOptimisticWrite(queryClient, (current) =>
        current.filter((item) => item.id !== id)
      ),
    onError: (_error, _id, context) => rollback(queryClient, context),
    onSettled: () => settleWatchlist(queryClient),
  });
}

export interface UpdateWatchlistItemVariables {
  id: string;
  update: WatchlistItemUpdate;
}

export function useUpdateWatchlistItem() {
  const queryClient = useQueryClient();
  const shouldFail = useUiStore((state) => state.simulateWriteFailure);

  return useMutation({
    mutationFn: ({ id, update }: UpdateWatchlistItemVariables) =>
      patchWatchlistItem(id, update, { shouldFail }),
    // The prediction and mock backend share the same business rule.
    onMutate: ({ id, update }) =>
      beginOptimisticWrite(queryClient, (current) =>
        current.map((item) =>
          item.id === id ? applyWatchlistUpdate(item, update) : item
        )
      ),
    onError: (_error, _variables, context) => rollback(queryClient, context),
    onSettled: () => settleWatchlist(queryClient),
  });
}
