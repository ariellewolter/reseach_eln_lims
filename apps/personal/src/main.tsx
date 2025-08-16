import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@research/theme/index.css';
import './index.css';
import registerSW from './sw-register';

registerSW();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
