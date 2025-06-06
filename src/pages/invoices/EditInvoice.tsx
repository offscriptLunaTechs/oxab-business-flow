import React from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { useInvoice, useUpdateInvoice } from '@/hooks/useInvoices';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const EditInvoice = () => {
  const router = useRouter();
  const { invoiceId } = router.query;
  const invoiceIdString = Array.isArray(invoiceId) ? invoiceId[0] : invoiceId;

  const { data: invoice, isLoading } = useInvoice(invoiceIdString || '');
  const updateInvoice = useUpdateInvoice();

  if (isLoading) {
    return <div>Loading invoice...</div>;
  }

  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  const handleUpdate = async (values: any) => {
    try {
      await updateInvoice.mutateAsync({ invoiceId: invoice.id, invoiceData: values, items: values.items });
      router.push('/invoices/InvoicesList');
    } catch (error) {
      console.error("Failed to update invoice", error);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4">
        <Link href="/invoices/InvoicesList" className="flex items-center gap-2 text-blue-500 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Edit Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceForm
            initialValues={{
              customer_id: invoice.customer_id,
              date: invoice.date,
              due_date: invoice.due_date,
              subtotal: invoice.subtotal,
              tax: invoice.tax,
              discount: invoice.discount,
              total: invoice.total,
              status: invoice.status,
              notes: invoice.notes || '',
              items: invoice.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
              })),
            }}
            onSubmit={handleUpdate}
            submitButtonLabel="Update Invoice"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditInvoice;
