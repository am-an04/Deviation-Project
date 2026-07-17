import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { App } from './App';
import './global.css';

// Configure Axios default baseURL dynamically for local development vs Vercel production
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
