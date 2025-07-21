import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import api from '../utils/api'; // your Axios instance

export const generateInvoicePDF = async (formData, cartItems, subtotal, discount, total, invoiceId) => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  const today = new Date().toLocaleDateString('en-GB');

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TAX INVOICE', margin, 40);
  doc.setFontSize(16);
  doc.text('VaidyaSthana Pharmacy & General Store', margin + 90, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Address: #56, Marpuri Street, Madanapalle, AP - 517325', margin, 60);
  doc.text('Contact: 7207097501  |  Email: vaidya@gmail.com', margin, 75);
  doc.text('Drug License: DL/AP/2024/001  |  FSSAI: FSSAI23123456789', margin, 90);

  // Invoice info
  doc.setFont('helvetica', 'bold'); // Set font to bold
  doc.text(`Invoice ID: ${invoiceId}`, pageWidth - 200, 60);
  doc.setFont('helvetica', 'normal'); // Reset font to normal for subsequent text
  doc.setFontSize(10); // Reset font size if it was changed by bold
  doc.text(`Invoice Date: ${today}`, pageWidth - 200, 75);
  doc.text(`Payment Due: ${today}`, pageWidth - 200, 90);
  doc.text(`Bank A/C: 312830758460094`, pageWidth - 200, 105);
  doc.text(`IFSC: ICIC0003829`, pageWidth - 200, 120);
  doc.text(`UPI: 7207097501@axl`, pageWidth - 200, 135); // Displayed UPI ID on the invoice

  // Billing Info
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', margin, 165);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${formData.name}`, margin, 180);
  doc.text(`Phone: ${formData.phone}`, margin, 195);
  doc.text(`Address: ${formData.address}`, margin, 210);
  doc.text(`Email: ${formData.email}`, margin, 225); // Ensure email is passed in formData from FloatingOrderForm

  // Google Maps Link for Location
  let currentYForBilling = 225; // Keep track of current Y position for billing info
  if (formData.location && formData.location.startsWith('http')) {
    currentYForBilling += 15; // Space for the link
    const linkText = 'View Delivery Location on Map'; // More descriptive text
    const linkUrl = formData.location;

    doc.setTextColor(0, 0, 255); // Blue color for link
    doc.textWithLink(linkText, margin, currentYForBilling, { url: linkUrl });
    doc.setTextColor(0, 0, 0); // Reset color to black

    currentYForBilling += 10; // Extra space below the link
  } else if (formData.location) {
    currentYForBilling += 15; // Space for the text
    doc.text(`Delivery Location: ${formData.location}`, margin, currentYForBilling);
    currentYForBilling += 10; // Extra space
  }

  doc.text('GSTIN: 27AUHPA739P1ZM', pageWidth - 250, 180);
  doc.text('Place of Supply: Andhra Pradesh (27)', pageWidth - 250, 195);
  doc.text('Reverse Charge: Not Applicable', pageWidth - 250, 210);

  // Adjust table startY based on new elements
  const tableStartY = Math.max(240, currentYForBilling + 20); // Ensure table starts below billing info

  // Table Rows
  const tableBody = cartItems.map((item, index) => {
    const price = parseFloat(item.price || 0);
    const discountPercent = parseFloat(item.discountPercent || 0);
    const gst = 12;
    const discountedPrice = price - (price * discountPercent / 100);

    return [
      `${index + 1}`,
      item.productId || 'N/A',
      item.name,
      item.company || '---',
      item.hsn || '3004',
      item.batch || '---',
      item.pack || '1x10',
      item.expiry || '12/25',
      item.quantity || '1',
      `Rs. ${price.toFixed(2)}`,
      `${discountPercent}%`,
      `${gst}%`,
      `Rs. ${discountedPrice.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [[
      'Sr', 'Product ID', 'PRODUCT', 'COMPANY', 'HSN', 'BATCH', 'PACK',
      'EXPIRY', 'QTY', 'MRP', 'DISC', 'GST', 'AMOUNT'
    ]],
    body: tableBody,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [0, 128, 0], textColor: 255, halign: 'center' },
    margin: { left: margin, right: margin },
  });

  let finalY = doc.lastAutoTable.finalY + 10;

  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL PRODUCTS: ${cartItems.length}`, margin, finalY + 10);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Goods once sold shall not be taken back', margin, finalY + 25);
  doc.text('2. All disputes subject to Madanapalle jurisdiction', margin, finalY + 38);
  doc.text('3. Payment modes accepted here', margin, finalY + 51);

  // QR Code
  const qrText = `Invoice ID: ${invoiceId}\nName: ${formData.name}\nPhone: ${formData.phone}\nTotal: Rs.${total.toFixed(2)}\nUPI: 7207097501@axl`; // Added UPI ID to QR text for payment ease
  const qrImage = await QRCode.toDataURL(qrText);
  const qrX = pageWidth - 150;
  const qrY = finalY + 10;
  doc.addImage(qrImage, 'PNG', qrX, qrY, 100, 100);


  // UPI PAYMENT LINK BELOW QR CODE
  const upiIdForPayment = '7207097501@axl'; // Explicitly set your UPI ID here
  const upiPaymentLink = `upi://pay?pa=${upiIdForPayment}&pn=${encodeURIComponent(formData.name)}&am=${total.toFixed(2)}&cu=INR`;
  const paymentLinkText = 'Click to Pay with UPI';

  doc.setFont('helvetica', 'normal'); // Ensure font is normal for the link text
  doc.setFontSize(9); // Smaller font size for the link
  doc.setTextColor(0, 0, 255); // Blue color for the link

  const linkTextWidth = doc.getStringUnitWidth(paymentLinkText) * doc.internal.getFontSize();
  const linkX = qrX + (100 - linkTextWidth) / 2; // Center horizontally below QR
  const linkY = qrY + 100 + 10; // 100px (QR height) + 10px (padding)

  doc.textWithLink(paymentLinkText, linkX, linkY, { url: upiPaymentLink });
  doc.setTextColor(0, 0, 0); // Reset text color


  // Total section positioning adjusted to accommodate new QR and link
  let totalSectionY = finalY + 80;
  if (linkY + 15 > totalSectionY) { // Assuming link text height is ~15
      totalSectionY = linkY + 15;
  }

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10); // Standard font size for totals
  doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, margin, totalSectionY);
  doc.text(`Discount: Rs. ${discount.toFixed(2)}`, margin, totalSectionY + 15);
  doc.text(`Total: Rs. ${total.toFixed(2)}`, margin, totalSectionY + 30);


  // Save PDF locally
  doc.save(`${formData.name}_Invoice.pdf`);

  // Convert PDF to blob
  const pdfBlob = doc.output('blob');

  // Upload and email to backend
  const form = new FormData();
  form.append('file', pdfBlob, `${formData.name}_Invoice.pdf`);
  form.append('customerEmail', formData.email);
  form.append('invoiceId', invoiceId);

  try {
    await api.post('/send-email', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('✅ Invoice emailed successfully.');
  } catch (error) {
    console.error('❌ Failed to email invoice:', error.response?.data || error.message);
  }
};