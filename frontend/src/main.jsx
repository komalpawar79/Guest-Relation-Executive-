import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

console.log('Main.jsx: Starting app initialization');

const root = document.getElementById('root');
console.log('Main.jsx: Root element:', root);

if (!root) {
  console.error('Main.jsx: Root element not found!');
} else {
  console.log('Main.jsx: Creating React root');
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('Main.jsx: App rendered');
}
