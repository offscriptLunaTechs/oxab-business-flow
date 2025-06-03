
import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserMenu from "./UserMenu";
import { useIsMobile } from "@/hooks/use-mobile";

interface TopBarProps {
  onMenuClick?: () => void;
}

const TopBar = ({ onMenuClick }: TopBarProps) => {
  const isMobile = useIsMobile();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {!isMobile && onMenuClick && (
            <Button variant="ghost" size="sm" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {isMobile && (
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/6abd5e80-9b24-4219-a5f3-0eb2e7eac5f6.png" 
                alt="KECC" 
                className="h-8 w-8"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">KECC</h1>
              </div>
            </div>
          )}

          {!isMobile && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search customers, invoices..." 
                className="pl-10 w-80"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
