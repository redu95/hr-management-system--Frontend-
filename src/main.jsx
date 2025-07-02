import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "primereact/resources/themes/lara-light-indigo/theme.css";  // Or your chosen theme
import "primeicons/primeicons.css";
import App from './App.jsx'
import './index.css' // Global styles
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
