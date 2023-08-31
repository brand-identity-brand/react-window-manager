import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import WindowManagerRegistryProvider from './lib';

ReactDOM.createRoot(document.getElementById('root')).render(
  <WindowManagerRegistryProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </WindowManagerRegistryProvider>
);