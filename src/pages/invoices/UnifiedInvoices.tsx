
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useInvoiceFilters } from '@/hooks/useInvoiceFilters';
import InvoiceFilters from '@/components/invoices/InvoiceFilters';
import MobileInvoiceFilters from '@/components/invoices/MobileInvoiceFilters';
import InvoicesHeader from '@/components/invoices/InvoicesHeader';
import InvoiceTabsContainer from '@/components/invoices/InvoiceTabsContainer';

const UnifiedInvoices = () => {
  const isMobile = useIsMobile();
  
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    customerFilter,
    setCustomerFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    minAmount,
    setMinAmount,
    downloadingInvoiceId,
    setDownloadingInvoiceId,
    allInvoices,
    customers,
    filteredInvoices,
    invoicesLoading,
    invoicesError,
    clearFilters,
    outstandingFilters,
  } = useInvoiceFilters();

  if (invoicesError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading invoices: {invoicesError.message}</p>
      </div>
    );
  }

  const FilterComponent = isMobile ? MobileInvoiceFilters : InvoiceFilters;

  return (
    <div className="space-y-6">
      <InvoicesHeader />

      <FilterComponent
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        customerFilter={customerFilter}
        setCustomerFilter={setCustomerFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        minAmount={minAmount}
        setMinAmount={setMinAmount}
        customers={customers}
        onClearFilters={clearFilters}
      />

      <InvoiceTabsContainer
        filteredInvoices={filteredInvoices}
        invoicesLoading={invoicesLoading}
        downloadingInvoiceId={downloadingInvoiceId}
        setDownloadingInvoiceId={setDownloadingInvoiceId}
        outstandingFilters={outstandingFilters}
        allInvoices={allInvoices}
      />
    </div>
  );
};

export default UnifiedInvoices;
