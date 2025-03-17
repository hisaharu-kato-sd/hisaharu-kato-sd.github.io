import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css'; // グローバルスタイルのインポート
import './styles/tailwind.css'
import App from './App'; // または実際のルートコンポーネントへのパス

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
