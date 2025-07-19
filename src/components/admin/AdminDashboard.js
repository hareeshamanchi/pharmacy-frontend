import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    } else {
      fetchProducts();
    }
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(`Delete ${productId}?`)) return;
    try {
      await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      });
      fetchProducts();
    } catch {
      setError('Failed to delete product');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🛠️ Admin Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>💛 Logout</button>
      </div>

      <p className="subtitle">Manage your product catalog with ease</p>

      <button className="add-product-btn" onClick={() => navigate('/admin/add-product')}>
        ➕ Add New Product
      </button>

      {error && <p className="error">{error}</p>}

      <div className="table-container">
        <table className="product-table">
          <thead>
            <tr>
              <th>ID</th><th>Drug</th><th>Brand</th><th>Price</th>
              <th>Discount</th><th>Category</th><th>Image</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan="8">Loading...</td></tr>
            ) : (
              products.map(prod => (
                <tr key={prod.productId}>
                  <td>{prod.productId}</td>
                  <td>{prod.drugName}</td>
                  <td>{prod.brandName}</td>
                  <td>₹{prod.price}</td>
                  <td>{prod.discount}%</td>
                  <td>{prod.category}</td>
                  <td><img src={prod.imageUrl} alt="" className="thumb" /></td>
                  <td>
                    <button className="edit-btn" onClick={() => navigate(`/admin/edit/${prod.productId}`)}>✏️</button>
                    <button className="delete-btn" onClick={() => handleDelete(prod.productId)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
