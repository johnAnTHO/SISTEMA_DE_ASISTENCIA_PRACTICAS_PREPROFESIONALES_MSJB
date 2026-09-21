import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Interceptor para redirigir las peticiones del backend en producción
axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('http://localhost:3000')) {
    const apiUrl = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : 'http://localhost:3000';
    config.url = config.url.replace('http://localhost:3000', apiUrl);
  }
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
