import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import '../pages/styles/Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error('Error fetching shop products:', err));
  }, []);

  return (
    <div className="shop-container">
      <h1 className="shop-heading">✨ All Products</h1>
      <div className="shop-grid">
        {products.map((product) => {
          const discountedPrice = (product.price - (product.price * product.discount / 100)).toFixed(2);

          return (
            <div key={product._id} className="shop-card">
              <Link to={`/product/${product.productId}`}>
                <img src={product.imageUrl} alt={product.drugName} className="shop-image" />
              </Link>
              <h3 className="shop-drug-name">{product.drugName}</h3>
              <p className="shop-brand"><strong>Brand:</strong> {product.brandName}</p>
              <p className="shop-composition"><strong>Composition:</strong> {product.composition}</p>
              <div className="shop-price-wrapper">
                <span className="original-price">₹{product.price}</span>
                {product.discount > 0 && (
                  <>
                    <span className="discounted-price"> ₹{discountedPrice}</span>
                    <span className="discount-percent"> ({product.discount}% OFF)</span>
                  </>
                )}
              </div>
              <button
                onClick={() => addToCart({
                  productId: product.productId,
                  name: product.drugName,
                  price: product.price,
                  discountPercent: product.discount,
                  quantity: 1,
                })}
                className="shop-add-btn"
              >
                Add to Cart 🛒
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Shop;
