import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Pencil, Trash2, RefreshCw, Clock, MessageSquare, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Prompt {
  id: string;
  prompt_name: string;
  prompt_text: string;
  is_active: boolean;
  created_at: string;
}

export default function PromptsManagement() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<Prompt | null>(null);
  const [deletingPromptId, setDeletingPromptId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    prompt_name: '',
    prompt_text: '',
  });

  const [formErrors, setFormErrors] = useState({
    prompt_name: '',
    prompt_text: '',
  });

  async function loadData() {
    try {
      setLoading(true);
      console.log('📊 [Prompts Management] Loading data...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get user's organization_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Error loading profile:', profileError);
        throw new Error('Error loading user profile');
      }

      // Check if user is org admin
      if (profile.role !== 'admin_org' && profile.role !== 'super_admin') {
        throw new Error('Access denied: Only organization administrators can access this page');
      }

      setOrganizationId(profile.organization_id);

      // Load prompts
      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('prompt_name');

      if (promptsError) {
        console.error('❌ Error loading prompts:', promptsError);
        throw new Error('Error loading prompts');
      }

      setPrompts(promptsData || []);
      setLastUpdated(new Date());
      console.log('✅ [Prompts Management] Data loaded:', promptsData?.length || 0, 'prompts');
    } catch (error: any) {
      console.error('❌ [Prompts Management] Error:', error);
      toast.error(error.message || 'Error loading data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    console.log('🔄 [Prompts Management] Manual refresh triggered');
    setRefreshing(true);
    loadData();
  };

  function validateForm(): boolean {
    const errors = {
      prompt_name: '',
      prompt_text: '',
    };

    if (!formData.prompt_name.trim()) {
      errors.prompt_name = 'El nombre del prompt es requerido';
    }

    if (!formData.prompt_text.trim()) {
      errors.prompt_text = 'El contenido del prompt es requerido';
    }

    setFormErrors(errors);
    return !errors.prompt_name && !errors.prompt_text;
  }

  async function handleSave() {
    if (!validateForm()) {
      return;
    }

    try {
      if (editingPrompt) {
        // Update existing prompt
        const { error } = await supabase
          .from('prompts')
          .update({
            prompt_name: formData.prompt_name,
            prompt_text: formData.prompt_text,
          })
          .eq('id', editingPrompt.id);

        if (error) throw error;

        toast.success('Prompt actualizado correctamente');
      } else {
        // Create new prompt
        const { error } = await supabase
          .from('prompts')
          .insert({
            organization_id: organizationId,
            prompt_name: formData.prompt_name,
            prompt_text: formData.prompt_text,
            is_active: true,
          });

        if (error) throw error;

        toast.success('Prompt creado correctamente');
      }

      setShowDialog(false);
      setEditingPrompt(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error saving prompt:', error);
      toast.error(error.message || 'Error al guardar el prompt');
    }
  }

  async function handleDelete() {
    if (!deletingPromptId) return;

    try {
      const { error } = await supabase
        .from('prompts')
        .update({ is_active: false })
        .eq('id', deletingPromptId);

      if (error) throw error;

      toast.success('Prompt eliminado correctamente');
      setShowDeleteDialog(false);
      setDeletingPromptId(null);
      loadData();
    } catch (error: any) {
      console.error('Error deleting prompt:', error);
      toast.error(error.message || 'Error al eliminar el prompt');
    }
  }

  function openEditDialog(prompt: Prompt) {
    setEditingPrompt(prompt);
    setFormData({
      prompt_name: prompt.prompt_name,
      prompt_text: prompt.prompt_text,
    });
    setFormErrors({ prompt_name: '', prompt_text: '' });
    setShowDialog(true);
  }

  function openCreateDialog() {
    setEditingPrompt(null);
    resetForm();
    setFormErrors({ prompt_name: '', prompt_text: '' });
    setShowDialog(true);
  }

  function openViewDialog(prompt: Prompt) {
    setViewingPrompt(prompt);
    setShowViewDialog(true);
  }

  function openDeleteDialog(promptId: string) {
    setDeletingPromptId(promptId);
    setShowDeleteDialog(true);
  }

  function resetForm() {
    setFormData({
      prompt_name: '',
      prompt_text: '',
    });
  }

  const filteredPrompts = prompts.filter(prompt =>
    prompt.prompt_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.prompt_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-teal-600" />
            Gestión de Prompts IA
          </h1>
          <p className="text-slate-600 mt-2">Administra los prompts personalizados de IA</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={openCreateDialog} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Prompt
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Última actualización: {lastUpdated.toLocaleTimeString('es-ES')}</span>
        </div>
      )}

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Prompts</CardTitle>
          <CardDescription>
            {filteredPrompts.length} prompt(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
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

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contenido</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrompts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                      No se encontraron prompts
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrompts.map((prompt) => (
                    <TableRow key={prompt.id}>
                      <TableCell className="font-medium">{prompt.prompt_name}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{prompt.prompt_text.substring(0, 60)}...</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewDialog(prompt)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={prompt.is_active ? 'default' : 'destructive'}>
                          {prompt.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(prompt.created_at).toLocaleDateString('es-ES')}
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
                            onClick={() => openDeleteDialog(prompt.id)}
                            disabled={!prompt.is_active}
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

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPrompt ? 'Editar Prompt' : 'Nuevo Prompt'}</DialogTitle>
            <DialogDescription>
              {editingPrompt ? 'Modifica el prompt personalizado' : 'Crea un nuevo prompt personalizado para IA'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt_name">Nombre del Prompt *</Label>
              <Input
                id="prompt_name"
                value={formData.prompt_name}
                onChange={(e) => setFormData({ ...formData, prompt_name: e.target.value })}
                placeholder="Ej: Análisis de Bienestar Emocional"
              />
              {formErrors.prompt_name && (
                <p className="text-sm text-red-600 mt-1">{formErrors.prompt_name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="prompt_text">Contenido del Prompt *</Label>
              <Textarea
                id="prompt_text"
                value={formData.prompt_text}
                onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
                rows={10}
                placeholder="Escribe el prompt que se usará para el análisis de IA..."
                className="font-mono text-sm"
              />
              {formErrors.prompt_text && (
                <p className="text-sm text-red-600 mt-1">{formErrors.prompt_text}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formData.prompt_text.length} caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-teal-600" />
              {viewingPrompt?.prompt_name}
            </DialogTitle>
            <DialogDescription>
              Creado el {viewingPrompt && new Date(viewingPrompt.created_at).toLocaleDateString('es-ES')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border overflow-auto max-h-96">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {viewingPrompt?.prompt_text}
              </pre>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{viewingPrompt?.prompt_text.length} caracteres</span>
              <Badge variant={viewingPrompt?.is_active ? 'default' : 'destructive'}>
                {viewingPrompt?.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              if (viewingPrompt) {
                setShowViewDialog(false);
                openEditDialog(viewingPrompt);
              }
            }} className="bg-teal-600 hover:bg-teal-700">
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará el prompt. El prompt no se utilizará en futuros análisis pero se conservará en el historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}