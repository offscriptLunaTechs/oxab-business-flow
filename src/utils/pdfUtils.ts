
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import React from 'react';
import InvoicePDF from '@/components/invoice/InvoicePDF';
import { InvoiceWithDetails } from '@/types/invoice';

export const downloadInvoicePDF = async (invoice: InvoiceWithDetails) => {
  try {
    // InvoicePDF returns a Document component, so we can call it directly
    const pdfDocument = InvoicePDF({ invoice });
    const blob = await pdf(pdfDocument).toBlob();
    saveAs(blob, `invoice-${invoice.id}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
