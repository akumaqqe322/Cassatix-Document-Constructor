import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Templates from "./pages/Templates";
import TemplateDetails from "./pages/TemplateDetails";
import GeneratedDocuments from "./pages/GeneratedDocuments";
import Audit from "./pages/Audit";
import { UserRole } from "./types/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Dashboard />} />
              
              <Route path="/templates" element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.LAWYER]}>
                  <Templates />
                </ProtectedRoute>
              } />

              <Route path="/templates/:templateId" element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.LAWYER]}>
                  <TemplateDetails />
                </ProtectedRoute>
              } />
              
              <Route path="/documents" element={<GeneratedDocuments />} />
              
              <Route path="/audit" element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <Audit />
                </ProtectedRoute>
              } />

              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <div className="p-4 bg-white rounded-lg border">Settings Page Placeholder</div>
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
