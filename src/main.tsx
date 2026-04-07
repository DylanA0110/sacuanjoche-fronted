import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'react-phone-number-input/style.css';
import App from './FloriApp';
import { showConsoleWarning } from './consoleWarning';

// 🚨 Mostrar advertencia de consola siempre (desarrollo y producción)
// Esto disuade a usuarios de copiar/pegar código malicioso
showConsoleWarning();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
