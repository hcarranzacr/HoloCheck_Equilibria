import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@metagptx/web-sdk';

const client = createClient();

export default function BenefitsManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('partners');
  const [loading, setLoading] = useState(true);

  // Data states
  const [partners, setPartners] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [orgPartnerLinks, setOrgPartnerLinks] = useState<any[]>([]);
  const [orgPartnerPrograms, setOrgPartnerPrograms] = useState<any[]>([]);
  const [orgBenefitIndicatorLinks, setOrgBenefitIndicatorLinks] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [indicators, setIndicators] = useState<any[]>([]);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        partnersRes,
        programsRes,
        benefitsRes,
        linksRes,
        orgProgsRes,
        indicatorLinksRes,
        orgsRes,
        indsRes,
      ] = await Promise.all([
        client.apiCall.invoke({ url: '/api/v1/benefits-management/partners', method: 'GET' }),
        client.apiCall.invoke({ url: '/api/v1/benefits-management/programs', method: 'GET' }),
        client.apiCall.invoke({ url: '/api/v1/benefits-management/benefits', method: 'GET' }),
        client.apiCall.invoke({ url: '/api/v1/benefits-management/org-partner-links', method: 'GET' }),
        client.apiCall.invoke({ url: '/api/v1/benefits-management/org-partner-programs', method: 'GET' }),
        client.apiCall.invoke({ url: '/api/v1/benefits-management/org-benefit-indicator-links', method: 'GET' }),
        client.apiCall.invoke({ url: '/api/v1/benefits-management/organizations', method: 'GET' }),
        client.apiCall.invoke({ url: '/api/v1/benefits-management/indicators', method: 'GET' }),
      ]);

      setPartners(partnersRes.data.partners || []);
      setPrograms(programsRes.data.programs || []);
      setBenefits(benefitsRes.data.benefits || []);
      setOrgPartnerLinks(linksRes.data.links || []);
      setOrgPartnerPrograms(orgProgsRes.data.programs || []);
      setOrgBenefitIndicatorLinks(indicatorLinksRes.data.links || []);
      setOrganizations(orgsRes.data.organizations || []);
      setIndicators(indsRes.data.indicators || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.detail || error?.response?.data?.detail || 'Error al cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (table: string) => {
    setEditingItem(null);
    setFormData(getEmptyForm(table));
    setDialogOpen(true);
  };

  const handleEdit = (table: string, item: any) => {
    setEditingItem(item);
    setFormData(item);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const endpoint = getEndpoint(activeTab);
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem
        ? `${endpoint}/${editingItem.id}`
        : endpoint;

      await client.apiCall.invoke({
        url,
        method,
        data: formData,
      });

      toast({
        title: 'Éxito',
        description: editingItem ? 'Registro actualizado' : 'Registro creado',
      });

      setDialogOpen(false);
      loadAllData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.detail || error?.response?.data?.detail || 'Error al guardar',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('¿Está seguro de eliminar este registro?')) return;

    try {
      const endpoint = getEndpoint(table);
      await client.apiCall.invoke({
        url: `${endpoint}/${id}`,
        method: 'DELETE',
      });

      toast({ title: 'Éxito', description: 'Registro eliminado' });
      loadAllData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.detail || error?.response?.data?.detail || 'Error al eliminar',
        variant: 'destructive',
      });
    }
  };

  const getEndpoint = (table: string) => {
    const endpoints: any = {
      partners: '/api/v1/benefits-management/partners',
      programs: '/api/v1/benefits-management/programs',
      benefits: '/api/v1/benefits-management/benefits',
      'org-links': '/api/v1/benefits-management/org-partner-links',
      'org-programs': '/api/v1/benefits-management/org-partner-programs',
      'org-indicators': '/api/v1/benefits-management/org-benefit-indicator-links',
    };
    return endpoints[table];
  };

  const getEmptyForm = (table: string) => {
    const forms: any = {
      partners: { name: '', region: '', sector: '', website_url: '', contact_email: '', contact_phone: '', description: '', logo_url: '' },
      programs: { partner_id: '', title: '', description: '', eligibility_criteria: '', benefit_type: '', usage_instructions: '', redemption_link: '', image_url: '', available_in_countries: '', applicable_biomarkers: '', language: 'es', is_active: true },
      benefits: { partner_id: '', title: '', benefit_description: '', how_to_use: '', link_url: '', image_url: '', tags: [], is_active: true },
      'org-links': { organization_id: '', partner_id: '', agreement_start: '', agreement_end: '', notes: '', is_active: true },
      'org-programs': { organization_id: '', partner_program_id: '', start_date: '', end_date: '', is_enabled: true, custom_notes: '' },
      'org-indicators': { organization_id: '', benefit_id: '', indicator_code: '', relevance_level: '', notes: '' },
    };
    return forms[table] || {};
  };

  const getPartnerName = (id: string) => partners.find((p) => p.id === id)?.name || id;
  const getProgramTitle = (id: string) => programs.find((p) => p.id === id)?.title || id;
  const getBenefitTitle = (id: string) => benefits.find((b) => b.id === id)?.title || id;
  const getOrgName = (id: string) => organizations.find((o) => o.id === id)?.name || id;
  const getIndicatorName = (code: string) => indicators.find((i) => i.indicator_code === code)?.indicator_name || code;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mantenimiento de Programa de Beneficios</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="partners">Aliados</TabsTrigger>
          <TabsTrigger value="programs">Programas</TabsTrigger>
          <TabsTrigger value="benefits">Beneficios</TabsTrigger>
          <TabsTrigger value="org-links">Vínculos Org-Partner</TabsTrigger>
          <TabsTrigger value="org-programs">Programas Org</TabsTrigger>
          <TabsTrigger value="org-indicators">Beneficios-Indicadores</TabsTrigger>
        </TabsList>

        {/* PARTNERS TAB */}
        <TabsContent value="partners">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gestión de Aliados</CardTitle>
              <Button onClick={() => handleCreate('partners')}>
                <Plus className="mr-2 h-4 w-4" /> Crear Aliado
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Región</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>{partner.region}</TableCell>
                      <TableCell>{partner.sector}</TableCell>
                      <TableCell>{partner.contact_email}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit('partners', partner)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete('partners', partner.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROGRAMS TAB */}
        <TabsContent value="programs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gestión de Programas</CardTitle>
              <Button onClick={() => handleCreate('programs')}>
                <Plus className="mr-2 h-4 w-4" /> Crear Programa
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Aliado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Activo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.title}</TableCell>
                      <TableCell>{getPartnerName(program.partner_id)}</TableCell>
                      <TableCell>{program.benefit_type}</TableCell>
                      <TableCell>{program.is_active ? '✓' : '✗'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit('programs', program)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete('programs', program.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BENEFITS TAB */}
        <TabsContent value="benefits">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gestión de Beneficios</CardTitle>
              <Button onClick={() => handleCreate('benefits')}>
                <Plus className="mr-2 h-4 w-4" /> Crear Beneficio
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Aliado</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Activo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {benefits.map((benefit) => (
                    <TableRow key={benefit.id}>
                      <TableCell className="font-medium">{benefit.title}</TableCell>
                      <TableCell>{getPartnerName(benefit.partner_id)}</TableCell>
                      <TableCell className="max-w-xs truncate">{benefit.benefit_description}</TableCell>
                      <TableCell>{benefit.is_active ? '✓' : '✗'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit('benefits', benefit)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete('benefits', benefit.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ORG-PARTNER LINKS TAB */}
        <TabsContent value="org-links">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vínculos Organización-Aliado</CardTitle>
              <Button onClick={() => handleCreate('org-links')}>
                <Plus className="mr-2 h-4 w-4" /> Crear Vínculo
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organización</TableHead>
                    <TableHead>Aliado</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Activo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgPartnerLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>{getOrgName(link.organization_id)}</TableCell>
                      <TableCell>{getPartnerName(link.partner_id)}</TableCell>
                      <TableCell>{link.agreement_start || '-'}</TableCell>
                      <TableCell>{link.agreement_end || '-'}</TableCell>
                      <TableCell>{link.is_active ? '✓' : '✗'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit('org-links', link)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete('org-links', link.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ORG-PARTNER PROGRAMS TAB */}
        <TabsContent value="org-programs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Programas Suscritos por Organización</CardTitle>
              <Button onClick={() => handleCreate('org-programs')}>
                <Plus className="mr-2 h-4 w-4" /> Crear Suscripción
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organización</TableHead>
                    <TableHead>Programa</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Habilitado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgPartnerPrograms.map((prog) => (
                    <TableRow key={prog.id}>
                      <TableCell>{getOrgName(prog.organization_id)}</TableCell>
                      <TableCell>{getProgramTitle(prog.partner_program_id)}</TableCell>
                      <TableCell>{prog.start_date || '-'}</TableCell>
                      <TableCell>{prog.end_date || '-'}</TableCell>
                      <TableCell>{prog.is_enabled ? '✓' : '✗'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit('org-programs', prog)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete('org-programs', prog.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ORG-BENEFIT-INDICATOR LINKS TAB */}
        <TabsContent value="org-indicators">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Beneficios Vinculados a Indicadores</CardTitle>
              <Button onClick={() => handleCreate('org-indicators')}>
                <Plus className="mr-2 h-4 w-4" /> Crear Vínculo
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organización</TableHead>
                    <TableHead>Beneficio</TableHead>
                    <TableHead>Indicador</TableHead>
                    <TableHead>Relevancia</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgBenefitIndicatorLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>{getOrgName(link.organization_id)}</TableCell>
                      <TableCell>{getBenefitTitle(link.benefit_id)}</TableCell>
                      <TableCell>{getIndicatorName(link.indicator_code)}</TableCell>
                      <TableCell>{link.relevance_level || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit('org-indicators', link)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete('org-indicators', link.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* UNIVERSAL DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar' : 'Crear'} {activeTab === 'partners' ? 'Aliado' : activeTab === 'programs' ? 'Programa' : activeTab === 'benefits' ? 'Beneficio' : activeTab === 'org-links' ? 'Vínculo Org-Partner' : activeTab === 'org-programs' ? 'Programa Org' : 'Vínculo Beneficio-Indicador'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* PARTNERS FORM */}
            {activeTab === 'partners' && (
              <>
                <div>
                  <Label>Nombre *</Label>
                  <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Región</Label>
                    <Input value={formData.region || ''} onChange={(e) => setFormData({ ...formData, region: e.target.value })} />
                  </div>
                  <div>
                    <Label>Sector</Label>
                    <Input value={formData.sector || ''} onChange={(e) => setFormData({ ...formData, sector: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={formData.contact_email || ''} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input value={formData.contact_phone || ''} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Sitio Web</Label>
                  <Input type="url" value={formData.website_url || ''} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} />
                </div>
                <div>
                  <Label>URL Logo</Label>
                  <Input type="url" value={formData.logo_url || ''} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} />
                </div>
              </>
            )}

            {/* PROGRAMS FORM */}
            {activeTab === 'programs' && (
              <>
                <div>
                  <Label>Aliado *</Label>
                  <Select value={formData.partner_id || ''} onValueChange={(value) => setFormData({ ...formData, partner_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Seleccione aliado" /></SelectTrigger>
                    <SelectContent>
                      {partners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Título *</Label>
                  <Input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div>
                  <Label>Tipo de Beneficio</Label>
                  <Input value={formData.benefit_type || ''} onChange={(e) => setFormData({ ...formData, benefit_type: e.target.value })} />
                </div>
                <div>
                  <Label>Enlace de Redención</Label>
                  <Input type="url" value={formData.redemption_link || ''} onChange={(e) => setFormData({ ...formData, redemption_link: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_active || false} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                  <Label>Activo</Label>
                </div>
              </>
            )}

            {/* BENEFITS FORM */}
            {activeTab === 'benefits' && (
              <>
                <div>
                  <Label>Aliado *</Label>
                  <Select value={formData.partner_id || ''} onValueChange={(value) => setFormData({ ...formData, partner_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Seleccione aliado" /></SelectTrigger>
                    <SelectContent>
                      {partners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Título *</Label>
                  <Input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea value={formData.benefit_description || ''} onChange={(e) => setFormData({ ...formData, benefit_description: e.target.value })} />
                </div>
                <div>
                  <Label>Cómo Usar</Label>
                  <Textarea value={formData.how_to_use || ''} onChange={(e) => setFormData({ ...formData, how_to_use: e.target.value })} />
                </div>
                <div>
                  <Label>URL del Beneficio</Label>
                  <Input type="url" value={formData.link_url || ''} onChange={(e) => setFormData({ ...formData, link_url: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_active || false} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                  <Label>Activo</Label>
                </div>
              </>
            )}

            {/* ORG-PARTNER LINKS FORM */}
            {activeTab === 'org-links' && (
              <>
                <div>
                  <Label>Organización *</Label>
                  <Select value={formData.organization_id || ''} onValueChange={(value) => setFormData({ ...formData, organization_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Seleccione organización" /></SelectTrigger>
                    <SelectContent>
                      {organizations.map((o) => (
                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Aliado *</Label>
                  <Select value={formData.partner_id || ''} onValueChange={(value) => setFormData({ ...formData, partner_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Seleccione aliado" /></SelectTrigger>
                    <SelectContent>
                      {partners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha Inicio</Label>
                    <Input type="date" value={formData.agreement_start || ''} onChange={(e) => setFormData({ ...formData, agreement_start: e.target.value })} />
                  </div>
                  <div>
                    <Label>Fecha Fin</Label>
                    <Input type="date" value={formData.agreement_end || ''} onChange={(e) => setFormData({ ...formData, agreement_end: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Notas</Label>
                  <Textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_active || false} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                  <Label>Activo</Label>
                </div>
              </>
            )}

            {/* ORG-PARTNER PROGRAMS FORM */}
            {activeTab === 'org-programs' && (
              <>
                <div>
                  <Label>Organización *</Label>
                  <Select value={formData.organization_id || ''} onValueChange={(value) => setFormData({ ...formData, organization_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Seleccione organización" /></SelectTrigger>
                    <SelectContent>
                      {organizations.map((o) => (
                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Programa *</Label>
                  <Select value={formData.partner_program_id || ''} onValueChange={(value) => setFormData({ ...formData, partner_program_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Seleccione programa" /></SelectTrigger>
                    <SelectContent>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha Inicio</Label>
                    <Input type="date" value={formData.start_date || ''} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Fecha Fin</Label>
                    <Input type="date" value={formData.end_date || ''} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Notas</Label>
                  <Textarea value={formData.custom_notes || ''} onChange={(e) => setFormData({ ...formData, custom_notes: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_enabled || false} onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })} />
                  <Label>Habilitado</Label>
                </div>
              </>
            )}

            {/* ORG-BENEFIT-INDICATOR LINKS FORM */}
            {activeTab === 'org-indicators' && (
              <>
                <div>
                  <Label>Organización *</Label>
                  <Select value={formData.organization_id || ''} onValueChange={(value) => setFormData({ ...formData, organization_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Seleccione organización" /></SelectTrigger>
                    <SelectContent>
                      {organizations.map((o) => (
                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Beneficio *</Label>
                  <Select value={formData.benefit_id || ''} onValueChange={(value) => setFormData({ ...formData, benefit_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Seleccione beneficio" /></SelectTrigger>
                    <SelectContent>
                      {benefits.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Indicador Biométrico *</Label>
                  <Select value={formData.indicator_code || ''} onValueChange={(value) => setFormData({ ...formData, indicator_code: value })}>
                    <SelectTrigger><SelectValue placeholder="Seleccione indicador" /></SelectTrigger>
                    <SelectContent>
                      {indicators.map((i) => (
                        <SelectItem key={i.indicator_code} value={i.indicator_code}>{i.indicator_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nivel de Relevancia</Label>
                  <Select value={formData.relevance_level || ''} onValueChange={(value) => setFormData({ ...formData, relevance_level: value })}>
                    <SelectTrigger><SelectValue placeholder="Seleccione nivel" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bajo">Bajo</SelectItem>
                      <SelectItem value="medio">Medio</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notas</Label>
                  <Textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}