
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { CreditCard, Plus } from 'lucide-react';
import { useCreateCustomerPayment } from '@/hooks/useCustomerPayments';
import { useToast } from '@/hooks/use-toast';

interface PaymentEntryProps {
  customerId: string;
  customerName: string;
  onPaymentAdded?: () => void;
}

export const PaymentEntry: React.FC<PaymentEntryProps> = ({
  customerId,
  customerName,
  onPaymentAdded
}) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const createPayment = useCreateCustomerPayment();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }

    try {
      await createPayment.mutateAsync({
        customer_id: customerId,
        amount: parseFloat(amount),
        payment_date: paymentDate.toISOString().split('T')[0],
        payment_method: paymentMethod,
        reference_number: referenceNumber || undefined,
        notes: notes || undefined,
      });

      toast({
        title: "Payment Added",
        description: `Payment of KWD ${amount} has been recorded and allocated to invoices`,
      });

      // Reset form
      setAmount('');
      setReferenceNumber('');
      setNotes('');
      setPaymentDate(new Date());
      setIsOpen(false);
      
      if (onPaymentAdded) {
        onPaymentAdded();
      }
    } catch (error) {
      console.error('Failed to create payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full"
        variant="outline"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Payment / Credit
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Add Payment for {customerName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount (KWD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.000"
                required
              />
            </div>
            <div>
              <Label>Payment Date</Label>
              <DatePicker
                date={paymentDate}
                onDateChange={(date) => date && setPaymentDate(date)}
                placeholder="Select payment date"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Optional reference"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={createPayment.isPending}
              className="flex-1"
            >
              {createPayment.isPending ? 'Processing...' : 'Add Payment'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
