
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileInvoiceForm from '@/components/invoices/creation/MobileInvoiceForm';
import DesktopInvoiceForm from '@/components/invoices/creation/DesktopInvoiceForm';

const CreateInvoice = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileInvoiceForm />;
  }

  return <DesktopInvoiceForm />;
};

export default CreateInvoice;
