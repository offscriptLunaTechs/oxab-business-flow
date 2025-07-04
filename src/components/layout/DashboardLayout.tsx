
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import DesktopSidebar from "./DesktopSidebar";
import MobileNav from "./MobileNav";
import TopBar from "./TopBar";
import Dashboard from "@/pages/dashboard/Dashboard";

const DashboardLayout = () => {
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
                <Route index element={<Dashboard />} />
                <Route path="*" element={<Dashboard />} />
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
              <Route index element={<Dashboard />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </main>
          <MobileNav />
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
