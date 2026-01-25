import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  brand_slogan: string | null;
  welcome_message: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    brand_slogan: '',
    welcome_message: '',
    is_active: true,
  });

  useEffect(() => {
    loadOrganizations();
  }, []);

  async function loadOrganizations() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error: any) {
      console.error('Error loading organizations:', error);
      toast.error('Error al cargar organizaciones: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingOrg) {
        const { error } = await supabase
          .from('organizations')
          .update({
            name: formData.name,
            slug: formData.slug,
            logo_url: formData.logo_url || null,
            brand_slogan: formData.brand_slogan || null,
            welcome_message: formData.welcome_message || null,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingOrg.id);

        if (error) throw error;
        toast.success('Organización actualizada exitosamente');
      } else {
        const { error } = await supabase
          .from('organizations')
          .insert([{
            name: formData.name,
            slug: formData.slug,
            logo_url: formData.logo_url || null,
            brand_slogan: formData.brand_slogan || null,
            welcome_message: formData.welcome_message || null,
            is_active: formData.is_active,
          }]);

        if (error) throw error;
        toast.success('Organización creada exitosamente');
      }

      setIsDialogOpen(false);
      resetForm();
      loadOrganizations();
    } catch (error: any) {
      console.error('Error saving organization:', error);
      toast.error('Error al guardar organización: ' + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar esta organización?')) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Organización eliminada exitosamente');
      loadOrganizations();
    } catch (error: any) {
      console.error('Error deleting organization:', error);
      toast.error('Error al eliminar organización: ' + error.message);
    }
  }

  function handleEdit(org: Organization) {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      logo_url: org.logo_url || '',
      brand_slogan: org.brand_slogan || '',
      welcome_message: org.welcome_message || '',
      is_active: org.is_active,
    });
    setIsDialogOpen(true);
  }

  function resetForm() {
    setEditingOrg(null);
    setFormData({
      name: '',
      slug: '',
      logo_url: '',
      brand_slogan: '',
      welcome_message: '',
      is_active: true,
    });
  }

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Organizaciones</h1>
          <p className="text-slate-600 mt-1">Administra las organizaciones del sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Organización
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingOrg ? 'Editar Organización' : 'Nueva Organización'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre de la organización"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug (URL) *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="nombre-organizacion"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  URL: https://holocheck.app/{formData.slug || 'slug'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Logo URL</label>
                <Input
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slogan</label>
                <Input
                  value={formData.brand_slogan}
                  onChange={(e) => setFormData({ ...formData, brand_slogan: e.target.value })}
                  placeholder="Slogan de la marca"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mensaje de Bienvenida</label>
                <Textarea
                  value={formData.welcome_message}
                  onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                  placeholder="Mensaje que verán los usuarios al iniciar sesión"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Activa</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingOrg ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nombre o slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando organizaciones...</div>
        ) : filteredOrganizations.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No se encontraron organizaciones
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Slogan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                      {org.slug}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {org.brand_slogan || '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      org.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {org.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(org.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(org)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(org.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
