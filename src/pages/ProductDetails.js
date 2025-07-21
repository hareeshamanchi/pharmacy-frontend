import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import './styles/ProductDetails.css'; // Ensure your updated CSS is linked
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    api
      .get(`/api/products/${productId}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error('Fetch failed:', err));
  }, [productId]);

  if (!product) return <div className="loading">Loading...</div>; // Consider adding a spinner here

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

  // Removed the complex getSection logic for a simpler display.
  // If your description comes with newlines, we'll replace them with <br/>
  const formatDescription = (text) => {
    if (!text) return 'No detailed description available.';
    // Replace double asterisks with strong tags (basic markdown for bold)
    // and newlines with <br /> tags
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return formattedText.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < formattedText.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
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
            <li><strong>Composition:</strong> {product.composition || 'N/A'}</li>
            <li><strong>Category:</strong> {product.category || 'N/A'}</li>
            <li><strong>Tablets per Sheet:</strong> {product.tabletsPerSheet || 'N/A'}</li>
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
        <h2>Product Details</h2> {/* Changed from "Detailed Description" to "Product Details" */}

        <div className="desc-section">
          {/* Display the entire description here, formatted simply */}
          <p>{formatDescription(product.description)}</p>
          {/* Removed individual getSection calls */}
        </div>

        {/* Removed other desc-section divs if you want a single block description */}
        {/* If you want to keep them but simply, you'd structure your description string:
        
        <div className="desc-section">
          <h3>Uses</h3>
          <p>{product.description.split('**Uses:**')[1]?.split('**')[0]?.trim() || 'No uses listed.'}</p>
        </div>
        
        This would still rely on **Uses:** in the string.
        The `formatDescription` above handles simple bolding and newlines if your backend sends it that way.
        */}

      </motion.div>
    </motion.div>
  );
};

export default ProductDetails;