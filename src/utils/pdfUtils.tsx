
import React from "react";
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { InvoiceWithDetails } from "@/types/invoice";
import InvoicePDF from "@/components/invoice/InvoicePDF";

export const downloadInvoicePDF = async (invoice: InvoiceWithDetails) => {
  const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
  saveAs(blob, `invoice-${invoice.id}.pdf`);
};
