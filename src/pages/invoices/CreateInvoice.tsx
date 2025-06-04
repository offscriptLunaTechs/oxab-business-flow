
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { useCustomerProductPrice } from '@/hooks/useCustomerPricing';
import CustomerSelection from '@/components/invoice/CustomerSelection';
import ProductSelection from '@/components/invoice/ProductSelection';
import InvoiceReview from '@/components/invoice/InvoiceReview';
import { InvoiceItem } from '@/types/invoice';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const createInvoice = useCreateInvoice();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);
  const [invoiceData, setInvoiceData] = useState({
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    status: 'pending',
    notes: '',
  });

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setCurrentStep(2);
  };

  const handleItemsSelect = (items: InvoiceItem[]) => {
    setSelectedItems(items);
    setCurrentStep(3);
  };

  const handleCreateInvoice = async () => {
    if (!selectedCustomer || selectedItems.length === 0) return;

    const subtotal = selectedItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax = subtotal * 0; // No tax for now
    const discount = 0; // No discount for now
    const total = subtotal + tax - discount;

    try {
      const invoice = await createInvoice.mutateAsync({
        customer_id: selectedCustomer.id,
        date: invoiceData.date,
        due_date: invoiceData.due_date,
        subtotal,
        tax,
        discount,
        total,
        status: invoiceData.status,
        notes: invoiceData.notes,
        items: selectedItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
      });

      navigate(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Failed to create invoice:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CustomerSelection 
            onCustomerSelect={handleCustomerSelect}
            selectedCustomer={selectedCustomer}
          />
        );
      case 2:
        return (
          <ProductSelection
            customer={selectedCustomer}
            onItemsSelect={handleItemsSelect}
            selectedItems={selectedItems}
          />
        );
      case 3:
        return (
          <InvoiceReview
            customer={selectedCustomer}
            items={selectedItems}
            invoiceData={invoiceData}
            onInvoiceDataChange={setInvoiceData}
            onCreateInvoice={handleCreateInvoice}
            isCreating={createInvoice.isPending}
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

      {/* Step Navigation */}
      {currentStep > 1 && (
        <div className="flex justify-between items-center py-4 border-b">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Previous Step
          </Button>
          <div className="text-sm text-gray-600">
            {currentStep === 2 && selectedCustomer && (
              <span>Customer: <strong>{selectedCustomer.name}</strong></span>
            )}
            {currentStep === 3 && selectedItems.length > 0 && (
              <span>{selectedItems.length} item(s) selected</span>
            )}
          </div>
        </div>
      )}

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
