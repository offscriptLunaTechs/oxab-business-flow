
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileInvoiceForm from '@/components/invoices/MobileInvoiceForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Plus, Trash2, Search, Loader2 } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { ProductSelectionModal } from '@/components/invoices/ProductSelectionModal';
import { useInvoiceFormState } from '@/hooks/invoices/useInvoiceFormState';
import { useInvoiceItems } from '@/hooks/invoices/useInvoiceItems';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types/invoice';

const CreateInvoice = () => {
  // Call ALL hooks at the top level - never conditionally
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: customers = [] } = useCustomers();
  const createInvoice = useCreateInvoice();

  // Use the new refactored hooks
  const formState = useInvoiceFormState();
  const invoiceItems = useInvoiceItems(formState.customerId);

  const addItemFromModal = async (product: Product) => {
    await invoiceItems.addItemFromModal(product);
  };

  const removeItem = (index: number) => {
    invoiceItems.removeItem(index);
  };

  const updateItem = async (index: number, field: string, value: any) => {
    if (field === 'quantity') {
      invoiceItems.updateItemQuantity(index, parseInt(value) || 0);
    } else if (field === 'price') {
      invoiceItems.updateItemPrice(index, parseFloat(value) || 0);
    }
  };

  const handleSubmit = async () => {
    if (!formState.customerId || invoiceItems.items.length === 0) {
      toast({
        title: "Error",
        description: "Customer and items are required",
        variant: "destructive",
      });
      return;
    }

    const subtotal = invoiceItems.calculateSubtotal();
    const total = formState.isFreeOfCharge ? 0 : subtotal - formState.discount;

    const invoiceData = {
      customer_id: formState.customerId,
      date: formState.date ? formState.date.toISOString().split('T')[0] : '',
      due_date: formState.dueDate ? formState.dueDate.toISOString().split('T')[0] : '',
      subtotal: subtotal,
      tax: 0, // No tax in Kuwait
      discount: formState.discount,
      total: total,
      status: 'pending',
      notes: formState.isFreeOfCharge ? `${formState.notes}\n[FREE OF CHARGE]`.trim() : formState.notes,
      items: invoiceItems.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: formState.isFreeOfCharge ? 0 : item.price,
        total: formState.isFreeOfCharge ? 0 : item.total
      }))
    };

    try {
      const result = await createInvoice.mutateAsync(invoiceData);
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      navigate(`/invoices/${result.id}`);
    } catch (error) {
      console.error('Failed to create invoice', error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    }
  };

  // Calculate values
  const subtotal = invoiceItems.calculateSubtotal();
  const total = formState.isFreeOfCharge ? 0 : subtotal - formState.discount;

  // NOW we can safely do conditional rendering since all hooks have been called
  if (isMobile) {
    return <MobileInvoiceForm />;
  }

  // Desktop version
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Invoice</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* Customer Selection */}
          <div>
            <Label htmlFor="customer">Customer</Label>
            <Select value={formState.customerId} onValueChange={formState.setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <DatePicker
                date={formState.date}
                onDateChange={formState.setDate}
                placeholder="Pick invoice date"
              />
            </div>
            <div>
              <Label>Due Date</Label>
              <DatePicker
                date={formState.dueDate}
                onDateChange={formState.setDueDate}
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
                onClick={() => formState.setIsProductModalOpen(true)}
                className="flex items-center space-x-2"
                disabled={invoiceItems.isAddingItem}
              >
                {invoiceItems.isAddingItem ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>Browse Products</span>
              </Button>
            </div>

            {invoiceItems.items.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-4">No items added yet</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => formState.setIsProductModalOpen(true)}
                  disabled={invoiceItems.isAddingItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {invoiceItems.items.map((item, index) => (
                  <div 
                    key={`${item.product_id}-${index}`} 
                    className={`grid grid-cols-12 gap-4 py-3 px-4 border rounded-lg transition-all duration-200 ${
                      item.isOptimistic 
                        ? 'bg-blue-50 border-blue-200 animate-pulse' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="col-span-5">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <p className="font-medium text-sm">{item.product_name}</p>
                          {item.isOptimistic && (
                            <Loader2 className="h-3 w-3 ml-2 animate-spin text-blue-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600">SKU: {item.product_sku}</p>
                        <p className="text-xs text-gray-600">Size: {item.product_size}</p>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="h-8"
                        min="1"
                        disabled={item.isOptimistic}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">Price</Label>
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                        className="h-8"
                        step="0.001"
                        disabled={item.isOptimistic}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">Total</Label>
                      <Input
                        type="number"
                        value={item.total.toFixed(3)}
                        readOnly
                        className={`h-8 ${item.isOptimistic ? 'bg-blue-50' : 'bg-gray-100'}`}
                      />
                    </div>

                    <div className="col-span-1 flex items-end">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeItem(index)}
                        className="h-8 w-8 p-0"
                        disabled={item.isOptimistic}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => formState.setIsProductModalOpen(true)}
                  className="w-full mt-4"
                  disabled={invoiceItems.isAddingItem}
                >
                  {invoiceItems.isAddingItem ? (
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
            <Input id="notes" value={formState.notes} onChange={(e) => formState.setNotes(e.target.value)} />
          </div>

          {/* Free of Charge and Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="free-of-charge"
                checked={formState.isFreeOfCharge}
                onCheckedChange={(checked) => formState.setIsFreeOfCharge(checked === true)}
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
                value={formState.discount}
                onChange={(e) => formState.setDiscount(parseFloat(e.target.value) || 0)}
                disabled={formState.isFreeOfCharge}
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
                className={`bg-gray-50 ${formState.isFreeOfCharge ? 'text-green-600 font-bold' : ''}`}
              />
              {formState.isFreeOfCharge && (
                <p className="text-xs text-green-600 mt-1">This invoice is marked as free of charge</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            disabled={createInvoice.isPending || !formState.customerId || invoiceItems.items.length === 0}
            className="w-full"
          >
            {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
          </Button>
        </CardContent>
      </Card>

      {/* Product Selection Modal */}
      <ProductSelectionModal
        isOpen={formState.isProductModalOpen}
        onClose={() => formState.setIsProductModalOpen(false)}
        onSelectProduct={addItemFromModal}
      />
    </div>
  );
};

export default CreateInvoice;
