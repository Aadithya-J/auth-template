import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';  // Import BrowserRouter
import App from './App.jsx';
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext.jsx';

createRoot(document.getElementById('root')).render(
<LanguageProvider>
    <BrowserRouter> {/* Wrap the App in BrowserRouter */}
      <App />
    </BrowserRouter>
</LanguageProvider>

);
