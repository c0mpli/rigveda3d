import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Router } from 'wouter'
import './index.css'
import App from './App.jsx'
import { NarrationProvider } from './contexts/NarrationContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <NarrationProvider>
        <App />
      </NarrationProvider>
    </Router>
  </StrictMode>,
)
