import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import api from '../utils/api'; // your Axios instance

export const generateInvoicePDF = async (formData, cartItems, subtotal, discount, total, invoiceId) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const lineHeight = 12; // Standard line height for text elements

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
    const PHARMACY_UPI_ID = '7207097501@axl';

    // --- Common Header & Initial Content Drawing (Only for First Page) ---
    const drawInitialPageContent = () => {
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

        doc.setFont('helvetica', 'bold');
        doc.text(`Invoice ID: ${invoiceId}`, pageWidth - 200, 60);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Invoice Date: ${today}`, pageWidth - 200, 75);
        doc.text(`Payment Due: ${today}`, pageWidth - 200, 90);
        doc.text(`Bank A/C: ${PHARMACY_BANK_ACCOUNT}`, pageWidth - 200, 105);
        doc.text(`IFSC: ${PHARMACY_IFSC}`, pageWidth - 200, 120);
        doc.text(`UPI: ${PHARMACY_UPI_ID}`, pageWidth - 200, 135);

        doc.setFont('helvetica', 'bold');
        doc.text('Bill To:', margin, 165);
        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${formData.name}`, margin, 180);
        doc.text(`Phone: ${formData.phone}`, margin, 195);

        const addressLines = doc.splitTextToSize(`Address: ${formData.address}`, (pageWidth / 2) - margin - 50);
        doc.text(addressLines, margin, 210);

        let currentYForBilling = 210 + (addressLines.length * doc.internal.getFontSize() * 1.2);
        doc.text(`Email: ${formData.email}`, margin, currentYForBilling);
        currentYForBilling += 15;

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
        currentYForBilling += 10;

        const gstDetailsX = pageWidth - 250;
        const gstStartY = 180;
        const minimumGstY = Math.max(gstStartY, currentYForBilling);

        doc.setFont('helvetica', 'normal');
        doc.text('GSTIN: 27AUHPA739P1ZM', gstDetailsX, minimumGstY);
        doc.text('Place of Supply: Andhra Pradesh (27)', gstDetailsX, minimumGstY + 15);
        doc.text('Reverse Charge: Not Applicable', gstDetailsX, minimumGstY + 30);

        return Math.max(currentYForBilling + 20, minimumGstY + 45); // Returns startY for the table
    };

    // --- Table Rows data ---
    const tableBody = cartItems.map((item, index) => {
        const price = parseFloat(item.price || 0);
        const discountPercent = parseFloat(item.discountPercent || 0);
        const gst = 12; // Assuming fixed GST for now
        const discountedPrice = price - (price * discountPercent / 100);

        return [
            `${index + 1}`,
            item.productId || 'N/A',
            item.name,
            item.brandName || '---',
            '3004', // HSN
            '---', // Batch
            item.tabletsPerSheet ? `1x${item.tabletsPerSheet}` : '---',
            '12/25', // Expiry
            item.quantity || '1',
            `Rs. ${price.toFixed(2)}`,
            `${discountPercent}%`,
            `${gst}%`,
            `Rs. ${(discountedPrice * (item.quantity || 1)).toFixed(2)}`
        ];
    });

    // Determine initial Y for the table
    const tableStartY = drawInitialPageContent();


    // --- Helper to draw consistent header/footer on every page (optional, for branding etc.) ---
    const drawPageNumber = (pageNum) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
    };

    // --- AutoTable Configuration ---
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
        // IMPORTANT: didDrawPage hook is for content that repeats on EVERY page
        didDrawPage: (data) => {
            // Draw header on subsequent pages only
            if (data.pageNumber > 1) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.text('TAX INVOICE', margin, 40);
                doc.setFontSize(16);
                doc.text(PHARMACY_NAME, margin + 90, 40);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(`Invoice ID: ${invoiceId}`, pageWidth - 200, 60);
                doc.text(`Date: ${today}`, pageWidth - 200, 75); // Concise date
            }
            // Draw page number on every page
            drawPageNumber(data.pageNumber);
        },
        // Hook to draw content *after* the table has completely finished drawing (on the final page)
        didParseCell: (data) => {
             // You can use this for specific cell styling before drawing
        },
        didDrawCell: (data) => {
             // You can use this for drawing borders or other things per cell
        }
    });

    // --- Content to be drawn ONLY ON THE FINAL PAGE after the table ---
    let finalYAfterTable = doc.lastAutoTable.finalY + 10; // Get the Y position after the last row of the table

    // Ensure there's enough space for the footer on the last page.
    // If the table ends too close to the bottom, autoTable would add a new page.
    // So, finalYAfterTable should usually be well within page bounds.

    // Define starting Y for terms & conditions on the left
    let termsStartY = finalYAfterTable + 10;

    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL PRODUCTS: ${cartItems.length}`, margin, termsStartY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('1. Goods once sold shall not be taken back', margin, termsStartY + lineHeight);
    doc.text('2. All disputes subject to Madanapalle jurisdiction', margin, termsStartY + 2 * lineHeight);
    doc.text('3. Payment modes accepted here', margin, termsStartY + 3 * lineHeight);
    let bottomOfTerms = termsStartY + 3 * lineHeight;


    // UPI Payment Link & QR Code Generation (Right side)
    const upiPaymentLink = `upi://pay?pa=${PHARMACY_UPI_ID}&pn=${encodeURIComponent(PHARMACY_NAME)}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoiceId}`)}`;

    const qrX = pageWidth - 150;
    const qrSize = 100; // Size of QR code

    // QR code should start below the table, on the right, aligning with or below terms
    let qrStartY = finalYAfterTable + 10; // Align with the start of terms
    if (qrStartY < termsStartY) { // If terms start lower, align QR start with terms start
        qrStartY = termsStartY;
    }


    let qrAndLinkBottomY = qrStartY; // Initialize Y for bottom of QR and link

    try {
        const qrImage = await QRCode.toDataURL(upiPaymentLink, { width: qrSize });
        doc.addImage(qrImage, 'PNG', qrX, qrStartY, qrSize, qrSize);
        qrAndLinkBottomY = qrStartY + qrSize; // Update Y after QR code
    } catch (qrError) {
        console.error("❌ QR Code generation failed:", qrError);
        doc.text("QR Code Error", qrX + (qrSize / 2), qrStartY + (qrSize / 2), { align: 'center' }); // Display error text if QR fails
        qrAndLinkBottomY = qrStartY + qrSize; // Ensure space even with error
    }

    // UPI PAYMENT LINK BELOW QR CODE
    const paymentLinkText = 'Click to Pay with UPI';
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 255); // Blue for link

    const linkTextWidth = doc.getStringUnitWidth(paymentLinkText) * doc.internal.getFontSize();
    const linkX = qrX + (qrSize - linkTextWidth) / 2; // Center horizontally below QR
    const linkY = qrAndLinkBottomY + 10; // Position below QR with padding

    doc.textWithLink(paymentLinkText, linkX, linkY, { url: upiPaymentLink });
    doc.setTextColor(0, 0, 0); // Reset text color

    // Update qrAndLinkBottomY with the lowest point of the link
    qrAndLinkBottomY = linkY;


    // --- Total Section (Bottom Left) ---
    // Calculate the absolute lowest point between the end of the terms on the left
    // and the bottom of the QR code/UPI link on the right.
    const lowestPointOnPageForTotals = Math.max(bottomOfTerms, qrAndLinkBottomY);

    // Add some padding below the lowest element before starting the total section
    let totalSectionStartY = lowestPointOnPageForTotals + 15;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, margin, totalSectionStartY);
    doc.text(`Discount: Rs. ${discount.toFixed(2)}`, margin, totalSectionStartY + lineHeight);
    doc.text(`Total: Rs. ${total.toFixed(2)}`, margin, totalSectionStartY + 2 * lineHeight);


    // --- PDF Output and Backend Upload ---
    doc.save(`${formData.name}_Invoice_${invoiceId}.pdf`); // Save PDF locally

    const pdfBlob = doc.output('blob'); // Convert PDF to blob for upload

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