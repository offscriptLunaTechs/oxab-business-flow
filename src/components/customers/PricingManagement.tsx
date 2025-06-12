
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CustomPricingList } from './CustomPricingList';
import { CustomPricingForm } from './CustomPricingForm';

export const PricingManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSuccess = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Pricing Management</span>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Pricing
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isFormOpen ? (
            <div className="space-y-4">
              <CustomPricingForm
                onSuccess={handleSuccess}
                onCancel={() => setIsFormOpen(false)}
              />
            </div>
          ) : (
            <CustomPricingList />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
