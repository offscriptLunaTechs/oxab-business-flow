
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import DesktopSidebar from "./DesktopSidebar";
import MobileNav from "./MobileNav";
import TopBar from "./TopBar";
import Inventory from "@/pages/inventory/Inventory";
import OutstandingInvoicesReport from "@/pages/reports/OutstandingInvoicesReport";
import Profile from "@/pages/profile/Profile";
import Settings from "@/pages/settings/Settings";
import Users from "@/pages/settings/Users";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      {!isMobile && (
        <>
          <DesktopSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
            <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <main className="p-6">
              <Routes>
                {/* Inventory routes */}
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/inventory/*" element={<Inventory />} />
                
                {/* Reports routes */}
                <Route path="/reports/outstanding-invoices" element={<OutstandingInvoicesReport />} />
                <Route path="/reports/*" element={<OutstandingInvoicesReport />} />
                
                {/* Profile routes */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/*" element={<Profile />} />
                
                {/* Settings routes */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/users" element={<Users />} />
                <Route path="/settings/*" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <div className="min-h-screen pb-16">
          <TopBar />
          <main className="p-4">
            <Routes>
              {/* Inventory routes */}
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/*" element={<Inventory />} />
              
              {/* Reports routes */}
              <Route path="/reports/outstanding-invoices" element={<OutstandingInvoicesReport />} />
              <Route path="/reports/*" element={<OutstandingInvoicesReport />} />
              
              {/* Profile routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/*" element={<Profile />} />
              
              {/* Settings routes */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/users" element={<Users />} />
              <Route path="/settings/*" element={<Settings />} />
            </Routes>
          </main>
          <MobileNav />
        </div>
      )}
    </div>
  );
};

export default AppLayout;
