
import { useAuth } from "@/context/AuthContext";

export const usePermissions = () => {
  const { userRole } = useAuth();

  const hasRole = (requiredRole: 'admin' | 'manager' | 'employee') => {
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

  const can = {
    viewDashboard: () => true,
    manageUsers: () => hasRole('admin'),
    createInvoice: () => hasRole('employee'),
    editInvoice: () => hasRole('manager'),
    deleteInvoice: () => hasRole('manager'),
    manageInventory: () => hasRole('manager'),
    viewAuditLogs: () => hasRole('manager'),
    manageSettings: () => hasRole('admin'),
  };

  return { hasRole, can };
};
