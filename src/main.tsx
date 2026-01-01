import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { LocalizationProvider } from './contexts/LocalizationContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocalizationProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LocalizationProvider>
  </StrictMode>
);
