
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { CreditCard, Receipt } from 'lucide-react';
import { CustomerPayment } from '@/hooks/useCustomerPayments';

interface PaymentHistoryProps {
  payments: CustomerPayment[];
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments }) => {
  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No payments recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment History ({payments.length} payments)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Receipt className="h-4 w-4 text-green-600" />
                    <span className="font-medium">KWD {Number(payment.amount).toFixed(3)}</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {payment.payment_method.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                  </p>
                  {payment.reference_number && (
                    <p className="text-xs text-gray-500">Ref: {payment.reference_number}</p>
                  )}
                  {payment.notes && (
                    <p className="text-xs text-gray-500 mt-1">{payment.notes}</p>
                  )}
                </div>
              </div>
              
              {/* Show allocation details if available */}
              {(payment as any).invoice_payments && (payment as any).invoice_payments.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium text-gray-700 mb-2">Applied to invoices:</p>
                  <div className="space-y-1">
                    {(payment as any).invoice_payments.map((allocation: any) => (
                      <div key={allocation.id} className="flex justify-between text-xs">
                        <span>Invoice {allocation.invoice_id}</span>
                        <span>KWD {Number(allocation.allocated_amount).toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
