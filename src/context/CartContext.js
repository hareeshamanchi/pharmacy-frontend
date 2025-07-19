import React, { createContext, useContext, useEffect, useState } from 'react';

// Create Context
const CartContext = createContext();

// Custom Hook
export const useCart = () => useContext(CartContext);

// Provider
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('pharma_cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Save to localStorage on cart change
  useEffect(() => {
    localStorage.setItem('pharma_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    const existing = cartItems.find((item) => item.productId === product.productId);

    if (existing) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }

    // Optional Toast
    const event = new CustomEvent('show-toast', {
      detail: { message: `${product.name} added to cart`, type: 'success' },
    });
    window.dispatchEvent(event);
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setCartItems([]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const closeCart = () => setIsCartOpen(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = cartItems.reduce(
    (sum, item) => sum + ((item.discountPercent || 0) / 100) * item.price * item.quantity,
    0
  );
  const total = subtotal - discount;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isCartOpen,
        toggleCart,
        closeCart,
        subtotal,
        discount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
