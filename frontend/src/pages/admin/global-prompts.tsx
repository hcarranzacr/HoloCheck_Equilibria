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

interface GlobalPrompt {
  id: string;
  prompt_key: string;
  prompt_text: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function GlobalPrompts() {
  const [prompts, setPrompts] = useState<GlobalPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<GlobalPrompt | null>(null);
  const [formData, setFormData] = useState({
    prompt_key: '',
    prompt_text: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    loadPrompts();
  }, []);

  async function loadPrompts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('global_prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error: any) {
      console.error('Error loading prompts:', error);
      toast.error('Error al cargar prompts: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingPrompt) {
        const { error } = await supabase
          .from('global_prompts')
          .update({
            prompt_key: formData.prompt_key,
            prompt_text: formData.prompt_text,
            description: formData.description || null,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingPrompt.id);

        if (error) throw error;
        toast.success('Prompt actualizado exitosamente');
      } else {
        const { error } = await supabase
          .from('global_prompts')
          .insert([{
            prompt_key: formData.prompt_key,
            prompt_text: formData.prompt_text,
            description: formData.description || null,
            is_active: formData.is_active,
          }]);

        if (error) throw error;
        toast.success('Prompt creado exitosamente');
      }

      setIsDialogOpen(false);
      resetForm();
      loadPrompts();
    } catch (error: any) {
      console.error('Error saving prompt:', error);
      toast.error('Error al guardar prompt: ' + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar este prompt?')) return;

    try {
      const { error } = await supabase
        .from('global_prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Prompt eliminado exitosamente');
      loadPrompts();
    } catch (error: any) {
      console.error('Error deleting prompt:', error);
      toast.error('Error al eliminar prompt: ' + error.message);
    }
  }

  function handleEdit(prompt: GlobalPrompt) {
    setEditingPrompt(prompt);
    setFormData({
      prompt_key: prompt.prompt_key,
      prompt_text: prompt.prompt_text,
      description: prompt.description || '',
      is_active: prompt.is_active,
    });
    setIsDialogOpen(true);
  }

  function resetForm() {
    setEditingPrompt(null);
    setFormData({
      prompt_key: '',
      prompt_text: '',
      description: '',
      is_active: true,
    });
  }

  const filteredPrompts = prompts.filter(prompt =>
    prompt.prompt_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prompt.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Prompts Globales</h1>
          <p className="text-slate-600 mt-1">Gestión de prompts de IA del sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPrompt ? 'Editar Prompt' : 'Nuevo Prompt'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Clave del Prompt *</label>
                <Input
                  value={formData.prompt_key}
                  onChange={(e) => setFormData({ ...formData, prompt_key: e.target.value })}
                  placeholder="ej: employee_wellness_analysis"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Texto del Prompt *</label>
                <Textarea
                  value={formData.prompt_text}
                  onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
                  placeholder="Ingrese el texto del prompt..."
                  rows={6}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del propósito del prompt"
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
                <label className="text-sm font-medium">Activo</label>
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
                  {editingPrompt ? 'Actualizar' : 'Crear'}
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
            placeholder="Buscar por clave o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando prompts...</div>
        ) : filteredPrompts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No se encontraron prompts
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clave</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Actualización</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrompts.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell className="font-medium">{prompt.prompt_key}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {prompt.description || '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      prompt.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {prompt.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(prompt.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(prompt)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(prompt.id)}
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
