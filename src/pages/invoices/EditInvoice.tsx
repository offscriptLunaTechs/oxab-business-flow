
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { useInvoice, useUpdateInvoice } from '@/hooks/useInvoices';
import { ArrowLeft } from 'lucide-react';

const EditInvoice = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();

  console.log('EditInvoice - invoiceId from params:', invoiceId);

  const { data: invoice, isLoading, error } = useInvoice(invoiceId || '');
  const updateInvoice = useUpdateInvoice();

  console.log('EditInvoice - invoice data:', invoice);
  console.log('EditInvoice - isLoading:', isLoading);
  console.log('EditInvoice - error:', error);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Loading invoice...</div>
      </div>
    );
  }

  if (error) {
    console.error('Invoice loading error:', error);
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading invoice: {error.message}</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/invoices')}
          >
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Invoice not found</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/invoices')}
          >
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdate = async (values: any) => {
    try {
      console.log('EditInvoice - handleUpdate called with values:', values);
      
      // Prepare the update data - only include invoice fields, not items
      const invoiceUpdateData = {
        customer_id: values.customer_id,
        date: values.date,
        due_date: values.due_date,
        subtotal: values.subtotal,
        tax: values.tax,
        discount: values.discount,
        total: values.total,
        status: values.status,
        notes: values.notes || '',
      };

      console.log('EditInvoice - calling updateInvoice with:', {
        invoiceId: invoice.id,
        invoiceData: invoiceUpdateData,
        items: values.items
      });

      await updateInvoice.mutateAsync({ 
        invoiceId: invoice.id, 
        invoiceData: invoiceUpdateData,
        items: values.items 
      });
      navigate('/invoices');
    } catch (error) {
      console.error("Failed to update invoice", error);
    }
  };

  const handleBack = () => {
    navigate('/invoices');
  };

  // Safely access invoice items - they come from the invoice_items table via the query
  const invoiceItems = invoice.invoice_items || [];
  console.log('EditInvoice - invoice items:', invoiceItems);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Button>
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
              items: invoiceItems.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
              })) || [],
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
