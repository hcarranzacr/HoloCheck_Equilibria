import { useEffect } from 'react';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const { logActivity } = useActivityLogger();
  const navigate = useNavigate();

  useEffect(() => {
    logActivity('page_view', { page: 'NotFound' });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-slate-300">404</h1>
          <h2 className="text-3xl font-semibold text-slate-800 mt-4">
            Página No Encontrada
          </h2>
          <p className="text-slate-600 mt-2 max-w-md mx-auto">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
          >
            <Home className="w-4 h-4" />
            Ir al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
}