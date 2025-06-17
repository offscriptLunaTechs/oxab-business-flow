
import React from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoiceCreation } from '@/hooks/invoices/creation/useInvoiceCreation';
import { useInvoiceSubmission } from '@/hooks/invoices/creation/useInvoiceSubmission';
import { useCustomerPricing } from '@/hooks/invoices/useCustomerPricing';
import { ProductSelectionModal } from '@/components/invoices/ProductSelectionModal';
import MobileInvoiceHeader from '@/components/invoices/mobile/MobileInvoiceHeader';
import CustomerSelector from './CustomerSelector';
import ProductSelector from './ProductSelector';
import InvoiceItems from './InvoiceItems';
import InvoiceDetailsCard from '@/components/invoices/mobile/InvoiceDetailsCard';
import InvoiceSummaryCard from '@/components/invoices/mobile/InvoiceSummaryCard';
import { Product } from '@/types/invoice';

const MobileInvoiceForm = () => {
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
    searchTerm,
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
    setSearchTerm,
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
    <div className="min-h-screen bg-gray-50">
      <MobileInvoiceHeader onBack={() => window.history.back()} />

      <div className="p-4 space-y-6 pb-6">
        <CustomerSelector
          customerId={customerId}
          onCustomerChange={setCustomerId}
          customers={customers}
          isMobile
        />

        <ProductSelector
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onProductSelect={handleProductSelect}
          onBrowseClick={() => setIsProductModalOpen(true)}
          isLoading={isSubmitting}
          isMobile
        />

        <InvoiceItems
          items={itemsArray}
          onUpdateQuantity={updateItemQuantity}
          onUpdatePrice={updateItemPrice}
          onRemoveItem={removeItem}
          isMobile
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
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isDisabled={!customerId || itemsArray.length === 0}
        />
      </div>

      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelectProduct={handleProductSelect}
      />
    </div>
  );
};

export default MobileInvoiceForm;
