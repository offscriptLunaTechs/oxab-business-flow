
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Users, 
  Settings,
  Menu
} from "lucide-react";

interface DesktopSidebarProps {
  open: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

const DesktopSidebar = ({ open, onToggle }: DesktopSidebarProps) => {
  const location = useLocation();

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300",
      open ? "w-64" : "w-16"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {open && (
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/6abd5e80-9b24-4219-a5f3-0eb2e7eac5f6.png" 
              alt="KECC" 
              className="h-8 w-8"
            />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">KECC</h1>
              <p className="text-xs text-gray-500">Business System</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", open ? "mr-3" : "mx-auto")} />
                  {open && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default DesktopSidebar;
