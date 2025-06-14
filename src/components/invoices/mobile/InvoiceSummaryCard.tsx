
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InvoiceSummaryCardProps {
  subtotal: number;
  discount: number;
  total: number;
  isFreeOfCharge: boolean;
}

const InvoiceSummaryCard = ({ subtotal, discount, total, isFreeOfCharge }: InvoiceSummaryCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-base">
            <span>Subtotal</span>
            <span>KWD {subtotal.toFixed(3)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-base">
              <span>Discount</span>
              <span>-KWD {discount.toFixed(3)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-3">
            <span>Total</span>
            <span className={isFreeOfCharge ? 'text-green-600' : ''}>
              KWD {total.toFixed(3)}
              {isFreeOfCharge && ' (FREE)'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceSummaryCard;
