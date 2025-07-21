// Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa'; // Removed FaSearch as it's no longer used

import api from '../utils/api';
import '../pages/styles/Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showNavbar, setShowNavbar] = useState(true);

  const suggestionsRef = useRef();
  const lastScrollTop = useRef(0);

  const { cartItems, toggleCart } = useCart();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('adminAuthenticated');

  const toggleMobileMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    api.get('/api/products')
      .then((res) => setAllProducts(res.data))
      .catch((err) => console.error('Failed to fetch products:', err));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setShowNavbar(scrollTop <= lastScrollTop.current || scrollTop === 0);
      lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;
      setMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setSearchTerm(input);
    setHighlightedIndex(-1);
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }
    const matches = allProducts.filter(p =>
      p.drugName.toLowerCase().includes(input.toLowerCase()) ||
      p.brandName.toLowerCase().includes(input.toLowerCase())
    );
    setSuggestions(matches.slice(0, 5));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (term) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setSearchTerm('');
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[highlightedIndex].drugName);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

  return (
    <nav className="navbar" style={{ top: showNavbar ? '0' : '-80px' }}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">🏥 Vaidya<span className="highlight">Sthana</span></Link>

        <form className="search-bar" onSubmit={handleSearchSubmit} autoComplete="off" ref={suggestionsRef}>
          <input
            type="text"
            placeholder="Search drug or brand..."
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          {/* Removed the button completely as per your request */}
          {suggestions.length > 0 && (
            <ul className="search-suggestions">
              {suggestions.map((sugg, index) => (
                <li
                  key={sugg.productId}
                  className={highlightedIndex === index ? 'highlighted' : ''}
                  onClick={() => handleSuggestionClick(sugg.drugName)}
                >
                  {sugg.drugName} <small>({sugg.brandName})</small>
                </li>
              ))}
            </ul>
          )}
        </form>

        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li><NavLink to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</NavLink></li>
          <li><NavLink to="/shop" className="nav-link" onClick={() => setMenuOpen(false)}>Shop</NavLink></li>
          <li><NavLink to="/categories" className="nav-link" onClick={() => setMenuOpen(false)}>Categories</NavLink></li>
          <li><NavLink to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</NavLink></li>
          <li><NavLink to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About</NavLink></li>
          <li><NavLink to="/admin/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>Admin Dashboard</NavLink></li>
          {isAdmin && (
            <li><button onClick={handleLogout} className="nav-link logout-btn">📛 Logout</button></li>
          )}
        </ul>

        <div className="cart-icon" onClick={toggleCart} title="View Cart">
          <FaShoppingCart />
          {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
        </div>

        <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;