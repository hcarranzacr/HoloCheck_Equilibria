import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter, TrendingUp, Download, Eye, X } from 'lucide-react';
import SectionHeader from '@/components/dashboard/SectionHeader';
import BiometricGauge from '@/components/dashboard/BiometricGauge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, subDays, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { getWellnessStatusString, getWellnessColor } from '@/lib/biometric-utils';

interface BiometricScan {
  id: string;
  created_at: string;
  wellness_index_score: number;
  mental_score: number;
  heart_rate: number;
  ai_stress: number;
  ai_fatigue: number;
  ai_recovery: number;
  mental_stress_index: number;
  signal_to_noise_ratio: number;
}

export default function EmployeeHistory() {
  const [scans, setScans] = useState<BiometricScan[]>([]);
  const [filteredScans, setFilteredScans] = useState<BiometricScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedScan, setSelectedScan] = useState<BiometricScan | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [scans, dateRange, sortBy]);

  async function loadHistory() {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        setScans([]);
        return;
      }

      // Query biometric_measurements directly using Supabase
      const { data, error } = await supabase
        .from('biometric_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading history:', error);
        setScans([]);
      } else {
        console.log('✅ Loaded', data?.length || 0, 'measurements from history');
        setScans(data || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      setScans([]);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...scans];

    // Filter by date range
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(scan => {
        const scanDate = new Date(scan.created_at);
        return isWithinInterval(scanDate, { start: dateRange.from, end: dateRange.to });
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'wellness-desc':
          return (b.wellness_index_score || 0) - (a.wellness_index_score || 0);
        case 'wellness-asc':
          return (a.wellness_index_score || 0) - (b.wellness_index_score || 0);
        default:
          return 0;
      }
    });

    setFilteredScans(filtered);
  }

  function clearFilters() {
    setDateRange({
      from: subDays(new Date(), 30),
      to: new Date()
    });
    setSortBy('date-desc');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                📊 Mi Historial de Mediciones
              </h1>
              <p className="text-blue-100">
                Revisa y compara tus escaneos biométricos anteriores
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                Tendencias
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">
                Total de escaneos: {scans.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">
                Último escaneo: {scans[0]?.created_at ? format(new Date(scans[0].created_at), 'PPP', { locale: es }) : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              <span className="text-sm">
                Mostrando: {filteredScans.length} resultados
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filters Section */}
        <Card className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Rango de fechas
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(dateRange.from, 'PPP', { locale: es })} - {format(dateRange.to, 'PPP', { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => {
                      if (date) {
                        setDateRange({ ...dateRange, from: date });
                      }
                    }}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="w-full md:w-48">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Ordenar por
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Más reciente</SelectItem>
                  <SelectItem value="date-asc">Más antiguo</SelectItem>
                  <SelectItem value="wellness-desc">Mejor bienestar</SelectItem>
                  <SelectItem value="wellness-asc">Menor bienestar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          </div>
        </Card>

        {/* Measurements Grid */}
        <div>
          <SectionHeader
            title="Historial de Escaneos"
            description={`${filteredScans.length} mediciones encontradas`}
            metricCount={filteredScans.length}
            icon="📋"
          />
          
          {filteredScans.length === 0 ? (
            <Card className="bg-white rounded-2xl p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay mediciones en este rango
              </h3>
              <p className="text-gray-500 mb-6">
                Ajusta los filtros o realiza un nuevo escaneo
              </p>
              <Button onClick={() => window.location.href = '/employee/pre-scan'}>
                Realizar Escaneo
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScans.map((scan) => (
                <Card key={scan.id} className="hover:shadow-lg transition-shadow bg-white rounded-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {format(new Date(scan.created_at), 'PPP', { locale: es })}
                        </CardTitle>
                        <CardDescription>
                          {format(new Date(scan.created_at), 'p', { locale: es })}
                        </CardDescription>
                      </div>
                      <Badge 
                        style={{ 
                          backgroundColor: getWellnessColor(scan.wellness_index_score),
                          color: 'white'
                        }}
                      >
                        {getWellnessStatusString(scan.wellness_index_score)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold" style={{ color: getWellnessColor(scan.wellness_index_score) }}>
                          {scan.wellness_index_score?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">Bienestar</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Estrés:</span>
                        <span className="ml-1 font-semibold">{scan.ai_stress?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Fatiga:</span>
                        <span className="ml-1 font-semibold">{scan.ai_fatigue?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">FC:</span>
                        <span className="ml-1 font-semibold">{scan.heart_rate?.toFixed(0) || 'N/A'} bpm</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Recuperación:</span>
                        <span className="ml-1 font-semibold">{scan.ai_recovery?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedScan(scan)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scan Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    Detalles del Escaneo
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {format(new Date(selectedScan.created_at), 'PPPp', { locale: es })}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedScan(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <BiometricGauge
                  value={selectedScan.wellness_index_score || 0}
                  min={0}
                  max={10}
                  unit="pts"
                  label="Bienestar General"
                  status={getWellnessStatusString(selectedScan.wellness_index_score)}
                  statusColor={getWellnessColor(selectedScan.wellness_index_score)}
                  size="medium"
                  gradientColors={['#10b981', '#06b6d4']}
                />
                <BiometricGauge
                  value={selectedScan.mental_score || 0}
                  min={0}
                  max={10}
                  unit="pts"
                  label="Salud Mental"
                  status={getWellnessStatusString(selectedScan.mental_score)}
                  statusColor={getWellnessColor(selectedScan.mental_score)}
                  size="medium"
                  gradientColors={['#10b981', '#06b6d4']}
                />
                <BiometricGauge
                  value={selectedScan.heart_rate || 0}
                  min={40}
                  max={140}
                  unit="bpm"
                  label="Frecuencia Cardíaca"
                  status={selectedScan.heart_rate >= 60 && selectedScan.heart_rate <= 100 ? 'Normal' : 'Revisar'}
                  statusColor={selectedScan.heart_rate >= 60 && selectedScan.heart_rate <= 100 ? '#10b981' : '#fbbf24'}
                  size="medium"
                  gradientColors={['#ef4444', '#fbbf24', '#10b981']}
                />
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Estrés IA</div>
                  <div className="text-2xl font-bold">{selectedScan.ai_stress?.toFixed(1) || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Fatiga IA</div>
                  <div className="text-2xl font-bold">{selectedScan.ai_fatigue?.toFixed(1) || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Recuperación</div>
                  <div className="text-2xl font-bold">{selectedScan.ai_recovery?.toFixed(1) || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Estrés Mental</div>
                  <div className="text-2xl font-bold">{selectedScan.mental_stress_index?.toFixed(1) || 'N/A'}</div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar PDF
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setSelectedScan(null)}>
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}