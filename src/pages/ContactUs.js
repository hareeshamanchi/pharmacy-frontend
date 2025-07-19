import React, { useState } from 'react';
import './styles/ContactUs.css';
import api from '../utils/api'; // ✅ replaced axios with api.js

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/api/contact/send-message', formData);
      setSuccess(response.data.message);
      setError('');
    } catch (err) {
      setError('Failed to send message.');
      setSuccess('');
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-hero">
        <h1>Contact PharmaCare</h1>
        <p>We’re here to help you 24/7. Reach out with your health needs.</p>
      </div>

      <div className="contact-content">
        <div className="contact-form">
          <h2>Send us a message</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              required
            />
            <button type="submit">Submit</button>
          </form>
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div className="contact-map">
          <h2>Our Location</h2>
          <iframe
            title="PharmaCare Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.9197261834534!2d80.22996781482955!3d13.041903716143368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526654c8b51fd9%3A0xf4f0df650c84842d!2sApollo%20Pharmacy!5e0!3m2!1sen!2sin!4v1688621234567!5m2!1sen!2sin"
            width="100%"
            height="280"
            style={{ border: '0', borderRadius: '10px' }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
