
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateInvoice } from '@/hooks/useInvoices';
import CustomerSelection from '@/components/invoice/CustomerSelection';
import ProductSelection, { InvoiceItem } from '@/components/invoice/ProductSelection';
import InvoiceReview from '@/components/invoice/InvoiceReview';

const CreateInvoice = () => {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleComplete = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CustomerSelection 
            onCustomerSelect={handleCustomerSelect}
            selectedCustomer={selectedCustomer}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <ProductSelection
            customer={selectedCustomer}
            items={selectedItems}
            onItemsChange={setSelectedItems}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <InvoiceReview
            customer={selectedCustomer}
            items={selectedItems}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Select Customer';
      case 2:
        return 'Add Products';
      case 3:
        return 'Review & Create';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/invoices')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
            <p className="text-gray-600">Step {currentStep} of 3: {getStepTitle()}</p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{getStepTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateInvoice;
