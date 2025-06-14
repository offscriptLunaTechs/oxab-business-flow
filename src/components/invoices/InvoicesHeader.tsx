
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InvoicesHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoices & Reports</h1>
        <p className="text-gray-600">Comprehensive invoice management and reporting</p>
      </div>
      <Button 
        onClick={() => navigate('/invoices/new')}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Create Invoice
      </Button>
    </div>
  );
};

export default InvoicesHeader;
