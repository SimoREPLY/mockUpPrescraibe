import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PrescrAIbeFlow from './PrescrAIbeFlow'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrescrAIbeFlow />
  </StrictMode>,
)
