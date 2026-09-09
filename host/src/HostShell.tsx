import { NavLink, Route, Routes } from 'react-router-dom';
import AboutHostPage from './AboutHostPage';
import RemoteWatchLog from './RemoteWatchLog';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'shell__link shell__link--active' : 'shell__link';

export default function HostShell() {
  return (
    <div className="shell">
      <header className="shell__header">
        <div className="shell__brand">
          <span className="shell__logo" aria-hidden="true">
            ▣
          </span>
          <div>
            <p className="shell__title">Shell</p>
            <p className="shell__subtitle">Host application · port 3000</p>
          </div>
        </div>

        <nav className="shell__nav" aria-label="Remote navigation">
          <NavLink to="/watchlist" className={linkClass}>
            Watchlist
          </NavLink>
          <NavLink to="/login" className={linkClass}>
            Sign in
          </NavLink>
          <NavLink to="/about-host" className={linkClass}>
            About this host
          </NavLink>
        </nav>

        <p className="shell__badge">watchlog remote · :3001</p>
      </header>

      <main className="shell__main">
        <Routes>
          <Route path="/about-host" element={<AboutHostPage />} />
          <Route path="/*" element={<RemoteWatchLog />} />
        </Routes>
      </main>
    </div>
  );
}
