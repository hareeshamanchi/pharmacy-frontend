// src/components/Categories.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './styles/Categories.css';

const defaultCategoryImages = {
  'Pain Relief': '/images/painrelief.jpg',
  'Antibiotics': '/images/antibiotics.jpg',
  'Allergy': '/images/allergy.jpeg',
  'Diabetes': '/images/diabetes.jpg',
  'Blood Pressure': '/images/bloodpressure.jpg',
  'Digestive': '/images/digestive.jpg',
};

const Categories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/api/products')
      .then((res) => {
        const products = res.data;
        const uniqueCategories = Array.from(
          new Set(products.map((p) => p.category))
        );

        const categoryData = uniqueCategories.map((cat) => ({
          name: cat,
          image: defaultCategoryImages[cat] || '/images/default-category.jpg',
        }));

        setCategories(categoryData);
      })
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  return (
    <div className="categories-page">
      <h1>🧬 Shop by Categories</h1>
      <div className="category-grid">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            to={`/products/${cat.name}`}
            className="category-card"
          >
            <img src={cat.image} alt={cat.name} />
            <h3>{cat.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;