import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import './styles/CategoryProducts.css'; // Ensure the updated CSS is linked

const CategoryProducts = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    api
      .get(`/api/products/category/${category}`)
      .then((res) => {
        const productsWithCalculatedPrice = res.data.map(product => {
          const discountAmount = product.price * (product.discount / 100);
          const currentPrice = product.price - discountAmount;
          return { ...product, currentPrice: currentPrice.toFixed(2) }; // Format to 2 decimal places
        });
        setProducts(productsWithCalculatedPrice);
      })
      .catch((err) => console.error('Error loading category products', err));
  }, [category]);

  const handleAddToCart = (product) => {
    addToCart({
      productId: product.productId,
      name: product.drugName,
      price: parseFloat(product.currentPrice), // Use the calculated currentPrice for the cart
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
            // Removed product-card-wrapper, product-card is now the main grid item
            <div key={product._id} className="product-card"> 
              {/* Link now wraps only the visual content, excluding the button */}
              <Link to={`/product/${product.productId}`} className="product-card-link-content">
                <img src={product.imageUrl} alt={product.drugName} />
                <h3>{product.drugName}</h3>
                <p className="brand">Brand: {product.brandName}</p>
                
                {/* Composition Section - Assuming these fields exist in your product data */}
                {product.composition && (
                  <p className="composition">
                    Composition: {product.composition}
                    {product.chemicalFormula && ( // Conditionally render chemical formula
                      <span className="chemical-formula"> ({product.chemicalFormula})</span>
                    )}
                  </p>
                )}

                {/* Price Section */}
                <div className="price-section">
                  {product.discount > 0 && (
                    <span className="original-price">₹{product.price.toFixed(2)}</span>
                  )}
                  <span className="current-price">₹{product.currentPrice}</span>
                  {product.discount > 0 && (
                    <span className="discount">({product.discount}% OFF)</span>
                  )}
                </div>
              </Link> {/* End of Link component */}

              {/* Add to Cart Button - Now directly inside product-card */}
              <button onClick={() => handleAddToCart(product)} className="add-cart-btn">
                ADD TO CART 🛒 {/* Using Unicode emoji for the cart icon */}
              </button>
            </div> // End of product-card
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryProducts;