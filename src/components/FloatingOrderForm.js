import React from 'react';
import '../pages/styles/FloatingOrderForm.css';

const FloatingOrderForm = ({ formData, setFormData, onSubmit, onClose }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

        try {
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=pk.a0ef2aa9b6e88ca4db606dbfc87a43a7&lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const fullAddress = data.display_name;

          setFormData((prev) => ({
            ...prev,
            location: locationLink,
            address: fullAddress,
          }));
        } catch (err) {
          alert('Failed to fetch address. Using only coordinates.');
          setFormData((prev) => ({
            ...prev,
            location: locationLink,
          }));
        }
      },
      (error) => {
        alert('Location access denied or failed.');
        console.error(error);
      }
    );
  };

  return (
    <div className="floating-form-backdrop">
      <div className="floating-form">
        <h3>🧾 Delivery / Invoice Details</h3>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name || ''}
          onChange={handleChange}
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone || ''}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email || ''}
          onChange={handleChange}
        />

        <textarea
          name="address"
          placeholder="Delivery Address"
          rows="2"
          value={formData.address || ''}
          onChange={handleChange}
        ></textarea>

        <button className="detect-location" onClick={handleDetectLocation}>
          📍 Detect Location
        </button>

       

        <div className="form-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="submit-btn" onClick={onSubmit}>
            Send to WhatsApp 💬
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingOrderForm;
