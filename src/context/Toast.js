// src/context/Toast.js
import React, { useEffect, useState } from 'react';
import '../pages/styles/Toast.css'; // This is where the styling is

const Toast = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleShowToast = (e) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 3000); // Toast disappears after 3 seconds
    };

    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, []);

  return (
    toast && (
      // Added a wrapper div for more robust positioning
      <div className="toast-wrapper">
        <div className={`toast ${toast.type || 'success'}`}>
          <span className="toast-message">{toast.message}</span>
        </div>
      </div>
    )
  );
};

export const showToast = (message, type = 'success') => {
  const event = new CustomEvent('show-toast', {
    detail: { message, type },
  });
  window.dispatchEvent(event);
};

export default Toast;