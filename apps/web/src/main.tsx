import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FeedbackProvider } from '@/components/feedback/FeedbackProvider'
import { ensureDefaultTheme } from '@/themes/manager'
import App from './App.tsx'
import './index.css'

ensureDefaultTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FeedbackProvider>
      <App />
    </FeedbackProvider>
  </StrictMode>,
)
