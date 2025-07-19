import React, { useEffect, useState } from 'react';
import './styles/CategoryProducts.css';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const CategoryProducts = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/products/category/${category}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('Error loading category products', err));
  }, [category]);

  const handleAddToCart = (product) => {
    addToCart({
      productId: product.productId,
      name: product.drugName,
      price: product.price,
      discountPercent: product.discount,
      quantity: 1,
    });
  };

  return (
    <div className="category-products">
      <h2>{category} Products</h2>

      {products.length === 0 ? (
        <p className="no-products">No products found in this category.</p>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card-wrapper">
              <Link to={`/product/${product.productId}`} className="product-card-link">
                <div className="product-card">
                  <img src={product.imageUrl} alt={product.drugName} />
                  <h3>{product.drugName}</h3>
                  <p className="brand">Brand: {product.brandName}</p>
                  <p className="price">
                    ₹{product.price}&nbsp;
                    {product.discount > 0 && (
                      <span className="discount">({product.discount}% OFF)</span>
                    )}
                  </p>
                </div>
              </Link>
              <button onClick={() => handleAddToCart(product)} className="add-cart-btn">
                Add to Cart 🛒
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryProducts;
