import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NarrationProvider } from './contexts/NarrationContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NarrationProvider>
      <App />
    </NarrationProvider>
  </StrictMode>,
)
