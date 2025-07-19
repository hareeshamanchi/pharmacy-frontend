import fs from 'fs';
import path from 'path';
import { Parser } from 'json2csv';

export function generateLocalWellCSV(orderItems) {
  // Sample structure per item expected from cart/order
  // {
  //   productId, drugName, brandName, price, quantity
  // }

  const rows = orderItems.map((item, index) => ({
    SNo: index + 1,
    'Item Name': item.drugName,
    'Batch No': '',         // Not in model, admin can add manually later
    'Expiry': '',           // Not in model
    'HSN': '',              // Not in model
    'Pack': '',             // Not in model
    'Qty': item.quantity,
    'MRP': '',              // Optional
    'Rate': item.price,
    'Amount': item.price * item.quantity,
  }));

  const fields = [
    'SNo',
    'Item Name',
    'Batch No',
    'Expiry',
    'HSN',
    'Pack',
    'Qty',
    'MRP',
    'Rate',
    'Amount',
  ];

  const parser = new Parser({ fields });
  const csv = parser.parse(rows);

  const filePath = path.join('invoices', `LocalWell_CSV_${Date.now()}.csv`);
  fs.writeFileSync(filePath, csv);

  return filePath; // You can attach this file to the email
}
