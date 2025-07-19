import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api'; // ✅ updated
import { useCart } from '../context/CartContext';
import './styles/ProductDetails.css';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    api
      .get(`/api/products/${productId}`) // ✅ updated
      .then((res) => setProduct(res.data))
      .catch((err) => console.error('Fetch failed:', err));
  }, [productId]);

  if (!product) return <div className="loading">Loading...</div>;

  const discountedPrice = product.price - (product.price * product.discount) / 100;

  const handleAddToCart = () => {
    addToCart({
      productId: product.productId,
      name: product.drugName,
      price: product.price,
      discountPercent: product.discount,
      quantity: 1,
    });
  };

  const getSection = (key) => {
    const text = product.description;
    const start = text.indexOf(`**${key}:**`);
    if (start === -1) return '';
    const rest = text.slice(start + key.length + 4);
    const nextKeyMatch = rest.match(/\*\*(.+?):\*\*/);
    const end = nextKeyMatch ? rest.indexOf(nextKeyMatch[0]) : rest.length;
    return rest.slice(0, end).trim();
  };

  return (
    <motion.div
      className="product-page-3d"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="product-card-3d-container">
        <Tilt
          className="product-image-tilt"
          tiltMaxAngleX={15}
          tiltMaxAngleY={15}
          glareEnable={true}
          glareMaxOpacity={0.4}
          scale={1.05}
        >
          <img src={product.imageUrl} alt={product.drugName} className="product-img-3d" />
        </Tilt>

        <motion.div
          className="product-info-box"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1>{product.drugName}</h1>
          <h4 className="brand">Brand: {product.brandName}</h4>

          <motion.div className="discount-tag-glow" whileHover={{ scale: 1.1, rotate: 3 }}>
            {product.discount}% OFF
          </motion.div>

          <div className="price-box">
            <span className="strike">₹{product.price}</span>
            <span className="highlight">₹{discountedPrice.toFixed(2)}</span>
          </div>

          <ul className="meta-list">
            <li><strong>Composition:</strong> {product.composition}</li>
            <li><strong>Category:</strong> {product.category}</li>
            <li><strong>Tablets per Sheet:</strong> {product.tabletsPerSheet}</li>
          </ul>

          <motion.button
            className="cart-btn-3d"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleAddToCart}
          >
            🛒 Add to Cart
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        className="description-box-3d"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2>Detailed Description</h2>

        <div className="desc-section">
          <h3>Overview</h3>
          <p>{getSection('Overview')}</p>
        </div>

        <div className="desc-section">
          <h3>Chemical Composition</h3>
          <p>{getSection('Chemical Composition')}</p>
        </div>

        <div className="desc-section">
          <h3>Uses</h3>
          <ul>
            {getSection('Uses')
              .split(' - ')
              .filter(Boolean)
              .map((line, i) => <li key={i}>{line.trim()}</li>)}
          </ul>
        </div>

        <div className="desc-section">
          <h3>Mechanism of Action</h3>
          <p>{getSection('Mechanism of Action')}</p>
        </div>

        <div className="desc-section">
          <h3>Storage</h3>
          <ul>
            {getSection('Storage')
              .split(' - ')
              .filter(Boolean)
              .map((line, i) => <li key={i}>{line.trim()}</li>)}
          </ul>
        </div>

        <div className="desc-section">
          <h3>Precautions</h3>
          <p>{getSection('Precautions')}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductDetails;
