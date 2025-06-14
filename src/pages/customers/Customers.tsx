
import React from 'react';
import { CustomerTabs } from '@/components/customers/CustomerTabs';
import { CustomerAccountSummary } from '@/components/customers/CustomerAccountSummary';
import { useIsMobile } from '@/hooks/use-mobile';

const Customers = () => {
  const isMobile = useIsMobile();

  // On mobile, the layout is handled by CustomersLayout
  // This component is only used for desktop
  if (isMobile) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600 mt-2">
          Manage customers, payments, pricing, and account statements
        </p>
      </div>
      
      {/* Account Summary Section - Standalone */}
      <div className="mb-8">
        <CustomerAccountSummary />
      </div>
      
      {/* Customer Management Tabs */}
      <CustomerTabs />
    </div>
  );
};

export default Customers;
