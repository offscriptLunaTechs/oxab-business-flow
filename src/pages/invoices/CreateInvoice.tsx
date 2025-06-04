
import React, { useState } from 'react';
import { ArrowLeft, Users, Package, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import CustomerSelection from '@/components/invoice/CustomerSelection';
import ProductSelection, { InvoiceItem } from '@/components/invoice/ProductSelection';
import InvoiceReview from '@/components/invoice/InvoiceReview';
import { Customer } from '@/types/invoice';

type Step = 'customer' | 'products' | 'review';

const steps = [
  { id: 'customer', title: 'Select Customer', icon: Users },
  { id: 'products', title: 'Add Products', icon: Package },
  { id: 'review', title: 'Review & Confirm', icon: FileText },
];

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('customer');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  const handleStepChange = (step: Step) => {
    setCurrentStep(step);
  };

  const handleInvoiceComplete = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
            <p className="text-gray-600">Follow the steps to create a new invoice</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < getCurrentStepIndex();
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center space-x-3 ${
                    index < steps.length - 1 ? 'flex-1' : ''
                  }`}>
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      isActive 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : isCompleted
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="hidden md:block">
                      <p className={`font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        Step {index + 1}
                      </p>
                      <p className={`text-sm ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden md:block flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-8">
          {currentStep === 'customer' && (
            <CustomerSelection
              selectedCustomer={selectedCustomer}
              onCustomerSelect={setSelectedCustomer}
              onNext={() => handleStepChange('products')}
            />
          )}

          {currentStep === 'products' && selectedCustomer && (
            <ProductSelection
              customer={selectedCustomer}
              items={invoiceItems}
              onItemsChange={setInvoiceItems}
              onNext={() => handleStepChange('review')}
              onBack={() => handleStepChange('customer')}
            />
          )}

          {currentStep === 'review' && selectedCustomer && (
            <InvoiceReview
              customer={selectedCustomer}
              items={invoiceItems}
              onBack={() => handleStepChange('products')}
              onComplete={handleInvoiceComplete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateInvoice;
