
import React, { useState, useMemo } from 'react';
import { Search, Users, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomers } from '@/hooks/useCustomers';
import { Customer } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface CustomerSelectionProps {
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
  onNext: () => void;
}

const CustomerSelection: React.FC<CustomerSelectionProps> = ({
  selectedCustomer,
  onCustomerSelect,
  onNext,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: customers, isLoading, error } = useCustomers(searchTerm);

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!searchTerm) return customers;
    
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [customers, searchTerm]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading customers: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Customer</h2>
        <p className="text-gray-600">Choose a customer for this invoice</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search by name, code, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Customers List */}
      {!isLoading && (
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {filteredCustomers.map((customer) => (
            <Card
              key={customer.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedCustomer?.id === customer.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onCustomerSelect(customer)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      customer.customer_type === 'wholesale' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {customer.customer_type === 'wholesale' ? 
                        <Building2 className="h-5 w-5" /> : 
                        <Users className="h-5 w-5" />
                      }
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <p className="text-sm text-gray-600">Code: {customer.code}</p>
                      {customer.email && (
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant={customer.customer_type === 'wholesale' ? 'default' : 'secondary'}>
                      {customer.customer_type.charAt(0).toUpperCase() + customer.customer_type.slice(1)}
                    </Badge>
                    {selectedCustomer?.id === customer.id && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && filteredCustomers.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No customers found</p>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search terms
            </p>
          )}
        </div>
      )}

      {/* Next Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={onNext}
          disabled={!selectedCustomer}
          size="lg"
          className="px-8 py-3 text-lg h-auto"
        >
          Next: Add Products
        </Button>
      </div>
    </div>
  );
};

export default CustomerSelection;
