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
import { Plus, Pencil, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationBranding {
  id: string;
  organization_id: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  font_family: string | null;
  custom_css: string | null;
  created_at: string;
  updated_at: string;
  organizations?: {
    name: string;
  };
}

export default function OrganizationBranding() {
  const [brandings, setBrandings] = useState<OrganizationBranding[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranding, setEditingBranding] = useState<OrganizationBranding | null>(null);
  const [formData, setFormData] = useState({
    organization_id: '',
    logo_url: '',
    primary_color: '#3b82f6',
    secondary_color: '#10b981',
    font_family: 'Inter',
    custom_css: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      
      // Load organizations
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (orgsError) throw orgsError;
      setOrganizations(orgsData || []);

      // Load brandings with organization names
      const { data: brandingsData, error: brandingsError } = await supabase
        .from('organization_branding')
        .select(`
          *,
          organizations (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (brandingsError) throw brandingsError;
      setBrandings(brandingsData || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingBranding) {
        const { error } = await supabase
          .from('organization_branding')
          .update({
            organization_id: formData.organization_id,
            logo_url: formData.logo_url || null,
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color,
            font_family: formData.font_family,
            custom_css: formData.custom_css || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingBranding.id);

        if (error) throw error;
        toast.success('Branding actualizado exitosamente');
      } else {
        const { error } = await supabase
          .from('organization_branding')
          .insert([{
            organization_id: formData.organization_id,
            logo_url: formData.logo_url || null,
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color,
            font_family: formData.font_family,
            custom_css: formData.custom_css || null,
          }]);

        if (error) throw error;
        toast.success('Branding creado exitosamente');
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error saving branding:', error);
      toast.error('Error al guardar branding: ' + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar este branding?')) return;

    try {
      const { error } = await supabase
        .from('organization_branding')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Branding eliminado exitosamente');
      loadData();
    } catch (error: any) {
      console.error('Error deleting branding:', error);
      toast.error('Error al eliminar branding: ' + error.message);
    }
  }

  function handleEdit(branding: OrganizationBranding) {
    setEditingBranding(branding);
    setFormData({
      organization_id: branding.organization_id,
      logo_url: branding.logo_url || '',
      primary_color: branding.primary_color || '#3b82f6',
      secondary_color: branding.secondary_color || '#10b981',
      font_family: branding.font_family || 'Inter',
      custom_css: branding.custom_css || '',
    });
    setIsDialogOpen(true);
  }

  function resetForm() {
    setEditingBranding(null);
    setFormData({
      organization_id: '',
      logo_url: '',
      primary_color: '#3b82f6',
      secondary_color: '#10b981',
      font_family: 'Inter',
      custom_css: '',
    });
  }

  const filteredBrandings = brandings.filter(branding =>
    branding.organizations?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Branding Organizacional</h1>
          <p className="text-slate-600 mt-1">Personaliza la apariencia de cada organización</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Branding
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBranding ? 'Editar Branding' : 'Nuevo Branding'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Organización *</label>
                <select
                  value={formData.organization_id}
                  onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                  disabled={!!editingBranding}
                >
                  <option value="">Seleccione una organización</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Logo URL</label>
                <Input
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://ejemplo.com/logo.png"
                />
                {formData.logo_url && (
                  <div className="mt-2 p-4 border rounded-lg bg-slate-50">
                    <img
                      src={formData.logo_url}
                      alt="Preview"
                      className="h-16 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Color Primario</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Color Secundario</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      placeholder="#10b981"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Fuente</label>
                <select
                  value={formData.font_family}
                  onChange={(e) => setFormData({ ...formData, font_family: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">CSS Personalizado</label>
                <Textarea
                  value={formData.custom_css}
                  onChange={(e) => setFormData({ ...formData, custom_css: e.target.value })}
                  placeholder=".custom-class { color: red; }"
                  rows={4}
                  className="font-mono text-sm"
                />
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
                  {editingBranding ? 'Actualizar' : 'Crear'}
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
            placeholder="Buscar por organización..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando brandings...</div>
        ) : filteredBrandings.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No se encontraron brandings
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organización</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead>Colores</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead>Última Actualización</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrandings.map((branding) => (
                <TableRow key={branding.id}>
                  <TableCell className="font-medium">
                    {branding.organizations?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {branding.logo_url ? (
                      <img
                        src={branding.logo_url}
                        alt="Logo"
                        className="h-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: branding.primary_color || '#3b82f6' }}
                        title={branding.primary_color || '#3b82f6'}
                      />
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: branding.secondary_color || '#10b981' }}
                        title={branding.secondary_color || '#10b981'}
                      />
                    </div>
                  </TableCell>
                  <TableCell>{branding.font_family || 'Inter'}</TableCell>
                  <TableCell>
                    {new Date(branding.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(branding)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(branding.id)}
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
