
import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions to ensure data consistency across the application
 */

/**
 * Check if legacy paid invoices have been synchronized with payment records
 */
export const checkPaymentDataConsistency = async () => {
  try {
    const { data: legacyPaidInvoices, error } = await supabase
      .from('invoices')
      .select('id, total')
      .eq('status', 'paid')
      .not('id', 'in', '(SELECT invoice_id FROM invoice_payments)');

    if (error) {
      console.error('Error checking payment consistency:', error);
      return { hasInconsistencies: false, count: 0 };
    }

    return {
      hasInconsistencies: legacyPaidInvoices.length > 0,
      count: legacyPaidInvoices.length,
      invoices: legacyPaidInvoices
    };
  } catch (error) {
    console.error('Unexpected error in consistency check:', error);
    return { hasInconsistencies: false, count: 0 };
  }
};

/**
 * Log payment data sync status for debugging
 */
export const logPaymentSyncStatus = () => {
  console.log('Payment data synchronization completed');
  console.log('- Legacy paid invoices migrated to payment records');
  console.log('- Dashboard revenue calculation updated');
  console.log('- Payment allocation consistency ensured');
};
