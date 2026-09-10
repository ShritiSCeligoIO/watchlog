import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.js';
import { useAuthStore } from '../stores/authStore.js';
import { useUiStore } from '../stores/uiStore.js';
import { testI18n } from './testI18n.js';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}

const initialUiState = useUiStore.getState();
const initialAuthState = useAuthStore.getState();
const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

export function resetTestState(): void {
  useUiStore.setState(initialUiState, true);
  useAuthStore.setState(initialAuthState, true);
  localStorage.clear();
  sessionStorage.clear();
  if (testI18n.language !== 'en') {
    void testI18n.changeLanguage('en');
  }
}

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  queryClient?: QueryClient;
  signedIn?: boolean;
}

function Providers({
  children,
  client,
  route,
}: {
  children: ReactNode;
  client: QueryClient;
  route: string;
}) {
  return (
    <I18nextProvider i18n={testI18n}>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[route]} future={routerFuture}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    </I18nextProvider>
  );
}

function prepare(options: ProviderOptions) {
  resetTestState();
  if (options.signedIn) {
    useAuthStore.getState().signIn();
  }
  return {
    route: options.route ?? '/watchlist',
    client: options.queryClient ?? createTestQueryClient(),
  };
}

export function renderWithProviders(
  ui: ReactElement,
  options: ProviderOptions = {}
) {
  const { route, client } = prepare(options);
  const result = render(ui, {
    ...options,
    wrapper: ({ children }) => (
      <Providers client={client} route={route}>{children}</Providers>
    ),
  });
  return { ...result, queryClient: client, user: userEvent.setup() };
}

export function renderHookWithProviders<TResult>(
  hook: () => TResult,
  options: ProviderOptions = {}
) {
  const { route, client } = prepare(options);
  const result = renderHook(hook, {
    wrapper: ({ children }) => (
      <Providers client={client} route={route}>{children}</Providers>
    ),
  });
  return { ...result, queryClient: client };
}

export function renderApp(options: ProviderOptions = {}) {
  const { route, client } = prepare(options);
  const result = render(
    <I18nextProvider i18n={testI18n}>
      <MemoryRouter initialEntries={[route]} future={routerFuture}>
        <App queryClient={client} />
      </MemoryRouter>
    </I18nextProvider>
  );
  return { ...result, queryClient: client, user: userEvent.setup() };
}
