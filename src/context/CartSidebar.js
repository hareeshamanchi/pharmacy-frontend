// src/context/CartSidebar.js
import React, { useState } from 'react';
import '../pages/styles/CartSidebar.css';
import { useCart } from './CartContext';
// Import generateInvoicePDF function
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
    email: '', // Ensure email is part of formData if you're using it
  });

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = cartItems.reduce(
    (acc, item) => acc + ((item.price * item.discountPercent) / 100) * item.quantity,
    0
  );
  const total = subtotal - discount;

  const handleSubmit = () => {
    const { name, phone, address, location, email } = formData; // Destructure email as well

    if (!name || !phone || !address) {
      alert('Please fill all required fields (Name, Phone, Address)');
      return;
    }

    // Generate Invoice ID here, so it's available for both WhatsApp and PDF
    const invoiceId = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    // You can remove the upiLink if it's not needed for any other purpose anymore.
    // const upiLink = `upi://pay?pa=7207097501@axl&pn=${encodeURIComponent(name)}&am=${total.toFixed(2)}&cu=INR`;


    const whatsappMessage = `🧾 *VaidyaSthana Order Details*\n\n` +
                            `*Invoice ID:* ${invoiceId}\n\n` + // ✨ Added Invoice ID
                            `👤 Name: ${name}\n` +
                            `📞 Phone: ${phone}\n` +
                            `🏠 Address: ${address}\n` +
                            `${location ? `📍 Location: ${location}\n` : ''}` +
                            `\n🛍️ *Items:*\n` +
                            `${cartItems
                              .map(
                                (item, i) =>
                                  `${i + 1}. ${item.name} x${item.quantity} = ₹${(
                                    item.price - (item.price * item.discountPercent) / 100
                                  ).toFixed(2)}`
                              )
                              .join('\n')}\n\n` +
                            `🧮 Subtotal: ₹${subtotal.toFixed(2)}\n` +
                            `💸 Discount: ₹${discount.toFixed(2)}\n` +
                            `🧾 *Total: ₹${total.toFixed(2)}*`; // ✨ Removed "Pay Now" link


    const phoneNumber = '919396951724'; // The WhatsApp recipient number
    const encoded = encodeURIComponent(whatsappMessage);

    // Generate PDF with QRS - Pass invoiceId to the function
    generateInvoicePDF(formData, cartItems, subtotal, discount, total, invoiceId); // ✨ Pass invoiceId

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

export default CartSidebar;