import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaSearch } from 'react-icons/fa'; // Re-import FaSearch

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
  const location = useLocation(); // Get current location object

  const { cartItems, toggleCart } = useCart();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('adminAuthenticated');

  // Function to close the mobile menu
  const closeMobileMenu = () => setMenuOpen(false);

  // Toggle mobile menu state
  const toggleMobileMenu = () => setMenuOpen(!menuOpen);

  // Effect to close mobile menu on route change
  useEffect(() => {
    closeMobileMenu(); // Close the menu whenever the route changes
  }, [location]); // Re-run effect when location object changes

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
      setMenuOpen(false); // Also close menu on scroll
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
      closeMobileMenu(); // Close menu after search
    }
  };

  const handleSuggestionClick = (term) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setSearchTerm('');
    setSuggestions([]);
    closeMobileMenu(); // Close menu after suggestion click
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
    closeMobileMenu(); // Close menu after logout
  };

  return (
    <nav className="navbar" style={{ top: showNavbar ? '0' : '-80px' }}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>🏥 Vaidya<span className="highlight">Sthana</span></Link>

        <form className="search-bar" onSubmit={handleSearchSubmit} autoComplete="off" ref={suggestionsRef}>
          <input
            type="text"
            placeholder="Search drug or brand..."
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button type="submit">
            <FaSearch />
          </button>
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
          <li><NavLink to="/" className="nav-link" onClick={closeMobileMenu}>Home</NavLink></li>
          <li><NavLink to="/shop" className="nav-link" onClick={closeMobileMenu}>Shop</NavLink></li>
          <li><NavLink to="/categories" className="nav-link" onClick={closeMobileMenu}>Categories</NavLink></li>
          <li><NavLink to="/contact" className="nav-link" onClick={closeMobileMenu}>Contact</NavLink></li>
          <li><NavLink to="/about" className="nav-link" onClick={closeMobileMenu}>About</NavLink></li>
          <li><NavLink to="/admin/dashboard" className="nav-link" onClick={closeMobileMenu}>Admin Dashboard</NavLink></li>
          {isAdmin && (
            <li><button onClick={handleLogout} className="nav-link logout-btn">📛 Logout</button></li>
          )}
        </ul>

        <div className="cart-icon" onClick={() => { toggleCart(); closeMobileMenu(); }} title="View Cart"> {/* Close menu when cart is opened */}
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