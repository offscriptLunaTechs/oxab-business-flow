
import { useState } from 'react';
import { useInvoices } from '@/hooks/useInvoices';
import { useCustomers } from '@/hooks/useCustomers';

export const useInvoiceFilters = () => {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [minAmount, setMinAmount] = useState<number | undefined>();
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  // Data hooks
  const { data: allInvoices, isLoading: invoicesLoading, error: invoicesError } = useInvoices();
  const { data: customers = [] } = useCustomers();

  // Filter all invoices
  const filteredInvoices = allInvoices?.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    const matchesCustomer = customerFilter === 'all' || invoice.customer_id === customerFilter;
    
    const matchesStartDate = !startDate || new Date(invoice.date) >= startDate;
    const matchesEndDate = !endDate || new Date(invoice.date) <= endDate;
    
    const matchesMinAmount = !minAmount || Number(invoice.total) >= minAmount;
    
    return matchesSearch && matchesStatus && matchesCustomer && matchesStartDate && matchesEndDate && matchesMinAmount;
  }) || [];

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCustomerFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setMinAmount(undefined);
  };

  // Outstanding invoices filters
  const outstandingFilters = {
    customerId: customerFilter !== 'all' ? customerFilter : undefined,
    startDate,
    endDate,
    minAmount,
  };

  return {
    // Filter states
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
    
    // Data
    allInvoices,
    customers,
    filteredInvoices,
    invoicesLoading,
    invoicesError,
    
    // Functions
    clearFilters,
    outstandingFilters,
  };
};
