import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, Search, BookOpen, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateUserManualPDF } from '@/lib/pdf-generator';

export default function UserManual() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState('employee');

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateUserManualPDF();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-sky-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Manual de Usuario</h1>
                <p className="text-sm text-slate-600">HoloCheck Equilibria</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="bg-sky-600 hover:bg-sky-700"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGeneratingPDF ? 'Generando PDF...' : 'Descargar Manual Completo en PDF'}
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar en el manual..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div id="manual-content">
          {/* Introducción */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-sky-600" />
                Bienvenido a HoloCheck Equilibria
              </CardTitle>
              <CardDescription>
                Plataforma integral de bienestar corporativo con escaneo biométrico y análisis de IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                HoloCheck Equilibria es una plataforma que permite monitorear la salud de los colaboradores mediante
                escaneos biométricos no invasivos y proporciona recomendaciones personalizadas basadas en inteligencia artificial.
              </p>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  Este manual contiene instrucciones paso a paso para utilizar todas las funcionalidades de la plataforma.
                  Selecciona tu rol en las pestañas para ver la información relevante.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4">
                <h4 className="font-semibold text-slate-900 mb-2">Características Principales:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Escaneo biométrico no invasivo en 30 segundos</li>
                  <li>Análisis de 28+ indicadores de salud</li>
                  <li>Recomendaciones personalizadas basadas en IA</li>
                  <li>Dashboard interactivo con visualizaciones en tiempo real</li>
                  <li>Programa de beneficios de lealtad</li>
                  <li>Análisis organizacional y reportes ejecutivos</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Tabs por Rol */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="employee">Empleado</TabsTrigger>
              <TabsTrigger value="leader">Líder</TabsTrigger>
              <TabsTrigger value="hr">HR</TabsTrigger>
              <TabsTrigger value="org-admin">Org Admin</TabsTrigger>
              <TabsTrigger value="platform-admin">Platform Admin</TabsTrigger>
            </TabsList>

            {/* EMPLEADO */}
            <TabsContent value="employee" className="space-y-6">
              <Accordion type="single" collapsible className="space-y-4">
                {/* Dashboard Principal */}
                <AccordionItem value="dashboard">
                  <AccordionTrigger className="text-lg font-semibold">
                    Dashboard Principal
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Tu Dashboard de Salud</CardTitle>
                        <CardDescription>
                          Visualiza tus métricas biométricas y recomendaciones personalizadas
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">¿Qué verás en tu dashboard?</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li><strong>Métricas Principales:</strong> Índice de Riesgo, Presión Arterial, Frecuencia Cardíaca, IMC</li>
                            <li><strong>Indicadores Biométricos:</strong> 28 métricas organizadas en 6 categorías</li>
                            <li><strong>Estrella de Beneficios:</strong> Esquina superior derecha, muestra beneficios disponibles</li>
                            <li><strong>Recomendaciones:</strong> Acceso rápido a tus recomendaciones personalizadas</li>
                          </ul>
                        </div>

                        <Alert>
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertTitle>Interpretación de Colores</AlertTitle>
                          <AlertDescription>
                            <div className="space-y-1 mt-2">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-500">Verde</Badge>
                                <span className="text-sm">Valores dentro del rango saludable</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-yellow-500">Amarillo</Badge>
                                <span className="text-sm">Valores que requieren atención</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-red-500">Rojo</Badge>
                                <span className="text-sm">Valores fuera del rango recomendado</span>
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Realizar Escaneo */}
                <AccordionItem value="scan">
                  <AccordionTrigger className="text-lg font-semibold">
                    Realizar Escaneo Biométrico
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Proceso de Escaneo</CardTitle>
                        <CardDescription>
                          Captura de 28 indicadores biométricos en una sola sesión
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Pasos para realizar un escaneo:</h4>
                            <ol className="list-decimal list-inside space-y-2 text-slate-700">
                              <li>Navega a <Badge variant="outline">Realizar Escaneo</Badge> en el menú lateral</li>
                              <li>Completa el cuestionario pre-escaneo (2 pasos)</li>
                              <li>Click en el botón <Badge className="bg-sky-600">Iniciar Nuevo Escaneo</Badge></li>
                              <li>Permite el acceso a la cámara cuando se solicite</li>
                              <li>Posiciona tu rostro dentro del círculo verde</li>
                              <li>Mantén la postura durante 30 segundos</li>
                              <li>Espera mientras se procesan los resultados (2-3 minutos)</li>
                              <li>Revisa tus resultados en el dashboard actualizado</li>
                            </ol>
                          </div>

                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Recomendaciones antes del escaneo</AlertTitle>
                            <AlertDescription>
                              <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                                <li>Ambiente tranquilo y bien iluminado</li>
                                <li>Evita ejercicio intenso 30 minutos antes</li>
                                <li>No consumas cafeína 1 hora antes</li>
                                <li>Mantén una respiración normal y relajada</li>
                                <li>Retira gafas y accesorios que obstruyan el rostro</li>
                              </ul>
                            </AlertDescription>
                          </Alert>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Dashboard de Recomendaciones */}
                <AccordionItem value="recommendations">
                  <AccordionTrigger className="text-lg font-semibold">
                    Dashboard de Recomendaciones
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Recomendaciones Personalizadas</CardTitle>
                        <CardDescription>
                          Sugerencias basadas en tus métricas biométricas y análisis de IA
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Secciones del Dashboard:</h4>
                            <ul className="list-disc list-inside space-y-2 text-slate-700">
                              <li><strong>Estadísticas Generales:</strong> Total, completadas, pendientes, tasa de cumplimiento</li>
                              <li><strong>Recomendaciones Prioritarias:</strong> Top 3 más importantes</li>
                              <li><strong>Filtros:</strong> Por categoría, prioridad y estado</li>
                              <li><strong>Tarjetas de Recomendaciones:</strong> Cada una con detalles y acciones</li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Categorías de Recomendaciones:</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <Badge variant="outline">💪 Salud Física</Badge>
                              <Badge variant="outline">🧠 Salud Mental</Badge>
                              <Badge variant="outline">✨ Estilo de Vida</Badge>
                              <Badge variant="outline">🍎 Nutrición</Badge>
                              <Badge variant="outline">🌙 Sueño</Badge>
                              <Badge variant="outline">❤️ Cardiovascular</Badge>
                              <Badge variant="outline">🧘 Manejo del Estrés</Badge>
                              <Badge variant="outline">⚖️ Composición Corporal</Badge>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Niveles de Prioridad:</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-red-500">Crítica</Badge>
                                <span className="text-sm text-slate-700">Requiere atención inmediata</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-orange-500">Alta</Badge>
                                <span className="text-sm text-slate-700">Importante, atender pronto</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-yellow-500">Media</Badge>
                                <span className="text-sm text-slate-700">Recomendable implementar</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-500">Baja</Badge>
                                <span className="text-sm text-slate-700">Sugerencia de mejora continua</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Acciones disponibles:</h4>
                            <ul className="list-disc list-inside space-y-1 text-slate-700">
                              <li><strong>Ver Detalles:</strong> Abre un diálogo con información completa</li>
                              <li><strong>Marcar como Completada:</strong> Registra tu progreso</li>
                              <li><strong>Posponer:</strong> Programa para más adelante</li>
                              <li><strong>Descartar:</strong> Si no aplica a tu situación</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Historial de Escaneos */}
                <AccordionItem value="history">
                  <AccordionTrigger className="text-lg font-semibold">
                    Historial de Escaneos
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Tu Historial</CardTitle>
                        <CardDescription>
                          Visualiza y compara tus escaneos anteriores
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Funcionalidades:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Tabla con todos tus escaneos históricos</li>
                            <li>Fecha y hora de cada escaneo</li>
                            <li>Métricas principales de cada sesión</li>
                            <li>Comparación entre dos escaneos</li>
                            <li>Visualización de tendencias en gráficos</li>
                            <li>Exportación de datos</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Cómo comparar escaneos:</h4>
                          <ol className="list-decimal list-inside space-y-1 text-slate-700">
                            <li>Selecciona dos escaneos usando los checkboxes</li>
                            <li>Haz clic en "Comparar Seleccionados"</li>
                            <li>Revisa las diferencias en cada métrica</li>
                            <li>Observa las tendencias positivas o negativas</li>
                            <li>Exporta el reporte si lo deseas</li>
                          </ol>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Beneficios de Lealtad */}
                <AccordionItem value="benefits">
                  <AccordionTrigger className="text-lg font-semibold">
                    Beneficios de Lealtad
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Programas de Lealtad</CardTitle>
                        <CardDescription>
                          Accede a beneficios exclusivos de nuestros partners
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Estrella de Beneficios:</h4>
                          <p className="text-slate-700">
                            La estrella dorada flotante en la esquina superior derecha de tu dashboard indica
                            el número de beneficios disponibles para ti.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Cómo acceder a beneficios:</h4>
                          <ol className="list-decimal list-inside space-y-1 text-slate-700">
                            <li>Click en la estrella de beneficios en tu dashboard</li>
                            <li>Revisa la lista completa de beneficios disponibles</li>
                            <li>Selecciona el beneficio que deseas usar</li>
                            <li>Lee los términos y condiciones</li>
                            <li>Sigue las instrucciones específicas para activarlo</li>
                            <li>Presenta el código al proveedor</li>
                          </ol>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Tipos de beneficios:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Descuentos en gimnasios y centros deportivos</li>
                            <li>Consultas con nutricionistas y entrenadores</li>
                            <li>Productos de bienestar y suplementos</li>
                            <li>Servicios de salud mental y terapia</li>
                            <li>Clases de yoga, meditación y mindfulness</li>
                          </ul>
                        </div>

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertTitle>Indicadores con Beneficios</AlertTitle>
                          <AlertDescription>
                            Algunos indicadores biométricos tienen una estrella dorada pequeña junto a ellos,
                            indicando que hay beneficios específicos asociados a esa métrica.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Perfil Personal */}
                <AccordionItem value="profile">
                  <AccordionTrigger className="text-lg font-semibold">
                    Perfil Personal
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Tu Perfil</CardTitle>
                        <CardDescription>
                          Información personal y configuraciones
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Información del perfil:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Nombre completo</li>
                            <li>Correo electrónico corporativo</li>
                            <li>Departamento</li>
                            <li>Puesto o cargo</li>
                            <li>Fecha de ingreso</li>
                            <li>Foto de perfil (opcional)</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Configuraciones:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Cambiar contraseña</li>
                            <li>Actualizar foto de perfil</li>
                            <li>Configurar notificaciones</li>
                            <li>Preferencias de idioma</li>
                            <li>Zona horaria</li>
                            <li>Privacidad de datos</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            {/* LÍDER */}
            <TabsContent value="leader" className="space-y-6">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="leader-dashboard">
                  <AccordionTrigger className="text-lg font-semibold">
                    Dashboard de Equipo
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Vista Consolidada del Equipo</CardTitle>
                        <CardDescription>
                          Monitorea el bienestar de tu equipo
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Métricas del Equipo:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Número total de miembros</li>
                            <li>Porcentaje de participación en escaneos</li>
                            <li>Índice de riesgo promedio del equipo</li>
                            <li>Distribución de riesgo (gráfico circular)</li>
                            <li>Tendencias mensuales</li>
                            <li>Alertas de miembros que requieren atención</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="leader-insights">
                  <AccordionTrigger className="text-lg font-semibold">
                    Insights y Análisis
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Análisis del Equipo</CardTitle>
                        <CardDescription>
                          Reportes y visualizaciones de datos
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Reportes Disponibles:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Reporte Semanal: Resumen de actividad</li>
                            <li>Reporte Mensual: Análisis de tendencias</li>
                            <li>Análisis de Productividad: Correlación bienestar-productividad</li>
                            <li>Gráficos y visualizaciones interactivas</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="leader-members">
                  <AccordionTrigger className="text-lg font-semibold">
                    Gestión de Miembros
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Información de Miembros</CardTitle>
                        <CardDescription>
                          Visualiza y gestiona la información de cada miembro
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Información disponible:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Nombre y puesto</li>
                            <li>Último escaneo realizado</li>
                            <li>Índice de riesgo actual</li>
                            <li>Número de recomendaciones pendientes</li>
                            <li>Tasa de cumplimiento</li>
                            <li>Historial de escaneos</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            {/* HR */}
            <TabsContent value="hr" className="space-y-6">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="hr-dashboard">
                  <AccordionTrigger className="text-lg font-semibold">
                    Dashboard Organizacional
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Vista Completa de la Organización</CardTitle>
                        <CardDescription>
                          Métricas y análisis organizacionales
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Métricas Organizacionales:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Total de empleados activos</li>
                            <li>Tasa de participación en escaneos</li>
                            <li>Índice de riesgo organizacional</li>
                            <li>Distribución por departamentos</li>
                            <li>Comparación interdepartamental</li>
                            <li>Consumo de recursos</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="hr-users">
                  <AccordionTrigger className="text-lg font-semibold">
                    Gestión de Usuarios
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Administración de Usuarios</CardTitle>
                        <CardDescription>
                          Crear, editar y gestionar usuarios
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Funciones Administrativas:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Crear usuarios (individual o importación masiva CSV)</li>
                            <li>Editar información de usuarios</li>
                            <li>Asignar roles y permisos</li>
                            <li>Cambiar departamento</li>
                            <li>Desactivar/Reactivar usuarios</li>
                            <li>Gestión de bajas y reincorporaciones</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="hr-at-risk">
                  <AccordionTrigger className="text-lg font-semibold">
                    Personas en Riesgo
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Identificación y Seguimiento</CardTitle>
                        <CardDescription>
                          Empleados que requieren atención especial
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Funcionalidades:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Lista de empleados con alto riesgo</li>
                            <li>Filtros por tipo de riesgo</li>
                            <li>Priorización automática</li>
                            <li>Programas de apoyo disponibles</li>
                            <li>Seguimiento personalizado</li>
                            <li>Reportes de evolución</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="hr-wellness">
                  <AccordionTrigger className="text-lg font-semibold">
                    Análisis de Bienestar
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Análisis Profundos</CardTitle>
                        <CardDescription>
                          Insights accionables del bienestar organizacional
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Tipos de análisis:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Análisis por Departamento</li>
                            <li>Análisis Demográfico</li>
                            <li>Análisis de Tendencias</li>
                            <li>Análisis de Correlación</li>
                            <li>Análisis Predictivo</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="hr-reports">
                  <AccordionTrigger className="text-lg font-semibold">
                    Reportes
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Reportes Personalizados</CardTitle>
                        <CardDescription>
                          Genera reportes para diferentes audiencias
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Reportes disponibles:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Reporte Ejecutivo</li>
                            <li>Reporte Operativo</li>
                            <li>Reporte de Cumplimiento</li>
                            <li>Reporte de Impacto (ROI)</li>
                            <li>Reporte Personalizado</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            {/* ORG ADMIN */}
            <TabsContent value="org-admin" className="space-y-6">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="org-dashboard">
                  <AccordionTrigger className="text-lg font-semibold">
                    Dashboard Ejecutivo
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Vista Estratégica</CardTitle>
                        <CardDescription>
                          KPIs y métricas ejecutivas
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Indicadores Clave (KPIs):</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Adopción de la plataforma</li>
                            <li>Usuarios activos y frecuencia de uso</li>
                            <li>Impacto en salud organizacional</li>
                            <li>Mejora promedio en métricas</li>
                            <li>Eficiencia operativa</li>
                            <li>ROI del programa</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="org-departments">
                  <AccordionTrigger className="text-lg font-semibold">
                    Gestión de Departamentos
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Administración Departamental</CardTitle>
                        <CardDescription>
                          Crear y configurar departamentos
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Funciones:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Crear nuevos departamentos</li>
                            <li>Asignar líderes de departamento</li>
                            <li>Definir objetivos departamentales</li>
                            <li>Configurar métricas específicas</li>
                            <li>Asignar recursos y créditos</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="org-prompts">
                  <AccordionTrigger className="text-lg font-semibold">
                    Configuración de IA
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Personalización del Análisis de IA</CardTitle>
                        <CardDescription>
                          Ajusta los prompts y parámetros de análisis
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Personalización:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Crear prompts personalizados</li>
                            <li>Ajustar parámetros de análisis</li>
                            <li>Definir criterios de recomendación</li>
                            <li>Seleccionar modelos de IA</li>
                            <li>Configurar umbrales y sensibilidad</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="org-insights">
                  <AccordionTrigger className="text-lg font-semibold">
                    Insights Organizacionales
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Análisis Avanzados</CardTitle>
                        <CardDescription>
                          Análisis predictivos del bienestar organizacional
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Análisis disponibles:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Análisis de Riesgo Organizacional</li>
                            <li>Análisis Predictivo</li>
                            <li>Análisis de Impacto</li>
                            <li>Benchmarking</li>
                            <li>Análisis de Efectividad</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            {/* PLATFORM ADMIN */}
            <TabsContent value="platform-admin" className="space-y-6">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="admin-organizations">
                  <AccordionTrigger className="text-lg font-semibold">
                    Gestión de Organizaciones
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Administración Global</CardTitle>
                        <CardDescription>
                          Crear y gestionar organizaciones
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Funciones Globales:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Crear nuevas organizaciones</li>
                            <li>Configurar información corporativa</li>
                            <li>Asignar recursos y límites</li>
                            <li>Configurar suscripciones</li>
                            <li>Monitorear uso por organización</li>
                            <li>Gestionar facturación</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="admin-branding">
                  <AccordionTrigger className="text-lg font-semibold">
                    Branding Organizacional
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Personalización Visual</CardTitle>
                        <CardDescription>
                          Configura la identidad visual de cada organización
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Personalización:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Subir logo corporativo</li>
                            <li>Definir paleta de colores</li>
                            <li>Personalizar tema visual</li>
                            <li>Mensajes personalizados de bienvenida</li>
                            <li>Configurar elementos de marca</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="admin-partnerships">
                  <AccordionTrigger className="text-lg font-semibold">
                    Gestión de Partnerships
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Alianzas Comerciales</CardTitle>
                        <CardDescription>
                          Administra partners y beneficios
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Gestión de Partners:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Crear nuevos partners comerciales</li>
                            <li>Definir información de contacto</li>
                            <li>Especificar tipo de servicio</li>
                            <li>Crear beneficios asociados</li>
                            <li>Configurar términos y condiciones</li>
                            <li>Asignar partners a organizaciones</li>
                            <li>Gestionar acuerdos y renovaciones</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="admin-users">
                  <AccordionTrigger className="text-lg font-semibold">
                    Gestión de Usuarios Globales
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Administración de Usuarios</CardTitle>
                        <CardDescription>
                          Usuarios a nivel de plataforma
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900">Funciones:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Crear administradores de plataforma</li>
                            <li>Asignar permisos granulares</li>
                            <li>Gestionar accesos a múltiples organizaciones</li>
                            <li>Monitorear actividad de administradores</li>
                            <li>Auditar cambios realizados</li>
                            <li>Configurar autenticación de dos factores</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
          </Tabs>

          {/* FAQ */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-sky-600" />
                Preguntas Frecuentes (FAQ)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">¿Qué es HoloCheck Equilibria?</h4>
                <p className="text-sm text-slate-700">
                  Es una plataforma de bienestar corporativo que utiliza escaneo biométrico no invasivo e inteligencia artificial
                  para monitorear y mejorar la salud de los colaboradores.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">¿Es seguro el escaneo biométrico?</h4>
                <p className="text-sm text-slate-700">
                  Sí, el escaneo es completamente no invasivo y utiliza tecnología de análisis facial que no almacena imágenes.
                  Solo se procesan y guardan las métricas biométricas.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">¿Cuánto tiempo toma un escaneo?</h4>
                <p className="text-sm text-slate-700">
                  El escaneo en sí toma aproximadamente 30 segundos. El procesamiento de resultados toma entre 2-3 minutos adicionales.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">¿Quién puede ver mis datos de salud?</h4>
                <p className="text-sm text-slate-700">
                  Solo tú tienes acceso completo a tus datos individuales. HR puede ver datos agregados y anónimos.
                  Los líderes de equipo ven métricas consolidadas sin identificar individuos específicos.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">¿Con qué frecuencia debo realizar escaneos?</h4>
                <p className="text-sm text-slate-700">
                  Se recomienda realizar al menos un escaneo mensual para monitorear tendencias.
                  Para seguimiento más cercano, puedes realizar escaneos semanales.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Soporte */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-sky-600" />
                Soporte Técnico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Email</h4>
                  <p className="text-sm text-slate-700">soporte@holocheck.com</p>
                  <p className="text-xs text-slate-500">Respuesta en 24 horas</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Chat en Vivo</h4>
                  <p className="text-sm text-slate-700">Disponible en la plataforma</p>
                  <p className="text-xs text-slate-500">Lun-Vie, 8:00 AM - 6:00 PM</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Teléfono</h4>
                  <p className="text-sm text-slate-700">+506 1234-5678</p>
                  <p className="text-xs text-slate-500">Lun-Vie, 8:00 AM - 6:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-600">
          <p>© 2026 HoloCheck Equilibria. Todos los derechos reservados.</p>
          <p className="mt-2">
            Versión del Manual: 1.0 | Última Actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>
      </div>
    </div>
  );
}