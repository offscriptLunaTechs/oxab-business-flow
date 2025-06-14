
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

interface MobileCustomerHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddCustomer: () => void;
}

export const MobileCustomerHeader = ({ 
  searchTerm, 
  onSearchChange, 
  onAddCustomer 
}: MobileCustomerHeaderProps) => {
  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
      <div className="flex items-center gap-3 mb-3">
        <h1 className="text-xl font-semibold text-gray-900 flex-1">Customers</h1>
        <Button
          onClick={onAddCustomer}
          size="sm"
          className="h-9"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10"
        />
      </div>
    </div>
  );
};
