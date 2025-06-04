
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useInvoice } from '@/hooks/useInvoices';
import LoadingSpinner from '@/components/ui/loading-spinner';

const EditInvoice = () => {
  const { id } = useParams<{ id: string }>();
  const { data: invoice, isLoading, error } = useInvoice(id!);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !invoice) {
    return <Navigate to="/invoices" replace />;
  }

  // For now, redirect to the create invoice page
  // In the future, we can implement a proper edit form
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Edit Invoice {invoice.id}</h1>
        <p className="text-gray-600 mb-4">Invoice editing functionality coming soon...</p>
        <p className="text-sm text-gray-500">
          For now, you can view the invoice details and create a new invoice if needed.
        </p>
      </div>
    </div>
  );
};

export default EditInvoice;
