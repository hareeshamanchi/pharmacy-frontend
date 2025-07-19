// src/components/admin/AdminEditProduct.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminEditProduct.css';
import { useParams, useNavigate } from 'react-router-dom';

const AdminEditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    drugName: '',
    brandName: '',
    composition: '',
    price: '',
    discount: '',
    description: '',
    tabletsPerSheet: '',
    category: '',
    imageUrl: '',
  });

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/admin/products/${productId}`);
        setFormData(res.data);
      } catch (err) {
        setError('Failed to load product data.');
      }
    };

    fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setUploading(true);
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
      setError('');
    } catch (err) {
      setError('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/admin/products/${productId}`, formData);
      setSuccess(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed.');
      setSuccess(false);
    }
  };

  return (
    <div className="admin-edit-product">
      <div className="edit-header">
        <h2>Edit Product</h2>
        <button className="back-btn" onClick={() => navigate(-1)} title="Go back">
          ❌
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-edit-form">
        <input type="text" name="drugName" placeholder="Drug Name" value={formData.drugName} onChange={handleChange} />
        <input type="text" name="brandName" placeholder="Brand Name" value={formData.brandName} onChange={handleChange} />
        <input type="text" name="composition" placeholder="Composition" value={formData.composition} onChange={handleChange} />
        <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} />
        <input type="number" name="discount" placeholder="Discount (%)" value={formData.discount} onChange={handleChange} />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
        <input type="number" name="tabletsPerSheet" placeholder="Tablets per Sheet" value={formData.tabletsPerSheet} onChange={handleChange} />
        <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} />

        <div className="custom-file-upload">
  <label htmlFor="imageUpload" className="upload-btn">
    📁 {uploading ? 'Uploading...' : 'Upload New Image'}
  </label>
  <input type="file" id="imageUpload" accept="image/*" onChange={handleFileChange} />
</div>

        {/* ✅ Image Preview */}
        {formData.imageUrl && (
          <div className="uploaded-image-preview">
            <p>✅ Current Image:</p>
            <a href={formData.imageUrl} target="_blank" rel="noreferrer">
              <img src={formData.imageUrl} alt="Uploaded" className="thumb" />
            </a>
          </div>
        )}

        <button type="submit" disabled={uploading}>Update Product</button>
      </form>

      {success && <p className="success-msg">✅ Product updated successfully!</p>}
      {error && <p className="error-msg">❌ {error}</p>}
    </div>
  );
};

export default AdminEditProduct;
