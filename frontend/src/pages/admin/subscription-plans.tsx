import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { getSubscriptionPlans } from '@/lib/supabase-admin';
import { toast } from 'sonner';

export default function AdminSubscriptionPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      const data = await getSubscriptionPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Error al cargar los planes');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Planes de Suscripción</h1>
          <p className="text-slate-600 mt-2">Gestiona los planes disponibles para las organizaciones</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                {plan.employee_range} empleados | {plan.scans_per_employee} escaneos/empleado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Precio Mensual:</span>
                  <span className="font-medium">${plan.monthly_price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Precio Anual:</span>
                  <span className="font-medium">${plan.annual_price}</span>
                </div>
                {plan.features && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-slate-600 mb-2">Características:</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {plan.features.split(',').map((feature: string, idx: number) => (
                        <li key={idx}>• {feature.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">No hay planes de suscripción configurados</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}