// src/context/CartSidebar.js
import React, { useState } from 'react';
import '../pages/styles/CartSidebar.css';
import { useCart } from './CartContext';
import { generateInvoicePDF } from '../utils/invoiceGenerator';
import FloatingOrderForm from '../components/FloatingOrderForm';

const CartSidebar = () => {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
  } = useCart();

  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    location: '',
  });

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = cartItems.reduce(
    (acc, item) => acc + ((item.price * item.discountPercent) / 100) * item.quantity,
    0
  );
  const total = subtotal - discount;

  const handleSubmit = () => {
    const { name, phone, address, location } = formData;

    if (!name || !phone || !address) {
      alert('Please fill all fields');
      return;
    }

    const upiLink = `upi://pay?pa=7207097501@axl&pn=${encodeURIComponent(name)}&am=${total.toFixed(2)}&cu=INR`;

    const whatsappMessage = `🧾 *VaidyaSthana Order Details*\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n🏠 Address: ${address}${
      location ? `\n📍 Location: ${location}` : ''
    }\n\n🛍️ *Items:*\n${cartItems
      .map(
        (item, i) =>
          `${i + 1}. ${item.name} x${item.quantity} = ₹${(
            item.price - (item.price * item.discountPercent) / 100
          ).toFixed(2)}`
      )
      .join('\n')}\n\n🧮 Subtotal: ₹${subtotal.toFixed(2)}\n💸 Discount: ₹${discount.toFixed(
      2
    )}\n🧾 Total: ₹${total.toFixed(2)}\n\n💳 *Pay Now:* ${upiLink}`;

    const phoneNumber = '919396951724';
    const encoded = encodeURIComponent(whatsappMessage);

    // Generate PDF with QRS
    generateInvoicePDF(formData, cartItems, subtotal, discount, total);

    // Open WhatsApp
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');

    setFormVisible(false);
    closeCart();
  };

  return (
    <>
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>🛒 Your Cart</h3>
          <button onClick={closeCart}>❌</button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <p className="empty-msg">Your cart is empty</p>
          ) : (
            cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <div>
                  <h4>{item.name}</h4>
                  <p>₹{item.price} - {item.discountPercent}% OFF</p>
                  <p>Qty: {item.quantity}</p>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.productId)}>🗑️</button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="summary">
              <p style={{ color: '#2166FF' }}>Subtotal: ₹{subtotal.toFixed(2)}</p>
              <p style={{ color: '#E63946' }}>Discount: ₹{discount.toFixed(2)}</p>
              <h4 style={{ color: '#007f5f' }}>Total: ₹{total.toFixed(2)}</h4>
            </div>
            <button className="whatsapp-checkout" onClick={() => setFormVisible(true)}>
              Place Order 📝
            </button>
          </div>
        )}
      </div>

      {formVisible && (
        <FloatingOrderForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setFormVisible(false)}
        />
      )}
    </>
  );
};

export default CartSidebar