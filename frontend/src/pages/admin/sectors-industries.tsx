import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSectors, getIndustries } from '@/lib/supabase-admin';

export default function AdminSectorsIndustries() {
  const [sectors, setSectors] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [sectorsData, industriesData] = await Promise.all([
        getSectors(),
        getIndustries(),
      ]);
      setSectors(sectorsData);
      setIndustries(industriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Sectores e Industrias</h1>
        <p className="text-slate-600 mt-2">Catálogos de clasificación de organizaciones</p>
      </div>

      <Tabs defaultValue="sectors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sectors">Sectores</TabsTrigger>
          <TabsTrigger value="industries">Industrias</TabsTrigger>
        </TabsList>

        <TabsContent value="sectors">
          <Card>
            <CardHeader>
              <CardTitle>Sectores</CardTitle>
              <CardDescription>Clasificación por sector económico</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sectors.map((sector) => (
                  <div key={sector.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{sector.name}</span>
                    <span className="text-sm text-slate-600">ID: {sector.id}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="industries">
          <Card>
            <CardHeader>
              <CardTitle>Industrias</CardTitle>
              <CardDescription>Clasificación por industria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {industries.map((industry) => (
                  <div key={industry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{industry.name}</span>
                    <span className="text-sm text-slate-600">Sector: {industry.sector_id}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}