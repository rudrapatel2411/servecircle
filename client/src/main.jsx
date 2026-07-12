import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/index.js'
import './index.css'
import App from './App.jsx'
import installCustomAlert from './utils/customAlert.js'

// Initialize custom styled alert system globally
installCustomAlert();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </StrictMode>,
)
