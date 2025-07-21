import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // For imgbb image upload
import api from '../../utils/api'; // Shared backend instance
import './AdminEditProduct.css'; // Assuming you want to keep the styling

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
    imageUrl: '', // Changed from 'image' to 'imageUrl' to store the URL
  });
  const [selectedFile, setSelectedFile] = useState(null); // For the new file input
  const [uploading, setUploading] = useState(false); // To show upload status
  const [imageUploaded, setImageUploaded] = useState(false); // To confirm image upload
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
          imageUrl: data.imageUrl || '', // Set existing image URL
        });
        setImageUploaded(!!data.imageUrl); // If there's an existing URL, consider it "uploaded"
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setUploading(true);
    setImageUploaded(false); // Reset status on new file selection

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Upload image to imgbb
      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=8d1c0c9cd82d32510f5735fe76025757`, // Replace with your actual imgbb API key
        formData
      );

      setForm((prev) => ({
        ...prev,
        imageUrl: res.data.data.url, // Store the hosted image URL
      }));

      setImageUploaded(true);
      setError('');
    } catch (err) {
      console.error('Image upload error:', err);
      setError('❌ Image upload failed. Please try again.');
      setImageUploaded(false);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.imageUrl) {
      setError('Please upload an image or ensure an existing image is present.');
      return;
    }

    try {
      // Send form data, which now includes imageUrl
      await api.put(`/api/products/by-product-id/${productId}`, form);

      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Product update error:', err.response?.data?.error || err);
      setError(err.response?.data?.error || '❌ Failed to update product');
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

          <label htmlFor="imageUpload" className="upload-label">
            📁 {uploading ? 'Uploading...' : 'Upload New Image'}
          </label>
          <input type="file" id="imageUpload" accept="image/*" onChange={handleImageUpload} />

          {/* Display current or newly uploaded image */}
          {(form.imageUrl || selectedFile) && (
            <div className="image-preview-container">
              {selectedFile ? (
                <img src={URL.createObjectURL(selectedFile)} alt="New Preview" className="image-preview" />
              ) : (
                <img src={form.imageUrl} alt="Current Product" className="image-preview" />
              )}
              {imageUploaded && <p className="image-status">✅ Image updated!</p>}
              {uploading && <p className="image-status">⬆️ Uploading image...</p>}
            </div>
          )}

          <button type="submit" className="update-button" disabled={uploading}>
            💾 Update Product
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminEditProduct;