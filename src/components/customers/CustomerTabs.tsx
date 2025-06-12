
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomersList } from './CustomersList';
import { PricingManagement } from './PricingManagement';

export const CustomerTabs = () => {
  return (
    <Tabs defaultValue="customers" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="customers">Customer Management</TabsTrigger>
        <TabsTrigger value="pricing">Pricing Management</TabsTrigger>
      </TabsList>

      <TabsContent value="customers">
        <CustomersList />
      </TabsContent>

      <TabsContent value="pricing">
        <PricingManagement />
      </TabsContent>
    </Tabs>
  );
};
