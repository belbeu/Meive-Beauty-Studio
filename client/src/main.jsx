import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "./theme/theme.css";
import "./theme/theme-pages.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx'

// Corrigido para incluir o prefixo VITE_
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)