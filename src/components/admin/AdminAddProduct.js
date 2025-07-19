import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // for image upload
import api from '../utils/api'; // shared backend instance

import './AdminAddProduct.css';

const AdminAddProduct = ({ onProductAdded }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productId: '',
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

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setUploading(true);
    setImageUploaded(false);

    try {
      const form = new FormData();
      form.append('image', file);

      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=8d1c0c9cd82d32510f5735fe76025757`,
        form
      );

      setFormData((prev) => ({
        ...prev,
        imageUrl: res.data.data.url,
      }));

      setImageUploaded(true);
      setError('');
    } catch (err) {
      setError('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      setError('Please upload an image before submitting.');
      return;
    }

    try {
      await api.post('/api/admin/products', formData); // updated to use api.js
      setSuccess(true);
      setError('');
      setSelectedFile(null);
      setImageUploaded(false);

      if (onProductAdded) {
        onProductAdded();
      }

      setFormData({
        productId: '',
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
      <span
        className="close-button"
        onClick={() => navigate('/admin/dashboard')}
        title="Back to Dashboard"
      >
        ❌
      </span>

      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="productId"
          placeholder="Product ID"
          value={formData.productId}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="drugName"
          placeholder="Drug Name"
          value={formData.drugName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="brandName"
          placeholder="Brand Name"
          value={formData.brandName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="composition"
          placeholder="Composition"
          value={formData.composition}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="discount"
          placeholder="Discount (%)"
          value={formData.discount}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="tabletsPerSheet"
          placeholder="Tablets per Sheet"
          value={formData.tabletsPerSheet}
          onChange={handleChange}
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          required
        />

        <div className="custom-file-upload">
          <label htmlFor="imageUpload" className="upload-btn">
            📁 {uploading ? 'Uploading...' : 'Upload New Image'}
          </label>
          <input type="file" id="imageUpload" accept="image/*" onChange={handleFileChange} />
        </div>

        {imageUploaded && <p className="image-status">✅ Image uploaded successfully!</p>}
        {formData.imageUrl && (
          <a href={formData.imageUrl} target="_blank" rel="noreferrer">
            View Uploaded Image
          </a>
        )}

        <button type="submit" disabled={uploading}>Add Product</button>
      </form>

      {success && <p className="success">✅ Product added successfully!</p>}
      {error && <p className="error">❌ {error}</p>}
    </div>
  );
};

export default AdminAddProduct;
