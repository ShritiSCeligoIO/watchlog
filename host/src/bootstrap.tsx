import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import HostShell from './HostShell';
import './styles/shell.css';

const container = document.getElementById('host-root');

if (!container) {
  throw new Error('Host root container element not found');
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <HostShell />
    </BrowserRouter>
  </StrictMode>
);
