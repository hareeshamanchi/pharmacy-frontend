import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('adminAuthenticated')) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('/api/admin/login', {
        email,
        password,
      });

      if (res.status === 200) {
        localStorage.setItem('adminAuthenticated', 'true');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="admin-login-container">
      <h2>🔐 Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Admin Email or Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p className="note">⚠️ No login required for customers. Only Admin has access.
      </p>
    </div>
  );
};

export default AdminLogin;
