
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Edit, Trash2, DollarSign } from 'lucide-react';
import { useCustomerPricing } from '@/hooks/useCustomerPricing';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { format } from 'date-fns';

export const CustomPricingList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  const { data: customers = [] } = useCustomers();
  const { data: products = [] } = useProducts();
  const { data: pricingEntries = [] } = useCustomerPricing(selectedCustomer);

  // Filter pricing entries based on search
  const filteredEntries = pricingEntries.filter(entry => {
    const customer = customers.find(c => c.id === entry.customer_id);
    const product = products.find(p => p.id === entry.product_id);
    
    const searchLower = searchTerm.toLowerCase();
    return (
      customer?.name.toLowerCase().includes(searchLower) ||
      customer?.code.toLowerCase().includes(searchLower) ||
      product?.name.toLowerCase().includes(searchLower) ||
      product?.sku.toLowerCase().includes(searchLower)
    );
  });

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.name} (${customer.code})` : 'Unknown Customer';
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.name} (${product.sku})` : 'Unknown Product';
  };

  const getStatusBadge = (entry: any) => {
    const now = new Date();
    const effectiveDate = entry.effective_date ? new Date(entry.effective_date) : null;
    const expiryDate = entry.expires_date ? new Date(entry.expires_date) : null;

    if (!entry.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (effectiveDate && effectiveDate > now) {
      return <Badge variant="outline">Scheduled</Badge>;
    }

    if (expiryDate && expiryDate < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Custom Pricing Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by customer or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No pricing entries found matching your search' : 'No custom pricing entries found'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Custom Price</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="font-medium">
                        {getCustomerName(entry.customer_id)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {getProductName(entry.product_id)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-green-600">
                        ${entry.price.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.effective_date ? format(new Date(entry.effective_date), 'MMM d, yyyy') : 'Immediate'}
                    </TableCell>
                    <TableCell>
                      {entry.expires_date ? format(new Date(entry.expires_date), 'MMM d, yyyy') : 'No expiry'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(entry)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
