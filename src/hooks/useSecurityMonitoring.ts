
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface SecurityEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  table_name: string | null;
  record_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export const useSecurityAuditLogs = (limit: number = 50) => {
  const { userRole } = useAuth();

  return useQuery({
    queryKey: ['security-audit-logs', limit],
    queryFn: async (): Promise<SecurityEvent[]> => {
      if (userRole !== 'admin') {
        throw new Error('Unauthorized: Only admins can view audit logs');
      }

      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching security audit logs:', error);
        throw error;
      }

      // Transform the data to match our SecurityEvent interface
      const transformedData: SecurityEvent[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        event_type: item.event_type,
        table_name: item.table_name,
        record_id: item.record_id,
        old_values: item.old_values,
        new_values: item.new_values,
        ip_address: item.ip_address ? String(item.ip_address) : null,
        user_agent: item.user_agent,
        timestamp: item.timestamp,
        severity: item.severity as 'info' | 'warning' | 'error' | 'critical',
      }));

      return transformedData;
    },
    enabled: userRole === 'admin',
  });
};

export const useSecurityStats = () => {
  const { userRole } = useAuth();

  return useQuery({
    queryKey: ['security-stats'],
    queryFn: async () => {
      if (userRole !== 'admin') {
        throw new Error('Unauthorized: Only admins can view security stats');
      }

      const today = new Date().toISOString().split('T')[0];
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get today's security events
      const { data: todayEvents, error: todayError } = await supabase
        .from('security_audit_logs')
        .select('id, severity')
        .gte('timestamp', today);

      if (todayError) throw todayError;

      // Get this week's failed login attempts
      const { data: failedLogins, error: failedError } = await supabase
        .from('security_audit_logs')
        .select('id')
        .eq('event_type', 'sign_in_failed')
        .gte('timestamp', lastWeek);

      if (failedError) throw failedError;

      // Get critical events in last 24 hours
      const { data: criticalEvents, error: criticalError } = await supabase
        .from('security_audit_logs')
        .select('id')
        .eq('severity', 'critical')
        .gte('timestamp', today);

      if (criticalError) throw criticalError;

      const severityCount = (todayEvents || []).reduce((acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        todayEvents: todayEvents?.length || 0,
        failedLogins: failedLogins?.length || 0,
        criticalEvents: criticalEvents?.length || 0,
        severityBreakdown: severityCount,
      };
    },
    enabled: userRole === 'admin',
  });
};
