import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'

// hide images that fail to load (e.g. blocked by a network filter) instead of showing a broken icon
window.addEventListener('error', (e) => { if (e.target?.tagName === 'IMG') e.target.style.visibility = 'hidden' }, true)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
