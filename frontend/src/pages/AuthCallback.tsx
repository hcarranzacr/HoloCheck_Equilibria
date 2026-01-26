import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 [AuthCallback] Processing authentication callback');
      
      try {
        // Get the code from URL params (OAuth callback)
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          console.error('❌ [AuthCallback] OAuth error:', error, errorDescription);
          toast.error(errorDescription || 'Error de autenticación');
          navigate('/login');
          return;
        }

        if (!code) {
          console.log('⚠️ [AuthCallback] No code found, redirecting to login');
          navigate('/login');
          return;
        }

        // Exchange code for session via backend
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Error al procesar autenticación');
        }

        const data = await response.json();
        
        // Store the token
        if (data.access_token) {
          localStorage.setItem('sb-token', data.access_token);
          console.log('✅ [AuthCallback] Token stored, redirecting to home');
          toast.success('Autenticación exitosa');
          navigate('/');
        } else {
          throw new Error('No se recibió token de acceso');
        }
      } catch (err: any) {
        console.error('❌ [AuthCallback] Error during callback:', err);
        toast.error(err.message || 'Error al procesar autenticación');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-4" />
        <p className="text-slate-600">Procesando autenticación...</p>
      </div>
    </div>
  );
}