import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/useMediaQuery';

export default function AppLayout() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('Usuario');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadUserData();
  }, []);

  // Force close sidebar on mobile when component mounts or when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Debug logging for Safari iOS troubleshooting
  useEffect(() => {
    console.log('=== AppLayout Debug Info ===');
    console.log('isMobile:', isMobile);
    console.log('window.innerWidth:', window.innerWidth);
    console.log('window.innerHeight:', window.innerHeight);
    console.log('isSidebarOpen:', isSidebarOpen);
    console.log('userAgent:', navigator.userAgent);
    console.log('===========================');
  }, [isMobile, isSidebarOpen]);

  async function loadUserData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setUserName(profile.full_name || 'Usuario');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  const toggleSidebar = () => {
    console.log('Toggling sidebar. Current state:', isSidebarOpen);
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Hamburger Menu Button - Fixed position, ALWAYS visible on mobile */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-[60] p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition-colors"
          style={{
            // Force styles for Safari iOS
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 60,
          }}
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6 text-slate-700" />
        </button>
      )}

      {/* Overlay/Backdrop - Only on mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          style={{
            // Force styles for Safari iOS
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
          }}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar with mobile detection */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isMobile={isMobile}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Spacer for hamburger button on mobile */}
              {isMobile && <div className="w-10" />}
              
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                HoloCheck Equilibria
              </h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span>{userName}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}