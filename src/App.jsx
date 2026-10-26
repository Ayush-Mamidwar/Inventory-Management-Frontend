
import { useCallback, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { inventoryApi } from "./api/inventoryApi";

import AppLayout from "./components/layout/AppLayout";
import AlertMessage from "./components/common/AlertMessage";
import LoadingState from "./components/common/LoadingState";

import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Bills from "./pages/Bills";
import DailyUsage from "./pages/DailyUsage";
import Reports from "./pages/Reports";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [bills, setBills] = useState([]);
  const [usage, setUsage] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load all inventory data from the backend.
  const refreshData = useCallback(async (initial = false) => {
    if (initial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const [productRows, billRows, usageRows] = await Promise.all([
        inventoryApi.getProducts(),
        inventoryApi.getBills(),
        inventoryApi.getUsage(),
      ]);

      setProducts(productRows);
      setBills(billRows);
      setUsage(usageRows);
    } catch (err) {
      setError(err.message || "Could not load data from the API.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshData(true);
  }, [refreshData]);

  // Run an API operation, display feedback, then reload the data.
  const runAction = async (action, successMessage) => {
    setError("");
    setSuccess("");

    try {
      await action();
      setSuccess(successMessage);
      await refreshData(false);
      return true;
    } catch (err) {
      setError(err.message || "The operation could not be completed.");
      return false;
    }
  };

  // Used by the sidebar to highlight the current page.
  const pagePaths = {
    "/": "dashboard",
    "/inventory": "inventory",
    "/bills": "bills",
    "/usage": "usage",
    "/reports": "reports",
  };

  const activePage = pagePaths[location.pathname] || "dashboard";

  const handleNavigate = (page) => {
    const paths = {
      dashboard: "/",
      inventory: "/inventory",
      bills: "/bills",
      usage: "/usage",
      reports: "/reports",
    };

    navigate(paths[page] || "/");
    setError("");
    setSuccess("");
  };

  const sharedProps = {
    products,
    bills,
    usage,
    runAction,
  };

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={handleNavigate}
      onRefresh={() => refreshData(false)}
      refreshing={refreshing}
    >
      <AlertMessage
        type="danger"
        message={error}
        onClose={() => setError("")}
      />

      <AlertMessage
        type="success"
        message={success}
        onClose={() => setSuccess("")}
      />

      {loading ? (
        <LoadingState />
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                {...sharedProps}
                onNavigate={handleNavigate}
              />
            }
          />

          <Route
            path="/inventory"
            element={
              <Inventory
                {...sharedProps}
                createProduct={inventoryApi.createProduct}
                updateProduct={inventoryApi.updateProduct}
              />
            }
          />

          <Route
            path="/bills"
            element={
              <Bills
                {...sharedProps}
                createBill={inventoryApi.createBill}
                setBillSettled={inventoryApi.setBillSettled}
              />
            }
          />

          <Route
            path="/usage"
            element={
              <DailyUsage
                {...sharedProps}
                recordUsage={inventoryApi.recordUsage}
              />
            }
          />

          <Route
            path="/reports"
            element={<Reports {...sharedProps} />}
          />

          {/* Redirect unknown URLs to the dashboard. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </AppLayout>
  );
}
