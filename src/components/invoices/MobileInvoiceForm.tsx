
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
    <div className="min-h-screen bg-gray-50 relative">
      <MobileInvoiceHeader onBack={() => navigate('/invoices')} />

      {/* Main Content with proper bottom padding for fixed/sticky button */}
      <div className="p-4 space-y-6 pb-44 sm:pb-32">
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

      {/* Fixed/Sticky Bottom Submit Button - now extremely robust */}
      <div
        className={`
          md:fixed md:bottom-0 md:left-0 md:right-0
          md:z-[100] z-[99]
          bottom-0 left-0 right-0
          border-t
          bg-white
          shadow-2xl
          pb-[env(safe-area-inset-bottom)] 
          px-4
          sm:px-4
          ${createInvoice.isPending ? 'opacity-95' : 'opacity-100'}
        `}
        style={{
          position: 'sticky',
          bottom: 0,
          // Add fallback for older browsers:
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
          border: '2px solid #dc2626',        // TEMP debug: thick red border
          background: '#fff1f1',               // TEMP debug: pale red background
        }}
        data-debug="Button should be always visible"
      >
        <Button
          onClick={handleSubmit}
          disabled={createInvoice.isPending || !customerId || items.length === 0}
          className="w-full h-16 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl"
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
