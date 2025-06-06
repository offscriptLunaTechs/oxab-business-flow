
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomersList } from './CustomersList';
import { CustomPricingForm } from './CustomPricingForm';
import { CustomPricingList } from './CustomPricingList';
import { AccountSummary } from './AccountSummary';
import { StatementManagement } from './StatementManagement';

export const CustomerTabs = () => {
  return (
    <Tabs defaultValue="customers" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="customers">Customers</TabsTrigger>
        <TabsTrigger value="statements">Statements</TabsTrigger>
        <TabsTrigger value="custom-pricing">Custom Pricing</TabsTrigger>
        <TabsTrigger value="pricing-form">Add Pricing</TabsTrigger>
        <TabsTrigger value="account-summary">Account Summary</TabsTrigger>
      </TabsList>

      <TabsContent value="customers">
        <CustomersList />
      </TabsContent>

      <TabsContent value="statements">
        <StatementManagement />
      </TabsContent>

      <TabsContent value="custom-pricing">
        <CustomPricingList />
      </TabsContent>

      <TabsContent value="pricing-form">
        <CustomPricingForm />
      </TabsContent>

      <TabsContent value="account-summary">
        <AccountSummary />
      </TabsContent>
    </Tabs>
  );
};
