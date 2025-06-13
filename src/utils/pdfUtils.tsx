
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import React from 'react';
import InvoicePDF from '@/components/invoice/InvoicePDF';
import { InvoiceWithDetails } from '@/types/invoice';

export const downloadInvoicePDF = async (invoice: InvoiceWithDetails) => {
  try {
    console.log('Starting PDF generation for invoice:', invoice.id);
    
    // Create the PDF blob
    const blob = await pdf(React.createElement(InvoicePDF, { invoice })).toBlob();
    
    // Download the file
    saveAs(blob, `invoice-${invoice.id}.pdf`);
    
    console.log('PDF generated successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
