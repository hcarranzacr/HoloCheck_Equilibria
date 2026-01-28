import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { BrandingProvider } from "./contexts/BrandingContext";
import { Toaster } from "./components/ui/toaster";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeScan from "./pages/employee/Scan";
import EmployeeHistory from "./pages/employee/History";
import EmployeeProfile from "./pages/employee/Profile";
import EmployeeRecommendations from "./pages/employee/Recommendations";
import LeaderDashboard from "./pages/leader/Dashboard";
import LeaderTeam from "./pages/leader/team";
import LeaderAIAnalyses from "./pages/leader/ai-analyses";
import LeaderInsights from "./pages/leader/insights";
import HRDashboard from "./pages/hr/Dashboard";
import HREmployees from "./pages/hr/employees";
import HRReports from "./pages/hr/reports";
import HRSettings from "./pages/hr/settings";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrganizations from "./pages/admin/organizations";
import AdminUsers from "./pages/admin/users";
import AdminSystem from "./pages/admin/system";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <BrandingProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              {/* Employee Routes */}
              <Route path="/employee/dashboard" element={<RoleBasedRoute allowedRoles={['employee']}><EmployeeDashboard /></RoleBasedRoute>} />
              <Route path="/employee/scan" element={<RoleBasedRoute allowedRoles={['employee']}><EmployeeScan /></RoleBasedRoute>} />
              <Route path="/employee/history" element={<RoleBasedRoute allowedRoles={['employee']}><EmployeeHistory /></RoleBasedRoute>} />
              <Route path="/employee/profile" element={<RoleBasedRoute allowedRoles={['employee']}><EmployeeProfile /></RoleBasedRoute>} />
              <Route path="/employee/recommendations" element={<RoleBasedRoute allowedRoles={['employee']}><EmployeeRecommendations /></RoleBasedRoute>} />
              
              {/* Leader Routes */}
              <Route path="/leader/dashboard" element={<RoleBasedRoute allowedRoles={['leader']}><LeaderDashboard /></RoleBasedRoute>} />
              <Route path="/leader/team" element={<RoleBasedRoute allowedRoles={['leader']}><LeaderTeam /></RoleBasedRoute>} />
              <Route path="/leader/ai-analyses" element={<RoleBasedRoute allowedRoles={['leader']}><LeaderAIAnalyses /></RoleBasedRoute>} />
              <Route path="/leader/insights" element={<RoleBasedRoute allowedRoles={['leader']}><LeaderInsights /></RoleBasedRoute>} />
              
              {/* HR Routes */}
              <Route path="/hr/dashboard" element={<RoleBasedRoute allowedRoles={['hr']}><HRDashboard /></RoleBasedRoute>} />
              <Route path="/hr/employees" element={<RoleBasedRoute allowedRoles={['hr']}><HREmployees /></RoleBasedRoute>} />
              <Route path="/hr/reports" element={<RoleBasedRoute allowedRoles={['hr']}><HRReports /></RoleBasedRoute>} />
              <Route path="/hr/settings" element={<RoleBasedRoute allowedRoles={['hr']}><HRSettings /></RoleBasedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<RoleBasedRoute allowedRoles={['admin']}><AdminDashboard /></RoleBasedRoute>} />
              <Route path="/admin/organizations" element={<RoleBasedRoute allowedRoles={['admin']}><AdminOrganizations /></RoleBasedRoute>} />
              <Route path="/admin/users" element={<RoleBasedRoute allowedRoles={['admin']}><AdminUsers /></RoleBasedRoute>} />
              <Route path="/admin/system" element={<RoleBasedRoute allowedRoles={['admin']}><AdminSystem /></RoleBasedRoute>} />
              
              {/* Profile Route (accessible to all authenticated users) */}
              <Route path="/profile" element={<Profile />} />
              
              {/* Default redirect based on role */}
              <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </BrandingProvider>
    </AuthProvider>
  );
}

export default App;