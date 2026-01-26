# Dashboard de Recomendaciones - Especificaciones Completas

## 1. Resumen Ejecutivo

### Objetivo
Crear un Dashboard de Recomendaciones personalizado para empleados que muestre análisis de IA y recomendaciones accionables basadas en sus datos biométricos y de bienestar.

### Alcance
- Visualización de recomendaciones generadas por IA
- Categorización por áreas de salud
- Priorización inteligente
- Seguimiento de progreso
- Integración con datos biométricos existentes

### Usuarios Objetivo
- Empleados que han completado escaneos biométricos
- Empleados con historial de mediciones
- Empleados activos en la plataforma

---

## 2. Análisis del Documento de Referencia

### Flujo del Análisis de IA

Basándome en las mejores prácticas de la industria y el sistema Equilibria existente, el flujo de análisis de IA incluye:

**Entrada de Datos:**
- Mediciones biométricas de `biometric_measurements`
- Historial de escaneos
- Perfil del usuario
- Tendencias temporales

**Procesamiento:**
- Análisis de indicadores individuales
- Detección de patrones y tendencias
- Evaluación de riesgos
- Generación de insights personalizados

**Salida:**
- Recomendaciones categorizadas
- Niveles de prioridad
- Acciones específicas
- Recursos y enlaces

### Tipos de Recomendaciones

1. **Salud Física**
   - Actividad física
   - Ejercicio cardiovascular
   - Fuerza y flexibilidad

2. **Salud Mental**
   - Manejo de estrés
   - Técnicas de relajación
   - Mindfulness y meditación

3. **Nutrición**
   - Hábitos alimenticios
   - Hidratación
   - Suplementación

4. **Sueño**
   - Calidad del sueño
   - Higiene del sueño
   - Rutinas nocturnas

5. **Estilo de Vida**
   - Balance trabajo-vida
   - Hábitos saludables
   - Prevención

6. **Cardiovascular**
   - Salud del corazón
   - Presión arterial
   - Riesgo cardiovascular

---

## 3. Fuentes de Datos

### Tablas de Base de Datos

#### Tabla Principal: `ai_analysis_results`
```sql
-- Estructura esperada
CREATE TABLE ai_analysis_results (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  scan_id UUID REFERENCES scans(id),
  analysis_date TIMESTAMP,
  overall_score NUMERIC,
  risk_level TEXT,
  summary TEXT,
  detailed_analysis JSONB,
  created_at TIMESTAMP
);
```

#### Tabla de Recomendaciones: `ai_recommendations`
```sql
-- Estructura esperada
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY,
  analysis_id UUID REFERENCES ai_analysis_results(id),
  user_id UUID REFERENCES users(id),
  category TEXT, -- 'physical', 'mental', 'nutrition', 'sleep', 'lifestyle', 'cardiovascular'
  priority TEXT, -- 'critical', 'high', 'medium', 'low'
  title TEXT,
  description TEXT,
  action_steps TEXT[],
  expected_impact TEXT,
  resources JSONB, -- links, articles, videos
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP
);
```

#### Tablas Relacionadas:
- `biometric_measurements` - Datos biométricos base
- `scans` - Historial de escaneos
- `users` - Perfil del usuario
- `user_progress` - Seguimiento de progreso

### Queries SQL Principales

#### 1. Obtener Recomendaciones Activas
```typescript
const { data: recommendations, error } = await supabase
  .from('ai_recommendations')
  .select(`
    *,
    ai_analysis_results (
      overall_score,
      risk_level,
      analysis_date
    )
  `)
  .eq('user_id', userId)
  .eq('is_completed', false)
  .order('priority', { ascending: true })
  .order('created_at', { ascending: false });
```

#### 2. Obtener Estadísticas de Recomendaciones
```typescript
const { data: stats } = await supabase
  .rpc('get_recommendation_stats', { 
    p_user_id: userId 
  });

// Función SQL esperada:
CREATE OR REPLACE FUNCTION get_recommendation_stats(p_user_id UUID)
RETURNS TABLE (
  total_recommendations INTEGER,
  completed_recommendations INTEGER,
  pending_recommendations INTEGER,
  critical_count INTEGER,
  high_count INTEGER,
  medium_count INTEGER,
  low_count INTEGER,
  by_category JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_recommendations,
    COUNT(*) FILTER (WHERE is_completed = true)::INTEGER as completed_recommendations,
    COUNT(*) FILTER (WHERE is_completed = false)::INTEGER as pending_recommendations,
    COUNT(*) FILTER (WHERE priority = 'critical')::INTEGER as critical_count,
    COUNT(*) FILTER (WHERE priority = 'high')::INTEGER as high_count,
    COUNT(*) FILTER (WHERE priority = 'medium')::INTEGER as medium_count,
    COUNT(*) FILTER (WHERE priority = 'low')::INTEGER as low_count,
    jsonb_object_agg(category, category_count) as by_category
  FROM (
    SELECT 
      category,
      COUNT(*)::INTEGER as category_count
    FROM ai_recommendations
    WHERE user_id = p_user_id
    GROUP BY category
  ) cat_counts;
END;
$$ LANGUAGE plpgsql;
```

