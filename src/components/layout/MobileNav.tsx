
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Users,
  Settings,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const MobileNav = () => {
  const location = useLocation();
  const { userRole } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Reports", href: "/reports", icon: BarChart3 },
  ];

  // Add Settings for admin users (now includes profile)
  if (userRole === 'admin') {
    navigation.push({ name: "Settings", href: "/settings", icon: Settings });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <nav className="flex items-center justify-around">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors min-w-0",
                isActive
                  ? "text-blue-600"
                  : "text-gray-600"
              )}
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNav;
