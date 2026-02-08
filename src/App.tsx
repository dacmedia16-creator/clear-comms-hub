import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import SignupTypePage from "./pages/auth/SignupTypePage";
import SignupMemberPage from "./pages/auth/SignupMemberPage";
import SignupManagerPage from "./pages/auth/SignupManagerPage";
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
import SuperAdminReferrals from "./pages/super-admin/SuperAdminReferrals";
import SuperAdminPlans from "./pages/super-admin/SuperAdminPlans";
import ProfilePage from "./pages/ProfilePage";
import DemoPage from "./pages/DemoPage";
import ReferSyndicPage from "./pages/ReferSyndicPage";
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
            {/* New dynamic signup routes */}
            <Route path="/auth/signup/member" element={<SignupMemberPage />} />
            <Route path="/auth/signup/manager" element={<SignupManagerPage />} />
            {/* Legacy redirects for backward compatibility */}
            <Route path="/auth/signup/resident" element={<Navigate to="/auth/signup/member" replace />} />
            <Route path="/auth/signup/syndic" element={<Navigate to="/auth/signup/manager" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/indicar-sindico" element={<ReferSyndicPage />} />
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
            <Route path="/super-admin/referrals" element={<SuperAdminReferrals />} />
            <Route path="/super-admin/plans" element={<SuperAdminPlans />} />
            <Route path="/super-admin/whatsapp" element={<Navigate to="/super-admin/notifications" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
