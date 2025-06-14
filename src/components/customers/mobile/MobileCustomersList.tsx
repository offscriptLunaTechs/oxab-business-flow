
import React, { useState } from 'react';
import { Customer } from '@/types';
import { useCustomers } from '@/hooks/useCustomers';
import { MobileCustomerCard } from './MobileCustomerCard';
import { MobileCustomerHeader } from './MobileCustomerHeader';
import { EditCustomerDialog } from '../EditCustomerDialog';
import { CustomerForm } from '../CustomerForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const MobileCustomersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: customers = [], isLoading, refetch } = useCustomers(searchTerm);

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleSuccess = () => {
    refetch();
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileCustomerHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddCustomer={() => setIsFormOpen(true)}
      />

      <div className="py-4">
        {customers.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-gray-500">No customers found</p>
          </div>
        ) : (
          customers.map((customer) => (
            <MobileCustomerCard
              key={customer.id}
              customer={customer}
              onEdit={handleEditCustomer}
            />
          ))
        )}
      </div>

      {/* Add Customer Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold">Add New Customer</h2>
          </div>
          <div className="p-4">
            <CustomerForm
              onSuccess={handleSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        customer={editingCustomer}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => {
          refetch();
          setIsEditDialogOpen(false);
        }}
      />
    </div>
  );
};
