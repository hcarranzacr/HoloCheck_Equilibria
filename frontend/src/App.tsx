import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BrandingProvider } from '@/contexts/BrandingContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Public pages
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import LogoutCallbackPage from './pages/LogoutCallbackPage';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard';
import PreScanQuestionnaire from './pages/employee/PreScanQuestionnaire';
import EmployeeScan from './pages/employee/Scan';
import EmployeeHistory from './pages/employee/History';
import EmployeeProfile from './pages/employee/Profile';
import EmployeeRecommendations from './pages/employee/Recommendations';

// Leader pages
import LeaderDashboard from './pages/leader/dashboard';
import LeaderTeam from './pages/leader/team';
import LeaderAIAnalyses from './pages/leader/ai-analyses';
import LeaderInsights from './pages/leader/insights';
import LeaderMeasurements from './pages/leader/measurements';

// HR pages
import HRDashboard from './pages/hr/dashboard';
import HRUsers from './pages/hr/users';
import HRAIAnalyses from './pages/hr/ai-analyses';
import HRInsights from './pages/hr/insights';
import HRMeasurements from './pages/hr/measurements';
import HRUsage from './pages/hr/usage';
import HRAtRisk from './pages/hr/at-risk';

// Org Admin pages
import OrgDashboard from './pages/org/dashboard';
import OrgUsers from './pages/org/users';
import OrgDepartments from './pages/org/departments';
import OrgDepartmentInsights from './pages/org/department-insights';
import OrgMeasurements from './pages/org/measurements';
import OrgAIAnalyses from './pages/org/ai-analyses';
import OrgPrompts from './pages/org/prompts';
import OrgInsights from './pages/org/insights';

// Admin pages
import Organizations from './pages/admin/organizations';
import OrganizationBranding from './pages/admin/organization-branding';
import UsersPage from './pages/admin/users';
import DepartmentsPage from './pages/admin/departments';
import InviteUser from './pages/admin/invite-user';
import AIAnalyses from './pages/admin/ai-analyses';
import GlobalPrompts from './pages/admin/global-prompts';
import SectorsIndustries from './pages/admin/sectors-industries';
import Settings from './pages/admin/settings';
import SubscriptionPlans from './pages/admin/subscription-plans';
import SystemLogs from './pages/admin/system-logs';
import UsageLogs from './pages/admin/usage-logs';
import AdminCreditUsage from './pages/admin/credit-usage';
import AdminPrompts from './pages/admin/prompts';
import AdminPartnerships from './pages/admin/partnerships';
import BenefitsManagement from './pages/admin/BenefitsManagement';

// User Manual
import UserManual from './pages/UserManual';

const queryClient = new QueryClient();

const App = () => {
  console.log('🚀 [App] HoloCheck Equilibria - ALL ROUTES REGISTERED');
  console.log('🎨 [App] Multitenant branding enabled with auto-detection');
  console.log('📋 [App] Employee routes: /employee/dashboard, /employee/recommendations, /employee/scan');
  console.log('📋 [App] Leader routes: /leader/dashboard, /leader/team, /leader/insights');
  console.log('📋 [App] HR routes: /hr/dashboard, /hr/insights, /hr/measurements');
  console.log('📋 [App] Org routes: /org/dashboard, /org/insights, /org/users');
  console.log('📋 [App] Admin routes: /admin/organizations, /admin/partnerships, /admin/benefits-management');
  console.log('📖 [App] User Manual route: /user-manual');
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrandingProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                {/* Public routes WITHOUT layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/logout-callback" element={<LogoutCallbackPage />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Protected routes WITH layout */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    {/* Root redirect */}
                    <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />
                    
                    {/* User Manual - Available for all roles */}
                    <Route path="/user-manual" element={<UserManual />} />
                    
                    {/* Employee routes */}
                    <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                    <Route path="/employee/pre-scan" element={<PreScanQuestionnaire />} />
                    <Route path="/employee/scan" element={<EmployeeScan />} />
                    <Route path="/employee/history" element={<EmployeeHistory />} />
                    <Route path="/employee/profile" element={<EmployeeProfile />} />
                    <Route path="/employee/recommendations" element={<EmployeeRecommendations />} />
                    
                    {/* Leader routes */}
                    <Route path="/leader/dashboard" element={<LeaderDashboard />} />
                    <Route path="/leader/team" element={<LeaderTeam />} />
                    <Route path="/leader/ai-analyses" element={<LeaderAIAnalyses />} />
                    <Route path="/leader/insights" element={<LeaderInsights />} />
                    <Route path="/leader/measurements" element={<LeaderMeasurements />} />
                    
                    {/* HR routes */}
                    <Route path="/hr/dashboard" element={<HRDashboard />} />
                    <Route path="/hr/users" element={<HRUsers />} />
                    <Route path="/hr/ai-analyses" element={<HRAIAnalyses />} />
                    <Route path="/hr/insights" element={<HRInsights />} />
                    <Route path="/hr/measurements" element={<HRMeasurements />} />
                    <Route path="/hr/usage" element={<HRUsage />} />
                    <Route path="/hr/at-risk" element={<HRAtRisk />} />
                    
                    {/* Organization Admin routes */}
                    <Route path="/org/dashboard" element={<OrgDashboard />} />
                    <Route path="/org/users" element={<OrgUsers />} />
                    <Route path="/org/departments" element={<OrgDepartments />} />
                    <Route path="/org/department-insights" element={<OrgDepartmentInsights />} />
                    <Route path="/org/measurements" element={<OrgMeasurements />} />
                    <Route path="/org/ai-analyses" element={<OrgAIAnalyses />} />
                    <Route path="/org/prompts" element={<OrgPrompts />} />
                    <Route path="/org/insights" element={<OrgInsights />} />
                    
                    {/* Platform Admin routes */}
                    <Route path="/admin/organizations" element={<Organizations />} />
                    <Route path="/admin/organization-branding" element={<OrganizationBranding />} />
                    <Route path="/admin/users" element={<UsersPage />} />
                    <Route path="/admin/departments" element={<DepartmentsPage />} />
                    <Route path="/admin/invite-user" element={<InviteUser />} />
                    <Route path="/admin/ai-analyses" element={<AIAnalyses />} />
                    <Route path="/admin/prompts" element={<GlobalPrompts />} />
                    <Route path="/admin/sectors-industries" element={<SectorsIndustries />} />
                    <Route path="/admin/settings" element={<Settings />} />
                    <Route path="/admin/subscription-plans" element={<SubscriptionPlans />} />
                    <Route path="/admin/system-logs" element={<SystemLogs />} />
                    <Route path="/admin/usage-logs" element={<UsageLogs />} />
                    <Route path="/admin/credit-usage" element={<AdminCreditUsage />} />
                    <Route path="/admin/prompts-management" element={<AdminPrompts />} />
                    <Route path="/admin/partnerships" element={<AdminPartnerships />} />
                    <Route path="/admin/benefits-management" element={<BenefitsManagement />} />
                  </Route>
                </Route>
                
                {/* 404 catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </BrandingProvider>
    </QueryClientProvider>
  );
};

export default App;