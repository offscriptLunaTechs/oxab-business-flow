
import React from 'react';
import { pdf, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { InvoiceWithDetails, Product } from '@/types/invoice'; // Ensure Product is imported if used for defaults
import InvoicePDF from '@/components/invoice/InvoicePDF';

// Register fonts
// Using a commonly available font family name like 'Helvetica' and providing sources for regular/bold.
// If these exact Roboto TTFs are not what you intend for "Helvetica", you might need to source actual Helvetica fonts
// or choose a different font family name and use corresponding font files.
// For now, this setup registers 'Helvetica' to use these Roboto files.
Font.register({
  family: 'Helvetica', // This is the name used in `fontFamily` style
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Bold.ttf', fontWeight: 'bold' },
    // Add italic and boldItalic if needed and available
  ]
});

// A basic hyphenation callback to prevent words from breaking mid-character if they don't fit.
// This is very simple; for more complex hyphenation, a library might be needed.
Font.registerHyphenationCallback(word => (word ? [word] : []));


export const downloadInvoicePDF = async (invoice: InvoiceWithDetails) => {
  // Ensure product details are available and provide sensible defaults if completely missing.
  const processedInvoice = {
    ...invoice,
    items: invoice.items.map(item => {
      // Provide a default product structure if item.product is null or undefined
      const defaultProduct: Product = {
        id: '', // Default value
        name: 'N/A',
        sku: 'N/A',
        size: '', // Default value
        base_price: 0, // Default value
        status: 'inactive', // Default value
        created_at: new Date().toISOString(), // Default value
        updated_at: new Date().toISOString(), // Default value
        // Add other required fields from Product type with default values
      };
      return {
        ...item,
        product: item.product || defaultProduct
      };
    })
  };

  try {
    const blob = await pdf(<InvoicePDF invoice={processedInvoice} />).toBlob();
    saveAs(blob, `invoice-${invoice.id}.pdf`);
  } catch (error) {
    console.error("Error generating PDF blob:", error);
    // Potentially re-throw or handle this error more gracefully (e.g., user notification)
    throw error; 
  }
};
