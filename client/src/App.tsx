import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ClientsPage from "@/pages/clients-page";
import PropertiesPage from "@/pages/properties-page";
import TransactionsPage from "@/pages/transactions-page";
import DocumentsPage from "@/pages/documents-page";
import ReportsPage from "@/pages/reports-page";
import UsersPage from "@/pages/users-page";
import AccountingPage from "@/pages/accounting-page";

// Layout
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!user) return null;

  const getPageTitle = (pathname: string) => {
    const titles: Record<string, string> = {
      "/": "Dashboard",
      "/clients": "Müşteriler",
      "/properties": "Gayrimenkuller", 
      "/transactions": "İşlemler",
      "/documents": "Belgeler",
      "/reports": "Raporlar",
      "/users": "Kullanıcı Yönetimi",
      "/accounting": "Muhasebe",
    };
    return titles[pathname] || "Dashboard";
  };

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${isMobile ? 'fixed z-50' : 'relative'} h-full`}>
        <Sidebar 
          isMobileOpen={isSidebarOpen} 
          onMobileClose={closeSidebar} 
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={getPageTitle(window.location.pathname)}
          onMenuClick={handleMenuClick}
        />
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <ProtectedRoute 
        path="/" 
        component={() => (
          <DashboardLayout>
            <DashboardPage />
          </DashboardLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/clients" 
        component={() => (
          <DashboardLayout>
            <ClientsPage />
          </DashboardLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/properties" 
        component={() => (
          <DashboardLayout>
            <PropertiesPage />
          </DashboardLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/transactions" 
        component={() => (
          <DashboardLayout>
            <TransactionsPage />
          </DashboardLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/documents" 
        component={() => (
          <DashboardLayout>
            <DocumentsPage />
          </DashboardLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/reports" 
        component={() => (
          <DashboardLayout>
            <ReportsPage />
          </DashboardLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/users" 
        component={() => (
          <DashboardLayout>
            <UsersPage />
          </DashboardLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/accounting" 
        component={() => (
          <DashboardLayout>
            <AccountingPage />
          </DashboardLayout>
        )} 
      />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