#### 3. Obtener Recomendaciones por Categoría
```typescript
const { data: categoryRecs } = await supabase
  .from('ai_recommendations')
  .select('*')
  .eq('user_id', userId)
  .eq('category', category)
  .eq('is_completed', false)
  .order('priority', { ascending: true })
  .limit(10);
```

#### 4. Obtener Historial de Progreso
```typescript
const { data: progress } = await supabase
  .from('ai_recommendations')
  .select('completed_at, category, priority')
  .eq('user_id', userId)
  .eq('is_completed', true)
  .order('completed_at', { ascending: false })
  .limit(20);
```

#### 5. Marcar Recomendación como Completada
```typescript
const { error } = await supabase
  .from('ai_recommendations')
  .update({ 
    is_completed: true, 
    completed_at: new Date().toISOString() 
  })
  .eq('id', recommendationId)
  .eq('user_id', userId);
```

---

## 4. Estructura Completa del Dashboard

### Layout Principal

```tsx
<div className="container mx-auto p-6 space-y-6">
  {/* Header con título y última actualización */}
  <RecommendationsHeader />
  
  {/* Resumen General - Cards de estadísticas */}
  <RecommendationsSummary stats={stats} />
  
  {/* Recomendaciones Prioritarias - Destacadas */}
  <PriorityRecommendations recommendations={criticalRecs} />
  
  {/* Tabs por Categoría */}
  <RecommendationsByCategory 
    categories={categories}
    recommendations={recommendations}
  />
  
  {/* Progreso y Historial */}
  <ProgressSection progress={progress} />
</div>
```

### Componentes Detallados

#### A. RecommendationsHeader
```tsx
interface RecommendationsHeaderProps {
  lastUpdate: Date;
  overallScore: number;
  riskLevel: string;
}

<div className="flex justify-between items-center">
  <div>
    <h1 className="text-3xl font-bold">Mis Recomendaciones</h1>
    <p className="text-muted-foreground">
      Basadas en tu último análisis del {formatDate(lastUpdate)}
    </p>
  </div>
  <div className="text-right">
    <div className="text-sm text-muted-foreground">Puntuación General</div>
    <div className="text-2xl font-bold">{overallScore}/100</div>
    <Badge variant={getRiskVariant(riskLevel)}>{riskLevel}</Badge>
  </div>
</div>
```

#### B. RecommendationsSummary
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Card: Total de Recomendaciones */}
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">
        Total de Recomendaciones
      </CardTitle>
      <ClipboardList className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{stats.total}</div>
      <p className="text-xs text-muted-foreground">
        {stats.pending} pendientes
      </p>
    </CardContent>
  </Card>

  {/* Card: Completadas */}
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">
        Completadas
      </CardTitle>
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-green-600">
        {stats.completed}
      </div>
      <Progress 
        value={(stats.completed / stats.total) * 100} 
        className="mt-2"
      />
    </CardContent>
  </Card>

  {/* Card: Prioridad Alta */}
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">
        Alta Prioridad
      </CardTitle>
      <AlertTriangle className="h-4 w-4 text-orange-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-orange-600">
        {stats.critical + stats.high}
      </div>
      <p className="text-xs text-muted-foreground">
        Requieren atención inmediata
      </p>
    </CardContent>
  </Card>

  {/* Card: Por Categoría */}
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">
        Categorías Activas
      </CardTitle>
      <Layers className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {Object.keys(stats.by_category).length}
      </div>
      <p className="text-xs text-muted-foreground">
        Áreas de mejora identificadas
      </p>
    </CardContent>
  </Card>
</div>
```

#### C. PriorityRecommendations
```tsx
<Card className="border-orange-200 bg-orange-50">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <AlertTriangle className="h-5 w-5 text-orange-600" />
      Recomendaciones Prioritarias
    </CardTitle>
    <CardDescription>
      Estas recomendaciones requieren tu atención inmediata
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {criticalRecs.map(rec => (
        <PriorityRecommendationCard key={rec.id} recommendation={rec} />
      ))}
    </div>
  </CardContent>
</Card>

