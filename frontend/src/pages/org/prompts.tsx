import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Pencil, Trash2, MessageSquare } from 'lucide-react';

interface Prompt {
  id: string;
  prompt_name: string;
  prompt_text: string;
  is_active: boolean;
  created_at: string;
}

export default function OrgPrompts() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [organizationId, setOrganizationId] = useState<string>('');

  const [formData, setFormData] = useState({
    prompt_name: '',
    prompt_text: '',
  });

  useEffect(() => {
    loadPrompts();
  }, []);

  async function loadPrompts() {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) return;
      
      setOrganizationId(profile.organization_id);

      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('prompt_name');

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Error loading prompts:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los prompts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (!formData.prompt_name || !formData.prompt_text) {
        toast({
          title: 'Error',
          description: 'Todos los campos son requeridos',
          variant: 'destructive',
        });
        return;
      }

      if (editingPrompt) {
        const { error } = await supabase
          .from('prompts')
          .update({
            prompt_name: formData.prompt_name,
            prompt_text: formData.prompt_text,
          })
          .eq('id', editingPrompt.id);

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Prompt actualizado correctamente',
        });
      } else {
        const { error } = await supabase
          .from('prompts')
          .insert({
            organization_id: organizationId,
            prompt_name: formData.prompt_name,
            prompt_text: formData.prompt_text,
            is_active: true,
          });

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Prompt creado correctamente',
        });
      }

      setShowDialog(false);
      setEditingPrompt(null);
      setFormData({ prompt_name: '', prompt_text: '' });
      loadPrompts();
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el prompt',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete(promptId: string) {
    if (!confirm('¿Estás seguro de eliminar este prompt?')) return;

    try {
      const { error } = await supabase
        .from('prompts')
        .update({ is_active: false })
        .eq('id', promptId);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Prompt eliminado correctamente',
      });
      loadPrompts();
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el prompt',
        variant: 'destructive',
      });
    }
  }

  function openEditDialog(prompt: Prompt) {
    setEditingPrompt(prompt);
    setFormData({
      prompt_name: prompt.prompt_name,
      prompt_text: prompt.prompt_text,
    });
    setShowDialog(true);
  }

  function openCreateDialog() {
    setEditingPrompt(null);
    setFormData({ prompt_name: '', prompt_text: '' });
    setShowDialog(true);
  }

  const filteredPrompts = prompts.filter(prompt =>
    prompt.prompt_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Prompts Personalizados</h1>
          <p className="text-slate-600 mt-2">Gestiona los prompts de IA de tu organización</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Prompt
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Lista de Prompts
          </CardTitle>
          <CardDescription>
            {filteredPrompts.length} prompt(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Texto del Prompt</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrompts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-500">
                      No se encontraron prompts
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrompts.map((prompt) => (
                    <TableRow key={prompt.id}>
                      <TableCell className="font-medium">{prompt.prompt_name}</TableCell>
                      <TableCell className="max-w-md truncate">{prompt.prompt_text}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          prompt.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {prompt.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(prompt)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(prompt.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPrompt ? 'Editar Prompt' : 'Nuevo Prompt'}</DialogTitle>
            <DialogDescription>
              {editingPrompt ? 'Modifica los datos del prompt' : 'Agrega un nuevo prompt personalizado'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt_name">Nombre del Prompt</Label>
              <Input
                id="prompt_name"
                value={formData.prompt_name}
                onChange={(e) => setFormData({ ...formData, prompt_name: e.target.value })}
                placeholder="Ej: Análisis de Bienestar"
              />
            </div>

            <div>
              <Label htmlFor="prompt_text">Texto del Prompt</Label>
              <Textarea
                id="prompt_text"
                value={formData.prompt_text}
                onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
                rows={8}
                placeholder="Escribe el prompt que se usará para el análisis de IA..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}