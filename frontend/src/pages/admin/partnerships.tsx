import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, ExternalLink, Users, Gift, Handshake } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Partner {
  id: string;
  name: string;
  region: string;
  sector: string;
  website_url: string;
  contact_email: string;
  contact_phone: string;
  description: string;
  logo_url: string;
  created_at: string;
}

interface PartnerBenefit {
  id: string;
  partner_id: string;
  title: string;
  benefit_description: string;
  how_to_use: string;
  link_url: string;
  image_url: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

interface OrganizationPartner {
  id: string;
  organization_id: string;
  partner_id: string;
  agreement_start: string;
  agreement_end: string;
  notes: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminPartnerships() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [benefits, setBenefits] = useState<PartnerBenefit[]>([]);
  const [agreements, setAgreements] = useState<OrganizationPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // Load partners
      const { data: partnersData, error: partnersError } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (partnersError) {
        console.error('Error loading partners:', partnersError);
      } else {
        setPartners(partnersData || []);
      }

      // Load benefits
      const { data: benefitsData, error: benefitsError } = await supabase
        .from('partner_benefits')
        .select('*')
        .order('created_at', { ascending: false });

      if (benefitsError) {
        console.error('Error loading benefits:', benefitsError);
      } else {
        setBenefits(benefitsData || []);
      }

      // Load agreements
      const { data: agreementsData, error: agreementsError } = await supabase
        .from('organization_partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (agreementsError) {
        console.error('Error loading agreements:', agreementsError);
      } else {
        setAgreements(agreementsData || []);
      }

      console.log('✅ [AdminPartnerships] Data loaded');
    } catch (error) {
      console.error('Error loading partnerships data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                🤝 Gestión de Alianzas y Beneficios
              </h1>
              <p className="text-violet-100">
                Administra aliados comerciales, beneficios y acuerdos organizacionales
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Aliados Comerciales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{partners.length}</div>
              <p className="text-xs text-gray-500 mt-1">Total registrados</p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Beneficios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{benefits.length}</div>
              <p className="text-xs text-gray-500 mt-1">
                {benefits.filter(b => b.is_active).length} activos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Handshake className="w-4 h-4" />
                Acuerdos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{agreements.length}</div>
              <p className="text-xs text-gray-500 mt-1">
                {agreements.filter(a => a.is_active).length} activos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="bg-white rounded-2xl shadow-md">
          <Tabs defaultValue="partners" className="w-full">
            <TabsList className="grid w-full grid-cols-3 p-1 m-4">
              <TabsTrigger value="partners">Aliados Comerciales</TabsTrigger>
              <TabsTrigger value="benefits">Beneficios</TabsTrigger>
              <TabsTrigger value="agreements">Acuerdos</TabsTrigger>
            </TabsList>

            {/* Partners Tab */}
            <TabsContent value="partners" className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Aliados Comerciales</h2>
                <Button className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Aliado
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partners.map((partner) => (
                  <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {partner.logo_url && (
                            <img
                              src={partner.logo_url}
                              alt={partner.name}
                              className="w-12 h-12 object-contain rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <CardTitle className="text-lg">{partner.name}</CardTitle>
                            <p className="text-sm text-gray-500">
                              {partner.region} • {partner.sector}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-3">{partner.description}</p>
                      <div className="space-y-1 text-xs text-gray-600">
                        {partner.website_url && (
                          <div className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            <a 
                              href={partner.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {partner.website_url}
                            </a>
                          </div>
                        )}
                        {partner.contact_email && (
                          <div>📧 {partner.contact_email}</div>
                        )}
                        {partner.contact_phone && (
                          <div>📞 {partner.contact_phone}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Benefits Tab */}
            <TabsContent value="benefits" className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Beneficios</h2>
                <Button className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Beneficio
                </Button>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit) => {
                  const partner = partners.find(p => p.id === benefit.partner_id);
                  return (
                    <Card key={benefit.id} className="hover:shadow-lg transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        {benefit.image_url && (
                          <div className="md:w-1/4 bg-gray-100">
                            <img
                              src={benefit.image_url}
                              alt={benefit.title}
                              className="w-full h-48 md:h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Beneficio';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold">{benefit.title}</h3>
                              <p className="text-sm text-gray-500">{partner?.name || 'Aliado desconocido'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={benefit.is_active ? 'default' : 'secondary'}
                                className={benefit.is_active ? 'bg-green-500' : ''}
                              >
                                {benefit.is_active ? 'Activo' : 'Inactivo'}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{benefit.benefit_description}</p>
                          <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                            <p className="text-xs text-blue-900">
                              <strong>Cómo usar:</strong> {benefit.how_to_use}
                            </p>
                          </div>
                          {benefit.tags && benefit.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {benefit.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {benefit.link_url && (
                            <a 
                              href={benefit.link_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {benefit.link_url}
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Agreements Tab */}
            <TabsContent value="agreements" className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Acuerdos Organizacionales</h2>
                <Button className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Acuerdo
                </Button>
              </div>

              <div className="space-y-4">
                {agreements.map((agreement) => {
                  const partner = partners.find(p => p.id === agreement.partner_id);
                  return (
                    <Card key={agreement.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{partner?.name || 'Aliado desconocido'}</CardTitle>
                            <p className="text-sm text-gray-500">
                              {new Date(agreement.agreement_start).toLocaleDateString('es-ES')} - {new Date(agreement.agreement_end).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={agreement.is_active ? 'default' : 'secondary'}
                              className={agreement.is_active ? 'bg-green-500' : ''}
                            >
                              {agreement.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {agreement.notes && (
                          <p className="text-sm text-gray-700">{agreement.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}