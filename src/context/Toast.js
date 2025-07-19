// src/context/Toast.js
import React, { useEffect, useState } from 'react';
import '../pages/styles/Toast.css';

const Toast = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleShowToast = (e) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 3000);
    };

    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, []);

  return (
    toast && (
      <div className={`toast ${toast.type || 'success'}`}>
        <span className="toast-message">{toast.message}</span>
      </div>
    )
  );
};

// ✅ Global function to trigger toast from anywhere
export const showToast = (message, type = 'success') => {
  const event = new CustomEvent('show-toast', {
    detail: { message, type },
  });
  window.dispatchEvent(event);
};

export default Toast;
