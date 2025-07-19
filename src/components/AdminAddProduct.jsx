import React, { useState } from 'react';
import axios from 'axios';
import './AdminAddProduct.css';

const AdminAddProduct = () => {
  const [formData, setFormData] = useState({
    productId: crypto.randomUUID(),
    drugName: '',
    brandName: '',
    composition: '',
    price: '',
    discount: 0,
    description: '',
    tabletsPerSheet: '',
    imageUrl: '',
    category: '',
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/add-product', formData);
      setSuccess(true);
      setError('');
      setFormData({
        productId: crypto.randomUUID(),
        drugName: '',
        brandName: '',
        composition: '',
        price: '',
        discount: 0,
        description: '',
        tabletsPerSheet: '',
        imageUrl: '',
        category: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      setSuccess(false);
    }
  };

  return (
    <div className="admin-add-product">
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="drugName" placeholder="Drug Name" value={formData.drugName} onChange={handleChange} required />
        <input type="text" name="brandName" placeholder="Brand Name" value={formData.brandName} onChange={handleChange} required />
        <input type="text" name="composition" placeholder="Composition" value={formData.composition} onChange={handleChange} required />
        <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
        <input type="number" name="discount" placeholder="Discount (%)" value={formData.discount} onChange={handleChange} />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
        <input type="number" name="tabletsPerSheet" placeholder="Tablets per Sheet" value={formData.tabletsPerSheet} onChange={handleChange} />
        <input type="text" name="imageUrl" placeholder="Image URL" value={formData.imageUrl} onChange={handleChange} />
        <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
        <button type="submit">Add Product</button>
      </form>

      {success && <p className="success">✅ Product added successfully!</p>}
      {error && <p className="error">❌ {error}</p>}
    </div>
  );
};

export default AdminAddProduct;
