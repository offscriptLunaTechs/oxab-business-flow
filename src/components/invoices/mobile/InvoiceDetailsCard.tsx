
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';

interface InvoiceDetailsCardProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
  notes: string;
  setNotes: (notes: string) => void;
  discount: number;
  setDiscount: (discount: number) => void;
  isFreeOfCharge: boolean;
  setIsFreeOfCharge: (value: boolean) => void;
}

const InvoiceDetailsCard = ({
  date,
  setDate,
  dueDate,
  setDueDate,
  notes,
  setNotes,
  discount,
  setDiscount,
  isFreeOfCharge,
  setIsFreeOfCharge
}: InvoiceDetailsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Invoice Date</Label>
            <DatePicker
              date={date}
              onDateChange={setDate}
              placeholder="Pick invoice date"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Due Date</Label>
            <DatePicker
              date={dueDate}
              onDateChange={setDueDate}
              placeholder="Pick due date"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes..."
            className="h-12 text-base"
          />
        </div>

        <div className="flex items-center space-x-3">
          <Checkbox
            id="free-of-charge"
            checked={isFreeOfCharge}
            onCheckedChange={(checked) => setIsFreeOfCharge(checked === true)}
          />
          <Label htmlFor="free-of-charge" className="text-sm font-medium">
            Mark as Free of Charge
          </Label>
        </div>

        <div>
          <Label htmlFor="discount" className="text-sm font-medium">Discount Amount</Label>
          <Input
            type="number"
            id="discount"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            disabled={isFreeOfCharge}
            step="0.001"
            className="h-12 text-base"
            placeholder="0.000"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceDetailsCard;
