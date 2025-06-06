
import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowMs: number;
}

const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  'auth/signin': { endpoint: 'auth/signin', maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  'auth/signup': { endpoint: 'auth/signup', maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  'invoice/create': { endpoint: 'invoice/create', maxRequests: 50, windowMs: 60 * 60 * 1000 }, // 50 invoices per hour
  'customer/create': { endpoint: 'customer/create', maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 customers per hour
};

export class RateLimiter {
  private static async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  static async checkRateLimit(endpoint: string): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    const userId = await this.getCurrentUserId();
    
    if (!userId) {
      // For unauthenticated users, use a more restrictive approach
      // This would typically use IP-based limiting in production
      return { allowed: true, remaining: 1, resetTime: new Date(Date.now() + 60000) };
    }

    const config = DEFAULT_RATE_LIMITS[endpoint];
    if (!config) {
      // No rate limit configured for this endpoint
      return { allowed: true, remaining: 999, resetTime: new Date(Date.now() + 60000) };
    }

    const windowStart = new Date(Date.now() - config.windowMs);

    try {
      // Check current usage
      const { data: existingLimits, error } = await supabase
        .from('rate_limits')
        .select('request_count, window_start')
        .eq('user_id', userId)
        .eq('endpoint', endpoint)
        .gte('window_start', windowStart.toISOString())
        .order('window_start', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Rate limit check error:', error);
        // Fail open - allow the request if we can't check rate limits
        return { allowed: true, remaining: 1, resetTime: new Date(Date.now() + config.windowMs) };
      }

      const currentLimit = existingLimits?.[0];
      
      if (!currentLimit) {
        // First request in this window
        await supabase
          .from('rate_limits')
          .insert({
            user_id: userId,
            endpoint,
            request_count: 1,
            window_start: new Date().toISOString(),
          });

        return {
          allowed: true,
          remaining: config.maxRequests - 1,
          resetTime: new Date(Date.now() + config.windowMs),
        };
      }

      if (currentLimit.request_count >= config.maxRequests) {
        // Rate limit exceeded
        const resetTime = new Date(new Date(currentLimit.window_start).getTime() + config.windowMs);
        return {
          allowed: false,
          remaining: 0,
          resetTime,
        };
      }

      // Increment the counter
      await supabase
        .from('rate_limits')
        .update({ request_count: currentLimit.request_count + 1 })
        .eq('user_id', userId)
        .eq('endpoint', endpoint)
        .eq('window_start', currentLimit.window_start);

      return {
        allowed: true,
        remaining: config.maxRequests - currentLimit.request_count - 1,
        resetTime: new Date(new Date(currentLimit.window_start).getTime() + config.windowMs),
      };

    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open - allow the request if rate limiting fails
      return { allowed: true, remaining: 1, resetTime: new Date(Date.now() + config.windowMs) };
    }
  }

  static async logRateLimitViolation(endpoint: string, userId: string | null): Promise<void> {
    try {
      await supabase.rpc('log_security_event', {
        event_type: 'rate_limit_exceeded',
        table_name: 'rate_limits',
        severity: 'warning'
      });
    } catch (error) {
      console.error('Failed to log rate limit violation:', error);
    }
  }
}
