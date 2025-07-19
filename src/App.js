import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './context/CartSidebar';
import Toast from './context/Toast'; // ✅ Simple Toast component (event-based)

import Home from './pages/Home';
import Shop from './pages/Shop';
import Categories from './pages/Categories';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import ProductDetails from './pages/ProductDetails';
import CategoryProducts from './pages/CategoryProducts';
import SearchResults from './pages/SearchResults';

import AdminAddProduct from './components/admin/AdminAddProduct';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminEditWrapper from './components/admin/AdminEditWrapper';
import AdminLogin from './components/admin/AdminLogin';

function App() {
  const isAdminAuthenticated = localStorage.getItem('adminAuthenticated');

  return (
    <CartProvider>
      <Router>
        <Navbar />
        <CartSidebar />
        <Toast /> {/* ✅ Toast always mounted globally */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/products/:category" element={<CategoryProducts />} />
          <Route path="/product/:productId" element={<ProductDetails />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<AboutUs />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={isAdminAuthenticated ? <AdminDashboard /> : <Navigate to="/admin/login" />}
          />
          <Route
            path="/admin/add-product"
            element={isAdminAuthenticated ? <AdminAddProduct /> : <Navigate to="/admin/login" />}
          />
          <Route
            path="/admin/edit/:productId"
            element={isAdminAuthenticated ? <AdminEditWrapper /> : <Navigate to="/admin/login" />}
          />

          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
        <Footer />
      </Router>
    </CartProvider>
  );
}

export default App;