// PriorityRecommendationCard Component
<Card className="border-l-4 border-l-orange-500">
  <CardHeader>
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <CardTitle className="text-lg">{rec.title}</CardTitle>
        <div className="flex gap-2 mt-2">
          <Badge variant="destructive">{rec.priority}</Badge>
          <Badge variant="outline">{rec.category}</Badge>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => markAsCompleted(rec.id)}
      >
        <Check className="h-4 w-4 mr-1" />
        Completar
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground mb-4">
      {rec.description}
    </p>
    
    {/* Pasos de Acción */}
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Pasos a seguir:</h4>
      <ul className="list-disc list-inside space-y-1">
        {rec.action_steps.map((step, idx) => (
          <li key={idx} className="text-sm">{step}</li>
        ))}
      </ul>
    </div>

    {/* Impacto Esperado */}
    <div className="mt-4 p-3 bg-blue-50 rounded-md">
      <div className="flex items-start gap-2">
        <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Impacto Esperado
          </p>
          <p className="text-sm text-blue-700">{rec.expected_impact}</p>
        </div>
      </div>
    </div>

    {/* Recursos */}
    {rec.resources && rec.resources.length > 0 && (
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Recursos útiles:</h4>
        <div className="flex flex-wrap gap-2">
          {rec.resources.map((resource, idx) => (
            <Button 
              key={idx} 
              variant="link" 
              size="sm"
              onClick={() => window.open(resource.url, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              {resource.title}
            </Button>
          ))}
        </div>
      </div>
    )}
  </CardContent>
</Card>
```

#### D. RecommendationsByCategory
```tsx
<Tabs defaultValue="all" className="w-full">
  <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
    <TabsTrigger value="all">
      <Layers className="h-4 w-4 mr-2" />
      Todas
    </TabsTrigger>
    <TabsTrigger value="physical">
      <Activity className="h-4 w-4 mr-2" />
      Física
    </TabsTrigger>
    <TabsTrigger value="mental">
      <Brain className="h-4 w-4 mr-2" />
      Mental
    </TabsTrigger>
    <TabsTrigger value="nutrition">
      <Apple className="h-4 w-4 mr-2" />
      Nutrición
    </TabsTrigger>
    <TabsTrigger value="sleep">
      <Moon className="h-4 w-4 mr-2" />
      Sueño
    </TabsTrigger>
    <TabsTrigger value="lifestyle">
      <Heart className="h-4 w-4 mr-2" />
      Estilo de Vida
    </TabsTrigger>
    <TabsTrigger value="cardiovascular">
      <HeartPulse className="h-4 w-4 mr-2" />
      Cardiovascular
    </TabsTrigger>
  </TabsList>

  {/* Filtros adicionales */}
  <div className="flex gap-4 mt-4 mb-4">
    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Prioridad" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas las prioridades</SelectItem>
        <SelectItem value="critical">Crítica</SelectItem>
        <SelectItem value="high">Alta</SelectItem>
        <SelectItem value="medium">Media</SelectItem>
        <SelectItem value="low">Baja</SelectItem>
      </SelectContent>
    </Select>

    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Estado" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos</SelectItem>
        <SelectItem value="pending">Pendientes</SelectItem>
        <SelectItem value="completed">Completadas</SelectItem>
      </SelectContent>
    </Select>

    <div className="flex-1" />

    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar recomendaciones..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-8 w-[300px]"
      />
    </div>
  </div>

  {/* Contenido de cada Tab */}
  <TabsContent value="all" className="space-y-4">
    {filteredRecommendations.map(rec => (
      <RecommendationCard key={rec.id} recommendation={rec} />
    ))}
  </TabsContent>

  {/* Repetir para cada categoría */}
  <TabsContent value="physical" className="space-y-4">
    {/* ... */}
  </TabsContent>
</Tabs>

// RecommendationCard Component
<Card className={cn(
  "transition-all hover:shadow-md",
  rec.is_completed && "opacity-60"
)}>
  <CardHeader>
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <CategoryIcon category={rec.category} />
          <CardTitle className="text-base">{rec.title}</CardTitle>
        </div>
        <div className="flex gap-2">
          <Badge variant={getPriorityVariant(rec.priority)}>
            {rec.priority}
          </Badge>
          <Badge variant="outline">{rec.category}</Badge>
          {rec.is_completed && (
            <Badge variant="success">
              <Check className="h-3 w-3 mr-1" />
              Completada
            </Badge>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleExpand(rec.id)}
        >
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </Button>
        {!rec.is_completed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAsCompleted(rec.id)}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  </CardHeader>
  
  {expanded && (
    <CardContent>
      <p className="text-sm text-muted-foreground mb-4">
        {rec.description}
      </p>
      
      {/* Pasos de acción */}
      <Accordion type="single" collapsible>
        <AccordionItem value="steps">
          <AccordionTrigger>Pasos a seguir</AccordionTrigger>
          <AccordionContent>
            <ol className="list-decimal list-inside space-y-2">
              {rec.action_steps.map((step, idx) => (
                <li key={idx} className="text-sm">{step}</li>
              ))}
            </ol>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="impact">
          <AccordionTrigger>Impacto esperado</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm">{rec.expected_impact}</p>
          </AccordionContent>
        </AccordionItem>
        
        {rec.resources && rec.resources.length > 0 && (
          <AccordionItem value="resources">
            <AccordionTrigger>Recursos adicionales</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {rec.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {resource.title}
                  </a>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </CardContent>
  )}
</Card>
```

#### E. ProgressSection
```tsx
<Card>
  <CardHeader>
    <CardTitle>Mi Progreso</CardTitle>
    <CardDescription>
      Historial de recomendaciones completadas
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Gráfico de progreso temporal */}
    <div className="mb-6">
      <h4 className="text-sm font-semibold mb-4">
        Recomendaciones completadas por mes
      </h4>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyProgress}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completed" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Lista de recomendaciones completadas recientes */}
    <div>
      <h4 className="text-sm font-semibold mb-4">
        Completadas recientemente
      </h4>
      <div className="space-y-3">
        {recentCompleted.map(rec => (
          <div 
            key={rec.id}
            className="flex items-center gap-3 p-3 bg-green-50 rounded-md"
          >
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium">{rec.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(rec.completed_at)}
              </p>
            </div>
            <Badge variant="outline">{rec.category}</Badge>
          </div>
        ))}
      </div>
    </div>

    {/* Estadísticas de progreso por categoría */}
    <div className="mt-6">
      <h4 className="text-sm font-semibold mb-4">
        Progreso por categoría
      </h4>
      <div className="space-y-3">
        {Object.entries(progressByCategory).map(([category, data]) => (
          <div key={category}>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center gap-2">
                <CategoryIcon category={category} />
                {getCategoryLabel(category)}
              </span>
              <span className="font-medium">
                {data.completed}/{data.total}
              </span>
            </div>
            <Progress 
              value={(data.completed / data.total) * 100}
              className="h-2"
            />
          </div>
        ))}
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 5. Diseño Visual

### Paleta de Colores por Prioridad

```typescript
const priorityColors = {
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-800',
    icon: 'text-red-600'
  },
  high: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-800',
    icon: 'text-orange-600'
  },
  medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-800',
    icon: 'text-yellow-600'
  },
  low: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800',
    icon: 'text-green-600'
  }
};
```

### Iconos por Categoría

```typescript
const categoryIcons = {
  physical: Activity,
  mental: Brain,
  nutrition: Apple,
  sleep: Moon,
  lifestyle: Heart,
  cardiovascular: HeartPulse
};

const categoryColors = {
  physical: 'text-blue-600',
  mental: 'text-purple-600',
  nutrition: 'text-green-600',
  sleep: 'text-indigo-600',
  lifestyle: 'text-pink-600',
  cardiovascular: 'text-red-600'
};
```

### Responsive Design

```css
/* Mobile: 1 columna */
@media (max-width: 768px) {
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .tabs-list {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  
  .filters {
    flex-direction: column;
  }
}

/* Tablet: 2 columnas */
@media (min-width: 768px) and (max-width: 1024px) {
  .recommendations-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 3-4 columnas según sección */
@media (min-width: 1024px) {
  .summary-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .recommendations-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## 6. Componentes UI

### Componentes Existentes a Reutilizar

De shadcn-ui:
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Button`
- `Badge`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- `Input`
- `Progress`
- `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`
- `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`

De lucide-react:
- `Activity`, `Brain`, `Apple`, `Moon`, `Heart`, `HeartPulse`
- `AlertTriangle`, `CheckCircle2`, `Check`, `ChevronDown`, `ChevronUp`
- `ExternalLink`, `Search`, `Layers`, `ClipboardList`, `TrendingUp`

### Componentes Nuevos a Crear

1. **RecommendationsHeader.tsx**
   - Props: lastUpdate, overallScore, riskLevel
   - Muestra título, fecha y puntuación general

2. **RecommendationsSummary.tsx**
   - Props: stats (total, completed, pending, by_priority, by_category)
   - Grid de 4 cards con estadísticas

3. **PriorityRecommendations.tsx**
   - Props: recommendations (array de recomendaciones críticas/altas)
   - Lista destacada de recomendaciones prioritarias

4. **PriorityRecommendationCard.tsx**
   - Props: recommendation
   - Card expandido con todos los detalles
   - Botón de completar

5. **RecommendationsByCategory.tsx**
   - Props: categories, recommendations
   - Tabs con filtros y búsqueda
   - Lista de recomendaciones por categoría

6. **RecommendationCard.tsx**
   - Props: recommendation
   - Card colapsable con detalles
   - Accordion para pasos, impacto, recursos

7. **ProgressSection.tsx**
   - Props: progress (historial de completadas)
   - Gráfico de progreso temporal
   - Lista de completadas recientes
   - Progreso por categoría

8. **CategoryIcon.tsx**
   - Props: category
   - Retorna el icono apropiado según categoría

---

## 7. Flujo de Usuario Detallado

### Flujo Principal

```
1. Usuario navega a "Recomendaciones" desde el menú
   ↓
2. Sistema carga datos:
   - Última análisis de IA
   - Recomendaciones activas
   - Estadísticas
   - Historial de progreso
   ↓
3. Se muestra Dashboard con:
   - Header con puntuación general
   - Resumen en 4 cards
   - Recomendaciones prioritarias destacadas
   - Tabs por categoría
   - Sección de progreso
   ↓
4. Usuario puede:
   a) Ver recomendaciones prioritarias
   b) Filtrar por categoría
   c) Filtrar por prioridad
   d) Buscar recomendaciones
   e) Expandir/colapsar detalles
   f) Marcar como completada
   g) Ver recursos adicionales
   h) Revisar progreso histórico
```

### Flujo de Interacción: Ver Detalles

```
1. Usuario ve lista de recomendaciones
   ↓
2. Usuario hace click en card o botón expandir
   ↓
3. Card se expande mostrando:
   - Descripción completa
   - Pasos de acción (Accordion)
   - Impacto esperado (Accordion)
   - Recursos adicionales (Accordion)
   ↓
4. Usuario puede:
   - Leer cada sección
   - Abrir recursos externos
   - Marcar como completada
   - Colapsar card
```

### Flujo de Interacción: Completar Recomendación

```
1. Usuario hace click en botón "Completar"
   ↓
2. Sistema muestra confirmación (opcional)
   ↓
3. Sistema actualiza base de datos:
   - is_completed = true
   - completed_at = now()
   ↓
4. UI se actualiza:
   - Card se marca como completada (opacidad reducida)
   - Badge "Completada" aparece
   - Estadísticas se actualizan
   - Progreso se actualiza
   ↓
5. Sistema muestra notificación de éxito
   ↓
6. Card se mueve a sección de historial (opcional)
```

### Flujo de Interacción: Filtrar y Buscar

```
1. Usuario selecciona filtros:
   - Categoría (tab)
   - Prioridad (select)
   - Estado (select)
   - O escribe en búsqueda
   ↓
2. Sistema filtra recomendaciones en tiempo real
   ↓
3. Lista se actualiza mostrando solo coincidencias
   ↓
4. Si no hay resultados:
   - Muestra mensaje "No se encontraron recomendaciones"
   - Sugiere ajustar filtros
```

### Flujo de Interacción: Ver Progreso

```
1. Usuario hace scroll a sección de progreso
   ↓
2. Ve gráfico de completadas por mes
   ↓
3. Ve lista de completadas recientemente
   ↓
4. Ve progreso por categoría con barras
   ↓
5. Usuario puede:
   - Analizar tendencias
   - Ver detalles de completadas
   - Comparar progreso entre categorías
```

---

## 8. Casos Especiales

### Caso 1: Usuario sin Recomendaciones

**Escenario:** Usuario nuevo o sin análisis de IA reciente

**Solución:**
```tsx
{recommendations.length === 0 ? (
  <Card className="text-center py-12">
    <CardContent>
      <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        No tienes recomendaciones aún
      </h3>
      <p className="text-muted-foreground mb-6">
        Completa tu primer escaneo biométrico para recibir recomendaciones personalizadas
      </p>
      <Button onClick={() => navigate('/employee/pre-scan')}>
        Realizar Escaneo
      </Button>
    </CardContent>
  </Card>
) : (
  // Dashboard normal
)}
```

### Caso 2: Error al Cargar Datos

**Escenario:** Fallo en conexión a base de datos o error en query

**Solución:**
```tsx
{error ? (
  <Card className="border-red-200 bg-red-50">
    <CardContent className="text-center py-12">
      <AlertTriangle className="h-16 w-16 mx-auto text-red-600 mb-4" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Error al cargar recomendaciones
      </h3>
      <p className="text-red-700 mb-6">
        {error.message || 'Ocurrió un error inesperado'}
      </p>
      <Button 
        variant="outline" 
        onClick={() => refetch()}
      >
        Reintentar
      </Button>
    </CardContent>
  </Card>
) : (
  // Dashboard normal
)}
```

### Caso 3: Análisis Antiguo

**Escenario:** Última análisis tiene más de 30 días

**Solución:**
```tsx
{isAnalysisOld && (
  <Alert variant="warning" className="mb-6">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Recomendaciones desactualizadas</AlertTitle>
    <AlertDescription>
      Tu último análisis fue hace {daysSinceLastAnalysis} días.
      Te recomendamos realizar un nuevo escaneo para obtener recomendaciones actualizadas.
    </AlertDescription>
    <Button 
      variant="outline" 
      size="sm" 
      className="mt-2"
      onClick={() => navigate('/employee/pre-scan')}
    >
      Realizar Nuevo Escaneo
    </Button>
  </Alert>
)}
```

### Caso 4: Todas las Recomendaciones Completadas

**Escenario:** Usuario completó todas sus recomendaciones

**Solución:**
```tsx
{allCompleted ? (
  <Card className="border-green-200 bg-green-50 text-center py-12">
    <CardContent>
      <CheckCircle2 className="h-16 w-16 mx-auto text-green-600 mb-4" />
      <h3 className="text-lg font-semibold text-green-900 mb-2">
        ¡Felicitaciones! 🎉
      </h3>
      <p className="text-green-700 mb-6">
        Has completado todas tus recomendaciones actuales.
        Realiza un nuevo escaneo para obtener nuevas recomendaciones personalizadas.
      </p>
      <div className="flex gap-4 justify-center">
        <Button onClick={() => navigate('/employee/pre-scan')}>
          Nuevo Escaneo
        </Button>
        <Button 
          variant="outline"
          onClick={() => setShowCompleted(true)}
        >
          Ver Historial
        </Button>
      </div>
    </CardContent>
  </Card>
) : (
  // Dashboard normal
)}
```

### Caso 5: Cargando Datos

**Escenario:** Datos aún se están cargando

**Solución:**
```tsx
{loading ? (
  <div className="space-y-6">
    {/* Skeleton para Header */}
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <Skeleton className="h-16 w-[100px]" />
    </div>

    {/* Skeleton para Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[80px] mb-2" />
            <Skeleton className="h-3 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Skeleton para Recomendaciones */}
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-[250px] mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-[60px]" />
              <Skeleton className="h-5 w-[80px]" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-[80%]" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
) : (
  // Dashboard normal
)}
```

### Caso 6: Recomendación sin Recursos

**Escenario:** Recomendación no tiene recursos adicionales

**Solución:**
```tsx
{rec.resources && rec.resources.length > 0 ? (
  <AccordionItem value="resources">
    <AccordionTrigger>Recursos adicionales</AccordionTrigger>
    <AccordionContent>
      {/* Mostrar recursos */}
    </AccordionContent>
  </AccordionItem>
) : (
  <div className="text-sm text-muted-foreground italic mt-4">
    No hay recursos adicionales disponibles para esta recomendación.
  </div>
)}
```

---

## 9. Plan de Integración

### Fase 1: Preparación de Datos (Verificar/Crear Tablas)

**Acción:** Verificar que existan las tablas necesarias o crearlas

```sql
-- Verificar existencia de tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ai_analysis_results', 'ai_recommendations');

-- Si no existen, crear tablas (ver sección 3 para estructura)
```

### Fase 2: Crear Componentes Base

**Orden de creación:**
1. `CategoryIcon.tsx` - Componente simple de iconos
2. `RecommendationsHeader.tsx` - Header del dashboard
3. `RecommendationsSummary.tsx` - Cards de estadísticas
4. `PriorityRecommendationCard.tsx` - Card individual prioritario
5. `PriorityRecommendations.tsx` - Sección de prioritarias
6. `RecommendationCard.tsx` - Card individual normal
7. `RecommendationsByCategory.tsx` - Tabs con lista
8. `ProgressSection.tsx` - Sección de progreso

### Fase 3: Crear Página Principal

**Archivo:** `/workspace/app/frontend/src/pages/employee/Recommendations.tsx`

**Estructura:**
```tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// Importar componentes
import RecommendationsHeader from '@/components/recommendations/RecommendationsHeader';
import RecommendationsSummary from '@/components/recommendations/RecommendationsSummary';
// ... otros imports

export default function Recommendations() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    analysis: null,
    recommendations: [],
    stats: null,
    progress: []
  });

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      
      // Cargar análisis más reciente
      const { data: analysis } = await supabase
        .from('ai_analysis_results')
        .select('*')
        .eq('user_id', user.id)
        .order('analysis_date', { ascending: false })
        .limit(1)
        .single();

      // Cargar recomendaciones
      const { data: recommendations } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true });

      // Cargar estadísticas
      const { data: stats } = await supabase
        .rpc('get_recommendation_stats', { p_user_id: user.id });

      // Cargar progreso
      const { data: progress } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false })
        .limit(20);

      setData({ analysis, recommendations, stats, progress });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  // Render logic
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Componentes */}
    </div>
  );
}
```

### Fase 4: Integrar con Rutas

**Archivo:** `/workspace/app/frontend/src/App.tsx`

```tsx
import Recommendations from './pages/employee/Recommendations';

// En el Router
<Route path="/employee/recommendations" element={<Recommendations />} />
```

### Fase 5: Actualizar Menú

**Archivo:** `/workspace/app/frontend/src/components/layout/EmployeeLayout.tsx`

```tsx
const menuItems = [
  // ... items existentes
  {
    label: 'Recomendaciones',
    path: '/employee/recommendations',
    icon: ClipboardList
  }
];
```

### Fase 6: Testing

**Checklist de pruebas:**
- [ ] Dashboard carga correctamente
- [ ] Estadísticas se muestran
- [ ] Recomendaciones prioritarias destacadas
- [ ] Filtros funcionan (categoría, prioridad, estado)
- [ ] Búsqueda funciona
- [ ] Expandir/colapsar cards funciona
- [ ] Marcar como completada funciona
- [ ] Progreso se actualiza
- [ ] Casos especiales se manejan (sin datos, error, etc.)
- [ ] Responsive en mobile, tablet, desktop
- [ ] Performance aceptable con muchas recomendaciones

---

## 10. Plan de Implementación para Alex

### Prioridad 1: Crítico (Día 1-2)

**Tareas:**
1. ✅ Verificar/crear tablas en base de datos
2. ✅ Crear componente `CategoryIcon`
3. ✅ Crear componente `RecommendationsHeader`
4. ✅ Crear componente `RecommendationsSummary`
5. ✅ Crear componente `RecommendationCard` básico
6. ✅ Crear página principal `Recommendations.tsx` con estructura básica
7. ✅ Integrar ruta en App.tsx
8. ✅ Testing básico

**Entregable:** Dashboard funcional con lista básica de recomendaciones

### Prioridad 2: Alta (Día 3-4)

**Tareas:**
1. ✅ Crear componente `PriorityRecommendationCard`
2. ✅ Crear componente `PriorityRecommendations`
3. ✅ Implementar funcionalidad de marcar como completada
4. ✅ Crear componente `RecommendationsByCategory` con tabs
5. ✅ Implementar filtros (prioridad, estado)
6. ✅ Implementar búsqueda
7. ✅ Testing de interacciones

**Entregable:** Dashboard completo con todas las funcionalidades principales

### Prioridad 3: Media (Día 5)

**Tareas:**
1. ✅ Crear componente `ProgressSection`
2. ✅ Implementar gráfico de progreso temporal
3. ✅ Implementar lista de completadas recientes
4. ✅ Implementar progreso por categoría
5. ✅ Manejar casos especiales (sin datos, error, etc.)
6. ✅ Testing de casos especiales

**Entregable:** Dashboard con sección de progreso completa

### Prioridad 4: Baja (Día 6-7)

**Tareas:**
1. ✅ Optimizar performance (lazy loading, paginación)
2. ✅ Agregar animaciones y transiciones
3. ✅ Pulir diseño responsive
4. ✅ Agregar tooltips y ayuda contextual
5. ✅ Testing exhaustivo en todos los dispositivos
6. ✅ Documentar código

**Entregable:** Dashboard pulido y optimizado listo para producción

---

## 11. Consideraciones Técnicas

### Performance

**Optimizaciones:**
- Usar `React.memo` para componentes que no cambian frecuentemente
- Implementar paginación si hay más de 20 recomendaciones
- Lazy loading de imágenes y recursos
- Debounce en búsqueda (300ms)
- Cache de datos con SWR o React Query

```tsx
// Ejemplo: Paginación
const ITEMS_PER_PAGE = 10;
const [currentPage, setCurrentPage] = useState(1);

const paginatedRecs = useMemo(() => {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  return filteredRecommendations.slice(start, end);
}, [filteredRecommendations, currentPage]);

// Ejemplo: Debounce en búsqueda
const debouncedSearch = useMemo(
  () => debounce((value) => setSearchQuery(value), 300),
  []
);
```

### Seguridad

**Medidas:**
- Validar user_id en todas las queries
- Usar Row Level Security (RLS) en Supabase
- Sanitizar inputs de búsqueda
- Validar URLs de recursos externos

```sql
-- RLS Policy para ai_recommendations
CREATE POLICY "Users can only view their own recommendations"
ON ai_recommendations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own recommendations"
ON ai_recommendations
FOR UPDATE
USING (auth.uid() = user_id);
```

### Accesibilidad

**Mejoras:**
- Usar semantic HTML (`<main>`, `<section>`, `<article>`)
- Agregar `aria-label` a botones de iconos
- Asegurar contraste de colores (WCAG AA)
- Navegación por teclado (Tab, Enter, Escape)
- Screen reader friendly

```tsx
// Ejemplo: Accesibilidad
<Button
  aria-label="Marcar recomendación como completada"
  onClick={() => markAsCompleted(rec.id)}
>
  <Check className="h-4 w-4" />
</Button>

<section aria-labelledby="priority-recommendations-title">
  <h2 id="priority-recommendations-title">
    Recomendaciones Prioritarias
  </h2>
  {/* Contenido */}
</section>
```

### Internacionalización (i18n)

**Preparación para múltiples idiomas:**
```tsx
// Usar constantes para textos
const TEXTS = {
  es: {
    title: 'Mis Recomendaciones',
    norecommendations: 'No tienes recomendaciones aún',
    // ...
  },
  en: {
    title: 'My Recommendations',
    norecommendations: 'You don\'t have recommendations yet',
    // ...
  }
};

// Usar en componentes
<h1>{TEXTS[locale].title}</h1>
```

---

## 12. Métricas de Éxito

### KPIs del Dashboard

**Engagement:**
- Tasa de visitas al dashboard (% de usuarios activos)
- Tiempo promedio en el dashboard
- Número de recomendaciones vistas por sesión
- Tasa de expansión de detalles

**Acción:**
- Tasa de recomendaciones completadas
- Tiempo promedio hasta completar una recomendación
- Número de recursos externos visitados
- Tasa de retorno al dashboard

**Satisfacción:**
- Feedback de usuarios (encuestas)
- Tasa de abandono del dashboard
- Número de escaneos realizados después de ver recomendaciones

### Tracking de Eventos

```typescript
// Ejemplo: Tracking con analytics
const trackEvent = (eventName: string, properties?: object) => {
  // Implementar con Google Analytics, Mixpanel, etc.
  analytics.track(eventName, {
    userId: user.id,
    timestamp: new Date().toISOString(),
    ...properties
  });
};

// Eventos a trackear
trackEvent('recommendations_viewed', {
  total_recommendations: recommendations.length,
  critical_count: stats.critical
});

trackEvent('recommendation_completed', {
  recommendation_id: rec.id,
  category: rec.category,
  priority: rec.priority
});

trackEvent('recommendation_expanded', {
  recommendation_id: rec.id
});

trackEvent('resource_clicked', {
  recommendation_id: rec.id,
  resource_url: resource.url
});
```

---

## 13. Roadmap Futuro

### Fase 2: Mejoras Avanzadas

**Características adicionales:**
1. **Notificaciones push** cuando hay nuevas recomendaciones
2. **Recordatorios** para recomendaciones pendientes
3. **Gamificación** con puntos y badges por completar recomendaciones
4. **Compartir progreso** en redes sociales
5. **Comparación** con promedio de la organización (anónimo)
6. **Recomendaciones colaborativas** (compartir con compañeros)
7. **Integración con calendario** para agendar acciones
8. **Exportar recomendaciones** a PDF

### Fase 3: IA Avanzada

**Mejoras de inteligencia:**
1. **Recomendaciones predictivas** basadas en tendencias
2. **Priorización dinámica** según comportamiento del usuario
3. **Recomendaciones contextuales** según hora del día, ubicación
4. **Chatbot** para responder preguntas sobre recomendaciones
5. **Análisis de sentimiento** en feedback de usuarios
6. **Recomendaciones de grupo** para equipos

---

## 14. Conclusión

Este documento proporciona especificaciones completas y detalladas para implementar el Dashboard de Recomendaciones para empleados en la plataforma Equilibria.

**Puntos clave:**
- ✅ Estructura clara y modular
- ✅ Componentes reutilizables
- ✅ Queries SQL exactas
- ✅ Flujos de usuario detallados
- ✅ Manejo de casos especiales
- ✅ Plan de implementación por fases
- ✅ Consideraciones técnicas (performance, seguridad, accesibilidad)
- ✅ Métricas de éxito definidas

**Próximos pasos:**
1. Alex revisa este documento
2. Alex verifica/crea tablas en base de datos
3. Alex implementa según plan de prioridades
4. Testing continuo durante desarrollo
5. Deploy a producción
6. Monitoreo de métricas

El dashboard está diseñado para ser:
- **Útil:** Proporciona valor real a los empleados
- **Usable:** Fácil de navegar y entender
- **Atractivo:** Diseño moderno y profesional
- **Accionable:** Recomendaciones claras con pasos específicos
- **Motivador:** Seguimiento de progreso y logros

---

**Documento creado por:** Emma (Product Manager)  
**Fecha:** 2026-01-25  
**Versión:** 1.0  
**Estado:** Completo y listo para implementación