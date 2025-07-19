import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Fuse from 'fuse.js';
import { useCart } from '../context/CartContext';
import './styles/SearchResults.css';

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);

  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get('q');
  const query = queryParam
    ? queryParam.toLowerCase()
        .replace(/\b\d+(mg|ml)?\b/gi, '')
        .replace(/[^a-z]/gi, '')
        .trim()
    : '';
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        setAllProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!query || allProducts.length === 0) return;
    const fuse = new Fuse(allProducts, {
      keys: ['drugName', 'brandName'],
      threshold: 0.4,
      minMatchCharLength: 2,
    });
    const matched = fuse.search(query).map(m => m.item);
    setResults(matched);
    setLoading(false);
  }, [query, allProducts]);

  return (
    <div className="search-results">
      <h2>Search Results for: <span>{queryParam}</span></h2>

      {loading ? (
        <p>Loading...</p>
      ) : results.length > 0 ? (
        <div className="results-grid">
          {results.map((product) => (
            <div className="product-card" key={product._id}>
              <Link to={`/product/${product.productId}`}>
                <img src={product.imageUrl} alt={product.drugName} />
                <h3>{product.drugName}</h3>
                <p>Brand: {product.brandName}</p>
                <p>Rs. {product.price}</p>
              </Link>
              <button onClick={() => addToCart(product)}>🛒 Add to Cart</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-results">No matching products found.</p>
      )}
    </div>
  );
};

export default SearchResults;
