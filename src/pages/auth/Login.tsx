import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, UserPlus, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Register state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Error states
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Login error:", error);
        let errorMessage = "Login failed. Please check your credentials.";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email and confirm your account before signing in.";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Too many login attempts. Please wait a moment before trying again.";
        }
        
        setLoginError(errorMessage);
        toast.error(errorMessage);
        return;
      }
      
      // Success - navigation will be handled by auth context
      toast.success("Successfully signed in!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Unexpected login error:", error);
      const errorMessage = "An unexpected error occurred. Please try again.";
      setLoginError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    
    // Show immediate message that registration is disabled
    const errorMessage = "Registration is temporarily disabled. Please contact your IT department for account access.";
    setRegisterError(errorMessage);
    toast.error(errorMessage);
    return;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4">
            <img 
              src="/lovable-uploads/6abd5e80-9b24-4219-a5f3-0eb2e7eac5f6.png" 
              alt="KECC Logo" 
              className="h-16 w-16 mx-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            KECC Business System
          </CardTitle>
        </CardHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 w-[90%] mx-auto">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register" disabled>Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {loginError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="h-12 text-base"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-12 text-base pr-12"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="register">
            <CardContent>
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Registration Temporarily Disabled
                </h3>
                <p className="text-gray-600 mb-4">
                  New user registration is currently disabled. 
                </p>
                <p className="text-sm text-gray-500">
                  Please contact your IT department to request account access.
                </p>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;
