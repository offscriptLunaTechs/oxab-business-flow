
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer } from '@/types/invoice';

interface CustomerSelectionCardProps {
  customerId: string;
  setCustomerId: (value: string) => void;
  customers: Customer[];
}

const CustomerSelectionCard = ({ customerId, setCustomerId, customers }: CustomerSelectionCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Customer</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={customerId} onValueChange={setCustomerId}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id} className="py-3">
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
};

export default CustomerSelectionCard;
