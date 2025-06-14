
import React from 'react';
import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CustomerInfoCardProps {
  customer: {
    name: string;
    code: string;
    customer_type: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  notes?: string;
}

const CustomerInfoCard = ({ customer, notes }: CustomerInfoCardProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-600">Company Name</label>
            <p className="font-semibold">{customer.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Customer Code</label>
            <p>{customer.code}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Type</label>
            <Badge variant={customer.customer_type === 'wholesale' ? 'default' : 'secondary'}>
              {customer.customer_type?.charAt(0).toUpperCase() + customer.customer_type?.slice(1)}
            </Badge>
          </div>
          {customer.email && (
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p>{customer.email}</p>
            </div>
          )}
          {customer.phone && (
            <div>
              <label className="text-sm font-medium text-gray-600">Phone</label>
              <p>{customer.phone}</p>
            </div>
          )}
          {customer.address && (
            <div>
              <label className="text-sm font-medium text-gray-600">Address</label>
              <p>{customer.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerInfoCard;
