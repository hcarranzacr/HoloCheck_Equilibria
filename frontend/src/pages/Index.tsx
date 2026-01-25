import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('🏠 [Index] Page mounted, redirecting to /login');
    navigate('/login');
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirigiendo...</h1>
        <p className="text-muted-foreground">Por favor espera mientras te redirigimos al login.</p>
      </div>
    </div>
  );
}
