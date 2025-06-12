
-- Create customer payments table to track all payments/credits received
CREATE TABLE public.customer_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) NOT NULL,
  amount numeric(10,3) NOT NULL CHECK (amount > 0),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text DEFAULT 'cash',
  reference_number text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_at timestamp with time zone DEFAULT now()
);

-- Create invoice payments allocation table to track which invoices payments are applied to
CREATE TABLE public.invoice_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES public.customer_payments(id) ON DELETE CASCADE NOT NULL,
  invoice_id text REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  allocated_amount numeric(10,3) NOT NULL CHECK (allocated_amount > 0),
  created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for customer payments
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;

-- Policies for customer_payments (allow all operations for authenticated users)
CREATE POLICY "Allow all operations on customer_payments for authenticated users" 
  ON public.customer_payments 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Policies for invoice_payments (allow all operations for authenticated users)
CREATE POLICY "Allow all operations on invoice_payments for authenticated users" 
  ON public.invoice_payments 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Function to automatically allocate payments to invoices (FIFO - oldest first)
CREATE OR REPLACE FUNCTION public.allocate_payment_to_invoices(
  p_payment_id uuid,
  p_customer_id uuid,
  p_amount numeric
) RETURNS void AS $$
DECLARE
  invoice_record RECORD;
  remaining_amount numeric := p_amount;
  allocation_amount numeric;
BEGIN
  -- Get unpaid invoices for the customer, ordered by date (oldest first)
  FOR invoice_record IN 
    SELECT 
      i.id,
      i.total,
      COALESCE(SUM(ip.allocated_amount), 0) as paid_amount,
      (i.total - COALESCE(SUM(ip.allocated_amount), 0)) as outstanding_amount
    FROM public.invoices i
    LEFT JOIN public.invoice_payments ip ON i.id = ip.invoice_id
    WHERE i.customer_id = p_customer_id 
      AND i.status IN ('pending', 'overdue')
    GROUP BY i.id, i.total, i.date
    HAVING (i.total - COALESCE(SUM(ip.allocated_amount), 0)) > 0
    ORDER BY i.date ASC
  LOOP
    -- Exit if no remaining amount to allocate
    IF remaining_amount <= 0 THEN
      EXIT;
    END IF;
    
    -- Calculate allocation amount (either full outstanding or remaining payment amount)
    allocation_amount := LEAST(remaining_amount, invoice_record.outstanding_amount);
    
    -- Insert payment allocation record
    INSERT INTO public.invoice_payments (
      payment_id,
      invoice_id,
      allocated_amount
    ) VALUES (
      p_payment_id,
      invoice_record.id,
      allocation_amount
    );
    
    -- Update remaining amount
    remaining_amount := remaining_amount - allocation_amount;
    
    -- Update invoice status if fully paid
    UPDATE public.invoices 
    SET status = 'paid', updated_at = now()
    WHERE id = invoice_record.id 
      AND (invoice_record.outstanding_amount - allocation_amount) = 0;
  END LOOP;
  
  -- Log any remaining unallocated amount (this would be a credit balance)
  IF remaining_amount > 0 THEN
    -- Could insert into a customer credit balance table if needed
    RAISE NOTICE 'Unallocated payment amount: % for customer: %', remaining_amount, p_customer_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically allocate payments when a new payment is inserted
CREATE OR REPLACE FUNCTION public.trigger_allocate_payment()
RETURNS trigger AS $$
BEGIN
  -- Call the allocation function
  PERFORM public.allocate_payment_to_invoices(
    NEW.id,
    NEW.customer_id,
    NEW.amount
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER auto_allocate_payment_trigger
  AFTER INSERT ON public.customer_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_allocate_payment();

-- Function to get customer outstanding balance
CREATE OR REPLACE FUNCTION public.get_customer_outstanding_balance(p_customer_id uuid)
RETURNS numeric AS $$
DECLARE
  total_outstanding numeric := 0;
BEGIN
  SELECT COALESCE(SUM(
    i.total - COALESCE(SUM(ip.allocated_amount), 0)
  ), 0) INTO total_outstanding
  FROM public.invoices i
  LEFT JOIN public.invoice_payments ip ON i.id = ip.invoice_id
  WHERE i.customer_id = p_customer_id 
    AND i.status IN ('pending', 'overdue')
  GROUP BY i.id, i.total
  HAVING (i.total - COALESCE(SUM(ip.allocated_amount), 0)) > 0;
  
  RETURN COALESCE(total_outstanding, 0);
END;
$$ LANGUAGE plpgsql;
