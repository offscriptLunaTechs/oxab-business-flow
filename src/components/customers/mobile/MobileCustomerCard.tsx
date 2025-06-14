
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Phone, Mail, MapPin, DollarSign } from 'lucide-react';
import { Customer } from '@/types';

interface MobileCustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onPricing: (customer: Customer) => void;
}

export const MobileCustomerCard = ({ customer, onEdit, onPricing }: MobileCustomerCardProps) => {
  return (
    <Card className="mb-3 mx-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{customer.name}</h3>
            <p className="text-sm text-gray-600 font-medium">{customer.code}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={customer.customer_type === 'wholesale' ? 'default' : 'secondary'}
              className={customer.customer_type === 'wholesale' 
                ? 'bg-blue-100 text-blue-800 border-blue-200' 
                : 'bg-green-100 text-green-800 border-green-200'
              }
            >
              {customer.customer_type}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          {customer.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
          
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{customer.phone}</span>
            </div>
          )}
          
          {customer.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="truncate">{customer.address}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPricing(customer)}
            className="flex-1"
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Pricing
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(customer)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
