import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 [AuthCallback] Processing authentication callback');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ [AuthCallback] Error getting session:', error);
          navigate('/login');
          return;
        }

        if (session) {
          console.log('✅ [AuthCallback] Session established, redirecting to home');
          navigate('/');
        } else {
          console.log('⚠️ [AuthCallback] No session found, redirecting to login');
          navigate('/login');
        }
      } catch (err) {
        console.error('❌ [AuthCallback] Unexpected error:', err);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-4" />
        <p className="text-slate-600">Procesando autenticación...</p>
      </div>
    </div>
  );
}