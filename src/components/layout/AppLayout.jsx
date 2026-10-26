import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const pageInfo = {
  dashboard: ["Dashboard", "A clear overview of your restaurant inventory."],
  inventory: ["Inventory", "Manage products, available stock and minimum levels."],
  bills: ["Purchase bills", "Review supplier invoices and payment status."],
  usage: ["Daily usage", "Record ingredients consumed by the kitchen."],
  reports: ["Reports", "Review purchases and recorded stock consumption."],
};

export default function AppLayout({ activePage, onNavigate, onRefresh, refreshing, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [title, subtitle] = pageInfo[activePage] || pageInfo.dashboard;

  const navigate = (id) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <div className="app-shell container-fluid">
      <div className="row min-vh-100 g-0">
        <aside className="col-lg-2 d-none d-lg-block p-0 border-end">
          <div className="position-sticky top-0 vh-100 overflow-auto">
            <Sidebar activePage={activePage} onNavigate={navigate} />
          </div>
        </aside>

        <main className="col-12 col-lg-10 p-0 bg-body-tertiary">
          <Topbar
            title={title}
            subtitle={subtitle}
            onRefresh={onRefresh}
            refreshing={refreshing}
            onMenu={() => setMobileOpen((open) => !open)}
          />

          {mobileOpen && (
            <div className="d-lg-none border-bottom shadow-sm">
              <Sidebar activePage={activePage} onNavigate={navigate} mobile />
            </div>
          )}

          <div className="p-3 p-md-4 p-xl-5">
            {children}
            <footer className="text-center small text-body-secondary mt-5 pt-3 border-top">
              Lapinoz Nanded Inventory <span className="mx-2">·</span> Restaurant inventory management
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
