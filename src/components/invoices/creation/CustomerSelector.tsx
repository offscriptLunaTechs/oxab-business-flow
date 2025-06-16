
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer } from '@/types/invoice';

interface CustomerSelectorProps {
  customerId: string;
  onCustomerChange: (customerId: string) => void;
  customers: Customer[];
  isMobile?: boolean;
}

const CustomerSelector = memo(({ customerId, onCustomerChange, customers, isMobile = false }: CustomerSelectorProps) => {
  return (
    <Card>
      <CardHeader className={isMobile ? "pb-3" : undefined}>
        <CardTitle className={isMobile ? "text-lg" : undefined}>Customer</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={customerId} onValueChange={onCustomerChange}>
          <SelectTrigger className={isMobile ? "h-12 text-base" : undefined}>
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id} className={isMobile ? "py-3" : undefined}>
                <div>
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-500">{customer.code}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
});

CustomerSelector.displayName = 'CustomerSelector';

export default CustomerSelector;
