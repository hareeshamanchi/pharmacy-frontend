import React, { useEffect, useState } from 'react';
import './styles/Home.css';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api'; // ✅ Use API instance instead of axios

const homeCategories = [
  { name: 'Pain Relief', image: '/images/painrelief.jpg' },
  { name: 'Antibiotics', image: '/images/antibiotics.jpg' },
  { name: 'Allergy', image: '/images/allergy.jpeg' },
  { name: 'Diabetes', image: '/images/diabetes.jpg' },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/products') // ✅ Using baseURL from api.js
      .then(res => setProducts(res.data))
      .catch(err => console.error('Error fetching products', err));
  }, []);

  const handleAddToCart = (product) => {
    addToCart({
      productId: product.productId,
      name: product.drugName,
      price: product.price,
      discountPercent: product.discount,
      quantity: 1,
    });
  };

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Your Health, <span>Our Priority</span></h1>
          <p>Find medications and wellness products you need to live a healthier life.</p>
          <Link to="/shop" className="hero-button">Shop Now</Link>
        </div>
        <div className="hero-image">
          <img src="/assets/hero.png" alt="pharmacy" />
        </div>
      </section>

      <section className="categories">
        <h2>Shop by Category</h2>
        <div className="category-cards">
          {homeCategories.map((cat) => (
            <Link key={cat.name} to={`/products/${cat.name}`} className="category-card">
              <img src={cat.image} alt={cat.name} />
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-products">
        <h2>✨ Featured Products</h2>
        <div className="product-list">
          {products.slice(0, 8).map((product) => (
            <div
              key={product._id}
              className="product-card"
              onClick={() => handleProductClick(product.productId)}
            >
              <img src={product.imageUrl} alt={product.drugName} />
              <h3>{product.drugName}</h3>
              <p className="brand-name">Brand: {product.brandName}</p>
              <p className="price">
                ₹{product.price}{' '}
                {product.discount > 0 && (
                  <span className="discount">({product.discount}% OFF)</span>
                )}
              </p>
              <button
                className="add-to-cart"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation when clicking the button
                  handleAddToCart(product);
                }}
              >
                Add to Cart 🛒
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
