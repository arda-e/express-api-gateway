import React from "react";
import { AuthProvider, useAuth } from "./components/AuthContext";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";

const Redirect = ({ to }: { to: string }) => {
  if (typeof window !== "undefined") {
    window.location.href = to;
  }
  return null;
};

interface AppProps {
  initialData?: any;
  path?: string;
}

const AppContent = ({ initialData, path }: AppProps) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : path || "";

  if (!isAuthenticated) {
    return currentPath === "/login" ? <Login /> : <Redirect to="/login" />;
  }
  if (!isAdmin) {
    return <Redirect to="/login" />;
  }
  if (currentPath.startsWith("/admin")) {
    return <AdminDashboard {...initialData} />;
  }
  return <Redirect to="/admin/dashboard" />;
};

const App = (props: AppProps) => (
  <AuthProvider>
    <AppContent {...props} />
  </AuthProvider>
);

export default App;
