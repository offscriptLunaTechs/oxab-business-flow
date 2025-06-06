
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GenerateStatementData {
  customerId: string;
  startDate: string;
  endDate: string;
}

interface StatementResult {
  statement_id: string;
  customer_name: string;
  customer_code: string;
  opening_balance: number;
  closing_balance: number;
  total_outstanding: number;
  invoice_count: number;
}

export const useGenerateStatement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ customerId, startDate, endDate }: GenerateStatementData): Promise<StatementResult> => {
      const { data, error } = await supabase.rpc('generate_customer_statement', {
        p_customer_id: customerId,
        p_start_date: startDate,
        p_end_date: endDate
      });

      if (error) throw error;
      return data[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer-statements'] });
      toast({
        title: "Success",
        description: `Statement generated for ${data.customer_name}`,
      });
    },
    onError: (error) => {
      console.error('Generate statement error:', error);
      toast({
        title: "Error",
        description: "Failed to generate statement",
        variant: "destructive",
      });
    },
  });
};
