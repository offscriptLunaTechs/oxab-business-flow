
import React from 'react';
import { CustomerTabs } from '@/components/customers/CustomerTabs';

const Customers = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600 mt-2">
          Manage customers, pricing, and account statements
        </p>
      </div>
      
      <CustomerTabs />
    </div>
  );
};

export default Customers;
