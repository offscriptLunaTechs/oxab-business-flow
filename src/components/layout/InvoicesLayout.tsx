
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import DesktopSidebar from "./DesktopSidebar";
import MobileNav from "./MobileNav";
import TopBar from "./TopBar";
import UnifiedInvoices from "@/pages/invoices/UnifiedInvoices";
import InvoiceDetail from "@/pages/invoices/InvoiceDetail";
import CreateInvoice from "@/pages/invoices/CreateInvoice";
import EditInvoice from "@/pages/invoices/EditInvoice";

const InvoicesLayout = () => {
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
                <Route index element={<UnifiedInvoices />} />
                <Route path="new" element={<CreateInvoice />} />
                <Route path=":invoiceId" element={<InvoiceDetail />} />
                <Route path=":invoiceId/edit" element={<EditInvoice />} />
              </Routes>
            </main>
          </div>
        </>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <div className="min-h-screen pb-20 bg-gray-50">
          <TopBar />
          <main className="min-h-[calc(100vh-80px)] bg-gray-50">
            <Routes>
              <Route index element={<UnifiedInvoices />} />
              <Route path="new" element={<CreateInvoice />} />
              <Route path=":invoiceId" element={<InvoiceDetail />} />
              <Route path=":invoiceId/edit" element={<EditInvoice />} />
            </Routes>
          </main>
          <MobileNav />
        </div>
      )}
    </div>
  );
};

export default InvoicesLayout;
