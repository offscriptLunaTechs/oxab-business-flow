
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      console.log('Auth still loading...');
      return;
    }
    
    console.log('Auth loaded, user:', user?.email || 'No user');
    
    if (user) {
      console.log('User authenticated, redirecting to dashboard');
      navigate("/dashboard");
    } else {
      console.log('No user, redirecting to login');
      navigate("/login");
    }
  }, [navigate, user, loading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Redirecting...</p>
    </div>
  );
};

export default Index;
