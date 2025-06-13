
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Customer } from '@/types';

interface InvoiceFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  customerFilter: string;
  setCustomerFilter: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  minAmount: number | undefined;
  setMinAmount: (amount: number | undefined) => void;
  customers: Customer[];
  onClearFilters: () => void;
}

const InvoiceFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  customerFilter,
  setCustomerFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  minAmount,
  setMinAmount,
  customers,
  onClearFilters,
}: InvoiceFiltersProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DatePicker
            date={startDate}
            onDateChange={setStartDate}
            placeholder="From date"
          />

          <DatePicker
            date={endDate}
            onDateChange={setEndDate}
            placeholder="To date"
          />

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min amount"
              value={minAmount || ''}
              onChange={(e) => setMinAmount(e.target.value ? Number(e.target.value) : undefined)}
              step="0.01"
            />
            <Button variant="outline" onClick={onClearFilters} size="sm">
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceFilters;
