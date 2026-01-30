import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import SignupTypePage from "./pages/auth/SignupTypePage";
import SignupResidentPage from "./pages/auth/SignupResidentPage";
import SignupSyndicPage from "./pages/auth/SignupSyndicPage";
import DashboardPage from "./pages/DashboardPage";
import AdminCondominiumPage from "./pages/AdminCondominiumPage";
import CondoMembersPage from "./pages/CondoMembersPage";
import CondominiumSettingsPage from "./pages/CondominiumSettingsPage";
import TimelinePage from "./pages/TimelinePage";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import SuperAdminCondominiums from "./pages/super-admin/SuperAdminCondominiums";
import SuperAdminCondoMembers from "./pages/super-admin/SuperAdminCondoMembers";
import SuperAdminUsers from "./pages/super-admin/SuperAdminUsers";
import SuperAdminTimelines from "./pages/super-admin/SuperAdminTimelines";
import SuperAdminNotifications from "./pages/super-admin/SuperAdminNotifications";
import ProfilePage from "./pages/ProfilePage";
import DemoPage from "./pages/DemoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/signup" element={<SignupTypePage />} />
            <Route path="/auth/signup/resident" element={<SignupResidentPage />} />
            <Route path="/auth/signup/syndic" element={<SignupSyndicPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/:condoId" element={<AdminCondominiumPage />} />
            <Route path="/admin/:condoId/settings" element={<CondominiumSettingsPage />} />
            <Route path="/admin/:condoId/members" element={<CondoMembersPage />} />
            <Route path="/c/:slug" element={<TimelinePage />} />
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/super-admin/condominiums" element={<SuperAdminCondominiums />} />
            <Route path="/super-admin/condominiums/:condoId/members" element={<SuperAdminCondoMembers />} />
            <Route path="/super-admin/users" element={<SuperAdminUsers />} />
            <Route path="/super-admin/timelines" element={<SuperAdminTimelines />} />
            <Route path="/super-admin/notifications" element={<SuperAdminNotifications />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
