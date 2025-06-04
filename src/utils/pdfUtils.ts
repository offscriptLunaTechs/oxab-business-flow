
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import React from 'react';
import InvoicePDF from '@/components/invoice/InvoicePDF';
import { InvoiceWithDetails } from '@/types/invoice';

export const downloadInvoicePDF = async (invoice: InvoiceWithDetails) => {
  try {
    const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
    saveAs(blob, `invoice-${invoice.id}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
