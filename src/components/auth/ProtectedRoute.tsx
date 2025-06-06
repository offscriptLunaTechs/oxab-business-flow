
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "manager" | "employee";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/login");
      return;
    }

    if (!loading && user && requiredRole) {
      const hasPermission = checkPermission(userRole, requiredRole);
      if (!hasPermission) {
        navigate("/dashboard");
      }
    }
  }, [user, userRole, loading, navigate, requiredRole]);

  const checkPermission = (userRole: string | null, requiredRole: string): boolean => {
    if (!userRole) return false;
    
    switch (requiredRole) {
      case 'employee':
        return ['admin', 'manager', 'employee'].includes(userRole);
      case 'manager':
        return ['admin', 'manager'].includes(userRole);
      case 'admin':
        return userRole === 'admin';
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 mt-4">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (requiredRole && !checkPermission(userRole, requiredRole)) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
};

export default ProtectedRoute;
