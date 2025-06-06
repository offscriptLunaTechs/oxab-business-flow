
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { RateLimiter } from '@/utils/rateLimiter';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EnhancedLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [resetTime, setResetTime] = useState<Date | null>(null);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    const rateCheck = await RateLimiter.checkRateLimit('auth/signin');
    
    if (!rateCheck.allowed) {
      setRateLimited(true);
      setResetTime(rateCheck.resetTime);
      await RateLimiter.logRateLimitViolation('auth/signin', null);
      toast.error(`Too many login attempts. Please try again after ${rateCheck.resetTime.toLocaleTimeString()}`);
      return;
    }

    setIsLoading(true);
    setRateLimited(false);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error('Invalid email or password');
      } else {
        toast.success('Successfully signed in!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your KECC Business account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rateLimited && resetTime && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Too many login attempts. Please try again after {resetTime.toLocaleTimeString()}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || rateLimited}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || rateLimited}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || rateLimited}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || rateLimited}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          
          <Separator className="my-6" />
          
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Don't have an account?{' '}
            </span>
            <Link 
              to="/auth/signup" 
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up
            </Link>
          </div>
          
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Secured with enterprise-grade encryption</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedLogin;
