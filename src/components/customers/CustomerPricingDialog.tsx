
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign } from 'lucide-react';
import { CustomerPricingList } from './CustomerPricingList';
import { CustomerPricingForm } from './CustomerPricingForm';
import { Customer } from '@/types';

interface CustomerPricingDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerPricingDialog = ({
  customer,
  open,
  onOpenChange,
}: CustomerPricingDialogProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSuccess = () => {
    setIsFormOpen(false);
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Management - {customer.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {isFormOpen ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
              </div>
              <CustomerPricingForm 
                customerId={customer.id}
                onSuccess={handleSuccess}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Pricing
                </Button>
              </div>
              <CustomerPricingList customerId={customer.id} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
