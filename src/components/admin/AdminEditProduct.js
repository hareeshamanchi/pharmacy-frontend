import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';// ✅ updated import
import './AdminEditProduct.css';

const AdminEditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    drugName: '',
    brandName: '',
    description: '',
    price: '',
    discount: '',
    tabletsPerSheet: '',
    category: '',
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${productId}`);
        setProduct(data);
        setForm({
          drugName: data.drugName || '',
          brandName: data.brandName || '',
          description: data.description || '',
          price: data.price || '',
          discount: data.discount || '',
          tabletsPerSheet: data.tabletsPerSheet || '',
          category: data.category || '',
          image: null,
        });
      } catch (err) {
        console.error(err);
        setError('❌ Failed to load product data');
      }
    };
    fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          formData.append(key, value);
        }
      });

      await api.put(`/api/products/by-product-id/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError('❌ Failed to update product');
    }
  };

  return (
    <div className="edit-product-container">
      <h2>Edit Product</h2>
      {error && <div className="error-message">{error}</div>}

      {product && (
        <form className="edit-form" onSubmit={handleSubmit}>
          <label>Drug Name:</label>
          <input
            type="text"
            name="drugName"
            value={form.drugName}
            onChange={handleChange}
            required
          />

          <label>Brand Name:</label>
          <input
            type="text"
            name="brandName"
            value={form.brandName}
            onChange={handleChange}
            required
          />

          <label>Description:</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />

          <label>Price (₹):</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />

          <label>Discount (%):</label>
          <input
            type="number"
            name="discount"
            value={form.discount}
            onChange={handleChange}
          />

          <label>Tablets Per Sheet:</label>
          <input
            type="number"
            name="tabletsPerSheet"
            value={form.tabletsPerSheet}
            onChange={handleChange}
          />

          <label>Category:</label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          />

          <label>📁 Upload New Image:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && <img src={preview} alt="Preview" className="image-preview" />}

          <button type="submit" className="update-button">💾 Update Product</button>
        </form>
      )}
    </div>
  );
};

export default AdminEditProduct;
