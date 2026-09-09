import WatchlistView from './components/WatchlistView';
import { SelectionProvider } from './context/SelectionContext';
import { WatchlistDataProvider } from './context/WatchlistDataContext';

/** Providers make shared state available to the whole screen. */
export default function App() {
  return (
    <WatchlistDataProvider>
      <SelectionProvider>
        <main className="app">
          <header className="app-header">
            <h1>WatchLog</h1>
            <p>
              Track movies and books you want to watch, are watching, or have
              finished.
            </p>
          </header>

          <WatchlistView />
        </main>
      </SelectionProvider>
    </WatchlistDataProvider>
  );
}
