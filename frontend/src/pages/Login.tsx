import { useEffect, useState } from 'react';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const { logActivity } = useActivityLogger();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    logActivity('page_view', { page: 'Login' });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      console.log('🔐 [Login] Attempting login with Supabase...');
      
      // Use Supabase Auth directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ [Login] Supabase error:', error);
        throw new Error(error.message);
      }

      if (!data.session) {
        throw new Error('No se pudo crear la sesión');
      }

      console.log('✅ [Login] Login successful:', {
        userId: data.user?.id,
        email: data.user?.email,
        hasSession: !!data.session
      });

      // Store the token
      localStorage.setItem('sb-token', data.session.access_token);
      
      await logActivity('login', { email });
      toast.success('Inicio de sesión exitoso');
      navigate('/');
    } catch (error: any) {
      console.error('❌ [Login] Login error:', error);
      toast.error(error.message || 'Error al iniciar sesión');
      await logActivity('login_error', { email, error: error.message }, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">HoloCheck Equilibria</CardTitle>
          <p className="text-center text-slate-600">Inicia sesión en tu cuenta</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}