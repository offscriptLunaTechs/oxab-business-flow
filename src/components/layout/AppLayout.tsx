
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import DesktopSidebar from "./DesktopSidebar";
import MobileNav from "./MobileNav";
import TopBar from "./TopBar";
import Dashboard from "@/pages/dashboard/Dashboard";
import Customers from "@/pages/customers/Customers";
import Inventory from "@/pages/inventory/Inventory";
import InvoicesList from "@/pages/invoices/InvoicesList";
import InvoiceDetail from "@/pages/invoices/InvoiceDetail";
import CreateInvoice from "@/pages/invoices/CreateInvoice";
import EditInvoice from "@/pages/invoices/EditInvoice";
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
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/invoices" element={<InvoicesList />} />
                <Route path="/invoices/new" element={<CreateInvoice />} />
                <Route path="/invoices/:invoiceId" element={<InvoiceDetail />} />
                <Route path="/invoices/:invoiceId/edit" element={<EditInvoice />} />
                <Route path="/reports/outstanding-invoices" element={<OutstandingInvoicesReport />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/users" element={<Users />} />
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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/invoices" element={<InvoicesList />} />
              <Route path="/invoices/new" element={<CreateInvoice />} />
              <Route path="/invoices/:invoiceId" element={<InvoiceDetail />} />
              <Route path="/invoices/:invoiceId/edit" element={<EditInvoice />} />
              <Route path="/reports/outstanding-invoices" element={<OutstandingInvoicesReport />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/users" element={<Users />} />
            </Routes>
          </main>
          <MobileNav />
        </div>
      )}
    </div>
  );
};

export default AppLayout;
