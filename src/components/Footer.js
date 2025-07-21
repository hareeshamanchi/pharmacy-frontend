import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaTwitter } from 'react-icons/fa';
import '../pages/styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">

        {/* Branding */}
        <div className="footer-logo">
          <h2>PharmaCare</h2>
          <p>Your trusted online pharmacy</p>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        {/* Social Icons */}
        <div className="footer-socials">
          <h4>Connect</h4>
          <div className="icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://wa.me/917207097501" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
          </div>
        </div>

        {/* Google Map */}
        <div className="footer-map">
          <h4>Visit Us</h4>
          <iframe
            title="PharmaCare Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15250.709328221657!2d78.4839846279183!3d13.560183179246887!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb2b272d1f7e03b%3A0x6d1f9a5d3f2d2b5!2sGanesh%20HosapitaK!5e0!3m2!1sen!2sin!4v1705350438183!5m2!1sen!2sin" // Updated Google Maps embed URL
            width="100%"
            height="180"
            style={{ border: 0, borderRadius: '10px' }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} PharmaCare. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;