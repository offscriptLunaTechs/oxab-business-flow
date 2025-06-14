
import React from 'react';
import { Button } from '@/components/ui/button';
import { useMobileInvoiceForm } from '@/hooks/useMobileInvoiceForm';
import { ProductSelectionModal } from '@/components/invoices/ProductSelectionModal';
import MobileInvoiceHeader from '@/components/invoices/mobile/MobileInvoiceHeader';
import CustomerSelectionCard from '@/components/invoices/mobile/CustomerSelectionCard';
import ProductSearchCard from '@/components/invoices/mobile/ProductSearchCard';
import SelectedItemsCard from '@/components/invoices/mobile/SelectedItemsCard';
import InvoiceDetailsCard from '@/components/invoices/mobile/InvoiceDetailsCard';
import InvoiceSummaryCard from '@/components/invoices/mobile/InvoiceSummaryCard';

const MobileInvoiceForm = () => {
  const {
    // State
    customerId,
    setCustomerId,
    date,
    setDate,
    dueDate,
    setDueDate,
    items,
    notes,
    setNotes,
    discount,
    setDiscount,
    isFreeOfCharge,
    setIsFreeOfCharge,
    searchTerm,
    setSearchTerm,
    isProductModalOpen,
    setIsProductModalOpen,
    
    // Computed values
    subtotal,
    total,
    displayProducts,
    
    // Data
    customers,
    createInvoice,
    
    // Actions
    addProductFromSearch,
    addItemFromModal,
    updateItemQuantity,
    updateItemPrice,
    removeItem,
    handleSubmit,
    
    // Navigation
    navigate
  } = useMobileInvoiceForm();

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileInvoiceHeader onBack={() => navigate('/invoices')} />

      {/* Main Content with proper bottom padding for fixed button */}
      <div className="p-4 space-y-6 pb-24">
        <CustomerSelectionCard
          customerId={customerId}
          setCustomerId={setCustomerId}
          customers={customers}
        />

        <ProductSearchCard
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          displayProducts={displayProducts}
          addProductFromSearch={addProductFromSearch}
          setIsProductModalOpen={setIsProductModalOpen}
        />

        <SelectedItemsCard
          items={items}
          updateItemQuantity={updateItemQuantity}
          updateItemPrice={updateItemPrice}
          removeItem={removeItem}
        />

        <InvoiceDetailsCard
          date={date}
          setDate={setDate}
          dueDate={dueDate}
          setDueDate={setDueDate}
          notes={notes}
          setNotes={setNotes}
          discount={discount}
          setDiscount={setDiscount}
          isFreeOfCharge={isFreeOfCharge}
          setIsFreeOfCharge={setIsFreeOfCharge}
        />

        <InvoiceSummaryCard
          subtotal={subtotal}
          discount={discount}
          total={total}
          isFreeOfCharge={isFreeOfCharge}
        />
      </div>

      {/* Fixed Bottom Submit Button - This should always be visible */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-20">
        <Button
          onClick={handleSubmit}
          disabled={createInvoice.isPending || !customerId || items.length === 0}
          className="w-full h-14 text-lg font-medium"
        >
          {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
        </Button>
      </div>

      {/* Product Selection Modal */}
      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelectProduct={addItemFromModal}
      />
    </div>
  );
};

export default MobileInvoiceForm;
