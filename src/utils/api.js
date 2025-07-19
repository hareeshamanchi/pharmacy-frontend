// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://pharmacy-backend-yyf3.onrender.com', // ✅ your live backend URL
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
