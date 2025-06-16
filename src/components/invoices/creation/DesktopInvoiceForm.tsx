
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Plus, Search, Loader2 } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoiceCreation } from '@/hooks/invoices/creation/useInvoiceCreation';
import { useInvoiceSubmission } from '@/hooks/invoices/creation/useInvoiceSubmission';
import { useCustomerPricing } from '@/hooks/invoices/useCustomerPricing';
import { ProductSelectionModal } from '@/components/invoices/ProductSelectionModal';
import CustomerSelector from './CustomerSelector';
import InvoiceItems from './InvoiceItems';
import { Product } from '@/types/invoice';

const DesktopInvoiceForm = () => {
  const { data: customers = [] } = useCustomers();
  const { getCustomerPrice } = useCustomerPricing();
  const { submitInvoice, isSubmitting } = useInvoiceSubmission();

  const {
    customerId,
    date,
    dueDate,
    itemsArray,
    notes,
    discount,
    isFreeOfCharge,
    isProductModalOpen,
    subtotal,
    total,
    setCustomerId,
    setDate,
    setDueDate,
    addProduct,
    updateItemQuantity,
    updateItemPrice,
    removeItem,
    setNotes,
    setDiscount,
    setIsFreeOfCharge,
    setIsProductModalOpen,
  } = useInvoiceCreation();

  const handleProductSelect = async (product: Product) => {
    let finalPrice = product.base_price;
    if (customerId) {
      const customerPrice = await getCustomerPrice(customerId, product.id);
      if (customerPrice !== null) {
        finalPrice = customerPrice;
      }
    }
    addProduct(product, finalPrice);
  };

  const handleSubmit = () => {
    submitInvoice({
      customerId,
      date,
      dueDate,
      itemsArray,
      notes,
      discount,
      isFreeOfCharge,
      subtotal,
      total,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Invoice</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <CustomerSelector
            customerId={customerId}
            onCustomerChange={setCustomerId}
            customers={customers}
          />

          {/* Date and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <DatePicker
                date={date}
                onDateChange={setDate}
                placeholder="Pick invoice date"
              />
            </div>
            <div>
              <Label>Due Date</Label>
              <DatePicker
                date={dueDate}
                onDateChange={setDueDate}
                placeholder="Pick due date"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Items</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setIsProductModalOpen(true)}
                className="flex items-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>Browse Products</span>
              </Button>
            </div>

            {itemsArray.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-4">No items added yet</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsProductModalOpen(true)}
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <InvoiceItems
                  items={itemsArray}
                  onUpdateQuantity={updateItemQuantity}
                  onUpdatePrice={updateItemPrice}
                  onRemoveItem={removeItem}
                />
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsProductModalOpen(true)}
                  className="w-full mt-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Another Item
                </Button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
            />
          </div>

          {/* Free of Charge and Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="free-of-charge"
                checked={isFreeOfCharge}
                onCheckedChange={(checked) => setIsFreeOfCharge(checked === true)}
              />
              <Label htmlFor="free-of-charge" className="text-sm font-medium">
                Free of Charge
              </Label>
            </div>
            <div>
              <Label htmlFor="discount">Discount</Label>
              <Input
                type="number"
                id="discount"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                disabled={isFreeOfCharge}
                step="0.01"
              />
            </div>
          </div>

          {/* Subtotal and Total */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label>Subtotal</Label>
              <Input type="number" value={subtotal.toFixed(3)} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label>Total</Label>
              <Input 
                type="number" 
                value={total.toFixed(3)} 
                readOnly 
                className={`bg-gray-50 ${isFreeOfCharge ? 'text-green-600 font-bold' : ''}`}
              />
              {isFreeOfCharge && (
                <p className="text-xs text-green-600 mt-1">This invoice is marked as free of charge</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !customerId || itemsArray.length === 0}
            className="w-full"
          >
            {isSubmitting ? 'Creating...' : 'Create Invoice'}
          </Button>
        </CardContent>
      </Card>

      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelectProduct={handleProductSelect}
      />
    </div>
  );
};

export default DesktopInvoiceForm;
