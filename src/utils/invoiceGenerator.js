import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import api from '../utils/api'; // your Axios instance

export const generateInvoicePDF = async (formData, cartItems, subtotal, discount, total, invoiceId) => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  const today = new Date().toLocaleDateString('en-GB');

  // Pharmacy Details
  const PHARMACY_NAME = 'VaidyaSthana Pharmacy & General Store';
  const PHARMACY_ADDRESS = '#56, Marpuri Street, Madanapalle, AP - 517325';
  const PHARMACY_CONTACT = '7207097501';
  const PHARMACY_EMAIL = 'vaidya@gmail.com';
  const PHARMACY_DL = 'DL/AP/2024/001';
  const PHARMACY_FSSAI = 'FSSAI23123456789';
  const PHARMACY_BANK_ACCOUNT = '312830758460094';
  const PHARMACY_IFSC = 'ICIC0003829';
  const PHARMACY_UPI_ID = '7207097501@axl'; // Your specific UPI ID

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TAX INVOICE', margin, 40);
  doc.setFontSize(16);
  doc.text(PHARMACY_NAME, margin + 90, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Address: ${PHARMACY_ADDRESS}`, margin, 60);
  doc.text(`Contact: ${PHARMACY_CONTACT} | Email: ${PHARMACY_EMAIL}`, margin, 75);
  doc.text(`Drug License: ${PHARMACY_DL} | FSSAI: ${PHARMACY_FSSAI}`, margin, 90);

  // Invoice info
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice ID: ${invoiceId}`, pageWidth - 200, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Invoice Date: ${today}`, pageWidth - 200, 75);
  doc.text(`Payment Due: ${today}`, pageWidth - 200, 90);
  doc.text(`Bank A/C: ${PHARMACY_BANK_ACCOUNT}`, pageWidth - 200, 105);
  doc.text(`IFSC: ${PHARMACY_IFSC}`, pageWidth - 200, 120);
  doc.text(`UPI: ${PHARMACY_UPI_ID}`, pageWidth - 200, 135);

  // Billing Info (Left side)
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', margin, 165);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${formData.name}`, margin, 180);
  doc.text(`Phone: ${formData.phone}`, margin, 195);

  // Use doc.splitTextToSize for address to handle long addresses
  const addressLines = doc.splitTextToSize(`Address: ${formData.address}`, (pageWidth / 2) - margin - 50); // Give it half page width roughly, minus margins
  doc.text(addressLines, margin, 210);

  // Determine the max Y position used by the billing info block on the left
  let currentYForBilling = 210 + (addressLines.length * doc.internal.getFontSize() * 1.2); // Add lines height + some padding
  doc.text(`Email: ${formData.email}`, margin, currentYForBilling);
  currentYForBilling += 15; // Space for next line

  // Google Maps Link for Location
  if (formData.location && formData.location.startsWith('http')) {
    const linkText = 'View Delivery Location on Map';
    const linkUrl = formData.location;
    doc.setTextColor(0, 0, 255);
    doc.textWithLink(linkText, margin, currentYForBilling, { url: linkUrl });
    doc.setTextColor(0, 0, 0);
    currentYForBilling += 10;
  } else if (formData.location) {
    doc.text(`Delivery Location: ${formData.location}`, margin, currentYForBilling);
    currentYForBilling += 10;
  }
  currentYForBilling += 10; // Extra padding below billing section


  // GST Details (Right side) - Adjust Y positions here
  const gstDetailsX = pageWidth - 250; // X position for GST details
  const gstStartY = 180; // Start Y for GST details

  // Calculate the lowest point of the 'Bill To' section
  // Add a buffer to ensure no overlap even with multiline address or link
  const minimumGstY = Math.max(gstStartY, currentYForBilling + 10); // Ensure GST starts well below Bill To

  doc.text('GSTIN: 27AUHPA739P1ZM', gstDetailsX, minimumGstY);
  doc.text('Place of Supply: Andhra Pradesh (27)', gstDetailsX, minimumGstY + 15);
  doc.text('Reverse Charge: Not Applicable', gstDetailsX, minimumGstY + 30);


  // Adjust table startY based on the lowest point used by either billing or GST details
  const tableStartY = Math.max(currentYForBilling + 20, minimumGstY + 45); // Ensure table starts below both sections


  // Table Rows
  const tableBody = cartItems.map((item, index) => {
    const price = parseFloat(item.price || 0);
    const discountPercent = parseFloat(item.discount || 0);
    const gst = 12; // Assuming fixed GST for now
    const discountedPrice = price - (price * discountPercent / 100);

    return [
      `${index + 1}`,
      item.productId || 'N/A',
      item.drugName,
      item.brandName || '---',
      '3004', // HSN - assuming static or retrieve from item
      '---', // Batch - assuming static or retrieve from item
      item.tabletsPerSheet ? `1x${item.tabletsPerSheet}` : '---',
      '12/25', // Expiry - assuming static or retrieve from item
      item.quantity || '1',
      `Rs. ${price.toFixed(2)}`,
      `${discountPercent}%`,
      `${gst}%`,
      `Rs. ${(discountedPrice * (item.quantity || 1)).toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [[
      'Sr', 'Product ID', 'PRODUCT', 'BRAND', 'HSN', 'BATCH', 'PACK',
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

  // === UPI Payment Link & QR Code Generation ===
  const upiPaymentLink = `upi://pay?pa=${PHARMACY_UPI_ID}&pn=${encodeURIComponent(PHARMACY_NAME)}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoiceId}`)}`;

  // QR Code
  const qrX = pageWidth - 150;
  const qrY = finalY + 10;
  const qrSize = 100; // Size of QR code

  try {
    const qrImage = await QRCode.toDataURL(upiPaymentLink, { width: qrSize }); // Encode the UPI link
    doc.addImage(qrImage, 'PNG', qrX, qrY, qrSize, qrSize);
  } catch (qrError) {
    console.error("❌ QR Code generation failed:", qrError);
    doc.text("QR Code Error", qrX, qrY + qrSize / 2); // Display error text if QR fails
  }

  // UPI PAYMENT LINK BELOW QR CODE
  const paymentLinkText = 'Click to Pay with UPI';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 255);

  const linkTextWidth = doc.getStringUnitWidth(paymentLinkText) * doc.internal.getFontSize();
  const linkX = qrX + (qrSize - linkTextWidth) / 2; // Center horizontally below QR
  const linkY = qrY + qrSize + 10; // Position below QR with padding

  doc.textWithLink(paymentLinkText, linkX, linkY, { url: upiPaymentLink });
  doc.setTextColor(0, 0, 0); // Reset text color

  // Total section positioning adjusted to accommodate new QR and link
  let totalSectionY = finalY + 80;
  if (linkY + 15 > totalSectionY) { // Assuming link text height is ~15
      totalSectionY = linkY + 15;
  }

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, margin, totalSectionY);
  doc.text(`Discount: Rs. ${discount.toFixed(2)}`, margin, totalSectionY + 15);
  doc.text(`Total: Rs. ${total.toFixed(2)}`, margin, totalSectionY + 30);


  // Save PDF locally
  doc.save(`${formData.name}_Invoice_${invoiceId}.pdf`);

  // Convert PDF to blob
  const pdfBlob = doc.output('blob');

  // Upload and email to backend
  const form = new FormData();
  form.append('file', pdfBlob, `${formData.name}_Invoice_${invoiceId}.pdf`);
  form.append('customerEmail', formData.email);
  form.append('invoiceId', invoiceId);

  try {
    await api.post('/api/send-invoice', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('✅ Invoice emailed successfully.');
  } catch (error) {
    console.error('❌ Failed to email invoice:', error.response?.data || error.message);
  }
};