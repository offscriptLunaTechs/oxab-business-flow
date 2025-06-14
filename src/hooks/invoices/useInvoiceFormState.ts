
import { useState } from 'react';
import { addDays } from 'date-fns';

export const useInvoiceFormState = () => {
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(addDays(new Date(), 30));
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isFreeOfCharge, setIsFreeOfCharge] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  return {
    customerId,
    setCustomerId,
    date,
    setDate,
    dueDate,
    setDueDate,
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
  };
};
