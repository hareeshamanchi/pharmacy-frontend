// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ✅ CORRECT
import './pages/styles/Navbar.css';
import './pages/styles/Footer.css';
import './pages/styles/Home.css';
import './pages/styles/Shop.css';
import './pages/styles/Categories.css';
import './pages/styles/ProductDetails.css';
import './pages/styles/CartSidebar.css';
import './pages/styles/Toast.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
