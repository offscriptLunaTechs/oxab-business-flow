
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface MobileInvoiceHeaderProps {
  onBack: () => void;
}

const MobileInvoiceHeader = ({ onBack }: MobileInvoiceHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-3 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Create Invoice</h1>
        </div>
      </div>
    </div>
  );
};

export default MobileInvoiceHeader;
