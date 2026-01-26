import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Fix: Access vfs directly from pdfFonts
(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || pdfFonts;

export async function generateUserManualPDF() {
  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    
    content: [
      // Portada
      { text: 'Manual de Usuario', style: 'title', alignment: 'center', margin: [0, 100, 0, 20] },
      { text: 'HoloCheck Equilibria', style: 'subtitle', alignment: 'center', margin: [0, 0, 0, 10] },
      { text: 'Plataforma de Bienestar Corporativo', alignment: 'center', fontSize: 12, color: '#64748b', margin: [0, 0, 0, 20] },
      { text: `Versión 1.0 - ${new Date().toLocaleDateString('es-ES')}`, alignment: 'center', fontSize: 10, color: '#94a3b8', margin: [0, 0, 0, 100] },
      { text: 'Soporte: soporte@holocheck.com', alignment: 'center', fontSize: 9, color: '#94a3b8', margin: [0, 0, 0, 5] },
      { text: 'Web: www.holocheck.com', alignment: 'center', fontSize: 9, color: '#94a3b8' },
      { text: '\n\n\n', pageBreak: 'after' },
      
      // Tabla de contenidos
      { text: 'Tabla de Contenidos', style: 'header', pageBreak: 'before', margin: [0, 0, 0, 20] },
      {
        ul: [
          { text: '1. Introducción', link: 'intro', margin: [0, 5, 0, 5] },
          { text: '2. Primeros Pasos', link: 'getting-started', margin: [0, 5, 0, 5] },
          { text: '3. Manual para Empleado', link: 'employee', margin: [0, 5, 0, 5] },
          { text: '   3.1 Dashboard Principal', margin: [20, 3, 0, 3] },
          { text: '   3.2 Realizar Escaneo Biométrico', margin: [20, 3, 0, 3] },
          { text: '   3.3 Historial de Escaneos', margin: [20, 3, 0, 3] },
          { text: '   3.4 Dashboard de Recomendaciones', margin: [20, 3, 0, 3] },
          { text: '   3.5 Beneficios de Lealtad', margin: [20, 3, 0, 3] },
          { text: '   3.6 Perfil Personal', margin: [20, 3, 0, 3] },
          { text: '4. Manual para Líder de Equipo', link: 'leader', margin: [0, 5, 0, 5] },
          { text: '   4.1 Dashboard de Equipo', margin: [20, 3, 0, 3] },
          { text: '   4.2 Insights del Equipo', margin: [20, 3, 0, 3] },
          { text: '   4.3 Gestión de Miembros', margin: [20, 3, 0, 3] },
          { text: '5. Manual para Recursos Humanos', link: 'hr', margin: [0, 5, 0, 5] },
          { text: '   5.1 Dashboard Organizacional', margin: [20, 3, 0, 3] },
          { text: '   5.2 Gestión de Usuarios', margin: [20, 3, 0, 3] },
          { text: '   5.3 Personas en Riesgo', margin: [20, 3, 0, 3] },
          { text: '   5.4 Análisis de Bienestar', margin: [20, 3, 0, 3] },
          { text: '   5.5 Reportes', margin: [20, 3, 0, 3] },
          { text: '6. Manual para Administrador de Organización', link: 'org-admin', margin: [0, 5, 0, 5] },
          { text: '   6.1 Dashboard Ejecutivo', margin: [20, 3, 0, 3] },
          { text: '   6.2 Gestión de Departamentos', margin: [20, 3, 0, 3] },
          { text: '   6.3 Configuración de Prompts de IA', margin: [20, 3, 0, 3] },
          { text: '   6.4 Insights Organizacionales', margin: [20, 3, 0, 3] },
          { text: '7. Manual para Administrador de Plataforma', link: 'platform-admin', margin: [0, 5, 0, 5] },
          { text: '   7.1 Gestión de Organizaciones', margin: [20, 3, 0, 3] },
          { text: '   7.2 Gestión de Partnerships', margin: [20, 3, 0, 3] },
          { text: '   7.3 Configuración de Branding', margin: [20, 3, 0, 3] },
          { text: '   7.4 Gestión de Usuarios Globales', margin: [20, 3, 0, 3] },
          { text: '8. Preguntas Frecuentes (FAQ)', link: 'faq', margin: [0, 5, 0, 5] },
          { text: '9. Soporte y Contacto', link: 'support', margin: [0, 5, 0, 5] },
        ]
      },
      { text: '\n\n', pageBreak: 'after' },
      
      // 1. Introducción
      { text: '1. Introducción', style: 'header', id: 'intro', pageBreak: 'before' },
      { text: 'Bienvenido a HoloCheck Equilibria', style: 'subheader' },
      { 
        text: 'HoloCheck Equilibria es una plataforma integral de bienestar corporativo que utiliza tecnología de escaneo biométrico no invasivo y análisis de inteligencia artificial para monitorear y mejorar la salud de los colaboradores.',
        margin: [0, 10, 0, 10]
      },
      { text: 'Características Principales:', style: 'subheader', margin: [0, 15, 0, 5] },
      {
        ul: [
          'Escaneo biométrico no invasivo en 30 segundos',
          'Análisis de 28+ indicadores de salud',
          'Recomendaciones personalizadas basadas en IA',
          'Dashboard interactivo con visualizaciones en tiempo real',
          'Programa de beneficios de lealtad',
          'Análisis organizacional y reportes ejecutivos',
          'Gestión integral de usuarios y departamentos'
        ],
        margin: [0, 0, 0, 15]
      },
      { text: 'Requisitos del Sistema:', style: 'subheader', margin: [0, 15, 0, 5] },
      {
        ul: [
          'Navegador web moderno (Chrome, Firefox, Safari, Edge)',
          'Conexión a internet estable',
          'Cámara web para realizar escaneos',
          'Resolución mínima de pantalla: 1280x720px'
        ],
        margin: [0, 0, 0, 10]
      },
      
      // 2. Primeros Pasos
      { text: '2. Primeros Pasos', style: 'header', id: 'getting-started', pageBreak: 'before' },
      { text: 'Acceso a la Plataforma', style: 'subheader' },
      {
        text: 'Para acceder a HoloCheck Equilibria, sigue estos pasos:',
        margin: [0, 10, 0, 5]
      },
      {
        ol: [
          'Abre tu navegador web y accede a la URL proporcionada por tu organización',
          'Ingresa tu correo electrónico corporativo',
          'Ingresa tu contraseña',
          'Haz clic en "Iniciar Sesión"'
        ],
        margin: [0, 0, 0, 15]
      },
      { text: 'Recuperación de Contraseña', style: 'subheader', margin: [0, 15, 0, 5] },
      {
        text: 'Si olvidaste tu contraseña:',
        margin: [0, 5, 0, 5]
      },
      {
        ol: [
          'Haz clic en "¿Olvidaste tu contraseña?" en la página de inicio de sesión',
          'Ingresa tu correo electrónico corporativo',
          'Revisa tu correo para el enlace de recuperación',
          'Haz clic en el enlace y crea una nueva contraseña',
          'Inicia sesión con tu nueva contraseña'
        ],
        margin: [0, 0, 0, 15]
      },
      { text: 'Navegación Básica', style: 'subheader', margin: [0, 15, 0, 5] },
      {
        text: 'La plataforma cuenta con un menú lateral izquierdo que te permite acceder a todas las funcionalidades según tu rol. Las opciones disponibles varían dependiendo de si eres Empleado, Líder de Equipo, HR, Administrador de Organización o Administrador de Plataforma.',
        margin: [0, 5, 0, 10]
      },
      
      // 3. Manual para Empleado
      { text: '3. Manual para Empleado', style: 'header', id: 'employee', pageBreak: 'before' },
      
      { text: '3.1 Dashboard Principal', style: 'subheader', margin: [0, 10, 0, 5] },
      {
        text: 'Tu dashboard es el centro de control de tu salud y bienestar. Aquí encontrarás:',
        margin: [0, 5, 0, 5]
      },
      {
        ul: [
          'Métricas Principales: Índice de Riesgo, Presión Arterial, Frecuencia Cardíaca, IMC',
          'Indicadores Biométricos: 28 métricas organizadas en 6 categorías (Cardiovascular, Composición Corporal, Respiratorio, Metabólico, Hematológico, Renal)',
          'Estrella de Beneficios: Indicador flotante en la esquina superior derecha que muestra beneficios disponibles',
          'Acceso Rápido: Botones para realizar nuevo escaneo y ver recomendaciones'
        ],
        margin: [0, 0, 0, 10]
      },
      {
        text: 'Interpretación de Colores:',
        style: 'bold',
        margin: [0, 10, 0, 5]
      },
      {
        ul: [
          { text: 'Verde: Valores dentro del rango saludable', color: '#22c55e' },
          { text: 'Amarillo: Valores que requieren atención', color: '#eab308' },
          { text: 'Rojo: Valores fuera del rango recomendado', color: '#ef4444' }
        ],
        margin: [0, 0, 0, 15]
      },
      
      { text: '3.2 Realizar Escaneo Biométrico', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'El escaneo biométrico es un proceso rápido y no invasivo que captura 28 indicadores de salud en una sola sesión.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Pasos para realizar un escaneo:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ol: [
          'Navega a "Realizar Escaneo" en el menú lateral',
          'Completa el cuestionario pre-escaneo (2 pasos) con información sobre tu estado actual',
          'Haz clic en "Iniciar Nuevo Escaneo"',
          'Permite el acceso a la cámara cuando se solicite',
          'Posiciona tu rostro dentro del círculo verde en la pantalla',
          'Mantén la posición durante 30 segundos mientras se realiza el escaneo',
          'Espera mientras se procesan los resultados (2-3 minutos)',
          'Revisa tus resultados inmediatos en pantalla',
          'Tus métricas se actualizarán automáticamente en el dashboard'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Recomendaciones antes del escaneo:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ul: [
          'Busca un ambiente tranquilo y bien iluminado',
          'Evita ejercicio intenso 30 minutos antes del escaneo',
          'No consumas cafeína 1 hora antes',
          'Mantén una respiración normal y relajada',
          'Retira gafas y accesorios que puedan obstruir el rostro',
          'Asegúrate de tener buena conexión a internet'
        ],
        margin: [0, 0, 0, 15]
      },
      { text: 'Tips para un escaneo exitoso:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ul: [
          'Mantén el rostro centrado en el círculo verde',
          'Evita movimientos bruscos durante el escaneo',
          'Mira directamente a la cámara',
          'No hables durante el proceso',
          'Si el escaneo falla, espera 1 minuto antes de reintentar'
        ],
        margin: [0, 0, 0, 10]
      },
      
      { text: '3.3 Historial de Escaneos', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'El historial te permite revisar todos tus escaneos anteriores y observar tendencias en tus métricas de salud a lo largo del tiempo.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Funcionalidades disponibles:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Tabla completa con todos tus escaneos históricos',
          'Fecha y hora exacta de cada escaneo',
          'Métricas principales de cada sesión',
          'Comparación entre dos escaneos seleccionados',
          'Visualización de tendencias en gráficos interactivos',
          'Filtros por fecha y tipo de métrica',
          'Exportación de datos a CSV o PDF'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Cómo comparar escaneos:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ol: [
          'Selecciona dos escaneos de la tabla usando los checkboxes',
          'Haz clic en el botón "Comparar Seleccionados"',
          'Revisa las diferencias en cada métrica',
          'Observa las tendencias positivas o negativas',
          'Exporta el reporte de comparación si lo deseas'
        ],
        margin: [0, 0, 0, 10]
      },
      
      { text: '3.4 Dashboard de Recomendaciones', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'Recibe recomendaciones personalizadas basadas en tus métricas biométricas y análisis de inteligencia artificial para mejorar tu bienestar integral.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Secciones del Dashboard:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Estadísticas Generales: Total de recomendaciones, completadas, pendientes y tasa de cumplimiento',
          'Recomendaciones Prioritarias: Top 3 más importantes que requieren atención inmediata',
          'Filtros: Por categoría, nivel de prioridad y estado de cumplimiento',
          'Tarjetas de Recomendaciones: Cada una con título, descripción, categoría, prioridad y acciones disponibles'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Categorías de Recomendaciones:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ul: [
          'Salud Física: Ejercicio, actividad física, movilidad',
          'Salud Mental: Manejo del estrés, bienestar emocional',
          'Estilo de Vida: Hábitos diarios, balance vida-trabajo',
          'Nutrición: Alimentación, hidratación, suplementos',
          'Sueño: Calidad del sueño, rutinas nocturnas',
          'Cardiovascular: Salud del corazón, presión arterial',
          'Manejo del Estrés: Técnicas de relajación, mindfulness',
          'Composición Corporal: Peso, IMC, grasa corporal'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Niveles de Prioridad:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ul: [
          { text: 'Crítica: Requiere atención inmediata (próximas 24-48 horas)', color: '#ef4444' },
          { text: 'Alta: Importante, atender pronto (próxima semana)', color: '#f97316' },
          { text: 'Media: Recomendable implementar (próximo mes)', color: '#eab308' },
          { text: 'Baja: Sugerencia de mejora continua (cuando sea posible)', color: '#22c55e' }
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Acciones disponibles en cada recomendación:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ul: [
          'Ver Detalles: Abre un diálogo con información completa, beneficios esperados y pasos sugeridos',
          'Marcar como Completada: Registra tu progreso y actualiza tus estadísticas',
          'Posponer: Programa la recomendación para revisarla más adelante',
          'Descartar: Si la recomendación no aplica a tu situación actual'
        ],
        margin: [0, 0, 0, 10]
      },
      
      { text: '3.5 Beneficios de Lealtad', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'El programa de beneficios de lealtad te recompensa por mantener un compromiso constante con tu salud y bienestar.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Estrella de Beneficios:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        text: 'La estrella dorada flotante en la esquina superior derecha de tu dashboard indica el número de beneficios disponibles para ti. Haz clic en ella para ver todos los beneficios activos.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Cómo acumular beneficios:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ul: [
          'Completa escaneos biométricos regularmente',
          'Cumple con tus recomendaciones personalizadas',
          'Mantén métricas dentro de rangos saludables',
          'Participa en programas de bienestar organizacionales',
          'Mejora tus indicadores de salud mes a mes'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Cómo canjear beneficios:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ol: [
          'Haz clic en la estrella de beneficios en tu dashboard',
          'Revisa la lista completa de beneficios disponibles',
          'Selecciona el beneficio que deseas usar',
          'Lee los términos y condiciones del partner',
          'Haz clic en "Activar Beneficio"',
          'Copia el código de descuento o cupón generado',
          'Presenta el código al proveedor según las instrucciones',
          'Disfruta de tu beneficio'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Tipos de beneficios disponibles:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ul: [
          'Descuentos en gimnasios y centros deportivos',
          'Consultas con nutricionistas y entrenadores',
          'Productos de bienestar y suplementos',
          'Servicios de salud mental y terapia',
          'Clases de yoga, meditación y mindfulness',
          'Evaluaciones médicas especializadas',
          'Programas de coaching personal'
        ],
        margin: [0, 0, 0, 10]
      },
      
      { text: '3.6 Perfil Personal', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'Tu perfil personal contiene toda tu información básica y configuraciones de la plataforma.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Información del perfil:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Nombre completo',
          'Correo electrónico corporativo',
          'Departamento',
          'Puesto o cargo',
          'Fecha de ingreso a la organización',
          'Foto de perfil (opcional)'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Configuraciones disponibles:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ul: [
          'Cambiar contraseña',
          'Actualizar foto de perfil',
          'Configurar notificaciones por correo',
          'Preferencias de idioma',
          'Zona horaria',
          'Privacidad de datos'
        ],
        margin: [0, 0, 0, 10]
      },
      
      // 4. Manual para Líder de Equipo
      { text: '4. Manual para Líder de Equipo', style: 'header', id: 'leader', pageBreak: 'before' },
      
      { text: '4.1 Dashboard de Equipo', style: 'subheader', margin: [0, 10, 0, 5] },
      {
        text: 'Como líder de equipo, tu dashboard te proporciona una vista consolidada del bienestar de todos los miembros de tu equipo.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Métricas del Equipo:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Número total de miembros del equipo',
          'Porcentaje de participación en escaneos',
          'Índice de riesgo promedio del equipo',
          'Distribución de riesgo (gráfico circular: bajo, medio, alto)',
          'Tendencias mensuales de bienestar',
          'Comparación con otros equipos (si está habilitado)',
          'Alertas de miembros que requieren atención'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Indicadores clave:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ul: [
          'Tasa de Participación: Porcentaje de miembros que han completado al menos un escaneo en el último mes',
          'Índice de Riesgo Promedio: Promedio ponderado del índice de riesgo de todos los miembros',
          'Miembros en Riesgo Alto: Número de miembros con índice de riesgo superior a 70',
          'Tendencia del Mes: Indicador de mejora o deterioro respecto al mes anterior'
        ],
        margin: [0, 0, 0, 10]
      },
      
      { text: '4.2 Insights del Equipo', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'Los insights te proporcionan análisis detallados y recomendaciones para mejorar el bienestar de tu equipo.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Reportes disponibles:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Reporte Semanal: Resumen de actividad de escaneos y cambios en métricas',
          'Reporte Mensual: Análisis de tendencias y comparación mes a mes',
          'Análisis de Productividad: Correlación entre bienestar y productividad del equipo',
          'Reporte de Participación: Identificación de miembros con baja participación',
          'Análisis de Riesgos: Identificación de áreas de preocupación en el equipo'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Visualizaciones interactivas:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ul: [
          'Gráficos de línea: Tendencias de métricas a lo largo del tiempo',
          'Gráficos de barras: Comparación entre miembros del equipo',
          'Mapas de calor: Identificación de patrones y correlaciones',
          'Gráficos de dispersión: Relación entre diferentes métricas'
        ],
        margin: [0, 0, 0, 10]
      },
      
      { text: '4.3 Gestión de Miembros', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'Visualiza y gestiona la información de cada miembro de tu equipo.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Información disponible por miembro:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Nombre y puesto',
          'Último escaneo realizado',
          'Índice de riesgo actual',
          'Número de recomendaciones pendientes',
          'Tasa de cumplimiento de recomendaciones',
          'Historial de escaneos',
          'Tendencias individuales'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Acciones disponibles:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ul: [
          'Ver detalle completo del miembro',
          'Enviar recordatorio para realizar escaneo',
          'Agendar reunión 1-on-1 para discutir bienestar',
          'Asignar recursos o programas de apoyo',
          'Exportar reporte individual'
        ],
        margin: [0, 0, 0, 10]
      },
      
      // 5. Manual para Recursos Humanos
      { text: '5. Manual para Recursos Humanos', style: 'header', id: 'hr', pageBreak: 'before' },
      
      { text: '5.1 Dashboard Organizacional', style: 'subheader', margin: [0, 10, 0, 5] },
      {
        text: 'El dashboard de HR proporciona una vista completa del bienestar de toda la organización.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Métricas Organizacionales:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Total de empleados activos en la plataforma',
          'Tasa de participación global en escaneos',
          'Índice de riesgo organizacional',
          'Distribución de riesgo por departamento',
          'Comparación interdepartamental',
          'Consumo de créditos de escaneo',
          'Tendencias trimestrales y anuales'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'KPIs principales:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ul: [
          'Adopción de la Plataforma: Porcentaje de empleados que han completado al menos un escaneo',
          'Frecuencia de Uso: Promedio de escaneos por empleado por mes',
          'Mejora en Salud: Porcentaje de empleados que han mejorado su índice de riesgo',
          'Retorno de Inversión (ROI): Impacto del programa en ausentismo y productividad'
        ],
        margin: [0, 0, 0, 10]
      },
      
      { text: '5.2 Gestión de Usuarios', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'Administra todos los usuarios de la organización desde un solo lugar.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Funciones administrativas:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Crear usuarios individuales o importación masiva vía CSV',
          'Editar información de usuarios existentes',
          'Asignar roles y permisos (Empleado, Líder, HR, Org Admin)',
          'Cambiar departamento de usuarios',
          'Desactivar/Reactivar cuentas de usuarios',
          'Gestión de bajas y reincorporaciones',
          'Resetear contraseñas de usuarios'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Crear usuario individual:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ol: [
          'Haz clic en "Crear Nuevo Usuario"',
          'Completa el formulario con información básica (nombre, email, departamento)',
          'Asigna el rol apropiado',
          'Define si el usuario es líder de equipo',
          'Haz clic en "Crear Usuario"',
          'El usuario recibirá un correo con instrucciones de activación'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Importación masiva de usuarios:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ol: [
          'Descarga la plantilla CSV desde el botón "Descargar Plantilla"',
          'Completa la plantilla con la información de todos los usuarios',
          'Asegúrate de que los correos electrónicos sean únicos y válidos',
          'Haz clic en "Importar Usuarios" y selecciona tu archivo CSV',
          'Revisa el resumen de importación',
          'Confirma la importación',
          'Los usuarios recibirán correos de activación automáticamente'
        ],
        margin: [0, 0, 0, 10]
      },
      
      { text: '5.3 Personas en Riesgo', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'Identifica y da seguimiento a empleados que requieren atención prioritaria basado en sus métricas biométricas.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Funcionalidades:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Lista de empleados con alto índice de riesgo (>70)',
          'Filtros por tipo de riesgo (cardiovascular, metabólico, etc.)',
          'Priorización automática basada en severidad',
          'Programas de apoyo disponibles para asignar',
          'Seguimiento personalizado de cada caso',
          'Reportes de evolución individual',
          'Alertas automáticas cuando el riesgo aumenta'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Acciones recomendadas:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ol: [
          'Revisar el perfil completo del empleado',
          'Identificar las métricas específicas fuera de rango',
          'Contactar al empleado de manera confidencial',
          'Ofrecer recursos de apoyo (consultas médicas, programas de bienestar)',
          'Asignar un programa de seguimiento',
          'Monitorear la evolución en escaneos subsecuentes',
          'Documentar las intervenciones realizadas'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Consideraciones de privacidad:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        text: 'Toda la información de salud es confidencial. Solo personal de HR autorizado puede acceder a esta sección. Maneja la información con discreción y respeto a la privacidad del empleado.',
        margin: [0, 5, 0, 10]
      },
      
      { text: '5.4 Análisis de Bienestar', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'Análisis profundos del bienestar organizacional con insights accionables.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Tipos de análisis:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Análisis por Departamento: Comparación de métricas entre diferentes áreas',
          'Análisis Demográfico: Segmentación por edad, género, antigüedad',
          'Análisis de Tendencias: Evolución del bienestar a lo largo del tiempo',
          'Análisis de Correlación: Relación entre bienestar y otras métricas (ausentismo, rotación)',
          'Análisis Predictivo: Identificación de riesgos futuros basado en tendencias'
        ],
        margin: [0, 0, 0, 10]
      },
      
      { text: '5.5 Reportes', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'Genera reportes personalizados para diferentes audiencias y propósitos.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Reportes disponibles:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Reporte Ejecutivo: Resumen de alto nivel para dirección',
          'Reporte Operativo: Detalles para gestión de HR',
          'Reporte de Cumplimiento: Para auditorías y certificaciones',
          'Reporte de Impacto: ROI y beneficios del programa',
          'Reporte Personalizado: Configurable según necesidades específicas'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Exportación de reportes:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        text: 'Todos los reportes pueden exportarse en formato PDF, Excel o CSV para análisis adicional o presentaciones.',
        margin: [0, 5, 0, 10]
      },
      
      // 6. Manual para Administrador de Organización
      { text: '6. Manual para Administrador de Organización', style: 'header', id: 'org-admin', pageBreak: 'before' },
      
      { text: '6.1 Dashboard Ejecutivo', style: 'subheader', margin: [0, 10, 0, 5] },
      {
        text: 'Vista estratégica con KPIs ejecutivos y métricas de alto nivel.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Indicadores Clave (KPIs):', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Adopción de la Plataforma: Porcentaje de empleados activos',
          'Usuarios Activos: Número de empleados que usan la plataforma regularmente',
          'Frecuencia de Uso: Promedio de escaneos por usuario por mes',
          'Impacto en Salud: Mejora promedio en índice de riesgo',
          'Eficiencia Operativa: Costo por escaneo y utilización de créditos',
          'Retorno de Inversión (ROI): Impacto financiero del programa',
          'Satisfacción del Usuario: NPS y feedback de empleados'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Métricas de impacto:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ul: [
          'Reducción en ausentismo por enfermedad',
          'Mejora en productividad del equipo',
          'Disminución en costos de salud',
          'Aumento en satisfacción laboral',
          'Reducción en rotación de personal'
        ],
        margin: [0, 0, 0, 10]
      },
      
      { text: '6.2 Gestión de Departamentos', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'Crea, edita y gestiona los departamentos de tu organización.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Funciones:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Crear nuevos departamentos con nombre y descripción',
          'Asignar líderes de departamento',
          'Definir objetivos departamentales de bienestar',
          'Configurar métricas específicas por departamento',
          'Asignar recursos y créditos de escaneo',
          'Establecer metas de participación',
          'Monitorear desempeño departamental'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Crear un departamento:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ol: [
          'Haz clic en "Crear Nuevo Departamento"',
          'Ingresa el nombre del departamento',
          'Agrega una descripción (opcional)',
          'Asigna un líder de departamento',
          'Define objetivos de bienestar',
          'Asigna créditos de escaneo mensuales',
          'Haz clic en "Crear Departamento"'
        ],
        margin: [0, 0, 0, 10]
      },
      
      { text: '6.3 Configuración de Prompts de IA', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'Personaliza los prompts de inteligencia artificial para generar recomendaciones alineadas con la cultura y valores de tu organización.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Personalización disponible:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Crear prompts personalizados para diferentes categorías',
          'Ajustar parámetros de análisis (sensibilidad, profundidad)',
          'Definir criterios de recomendación específicos',
          'Seleccionar modelos de IA (GPT-4, Claude, Gemini)',
          'Configurar umbrales y niveles de alerta',
          'Establecer tono y estilo de las recomendaciones',
          'Incluir recursos y programas internos en las recomendaciones'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Mejores prácticas:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ul: [
          'Alinea los prompts con la cultura organizacional',
          'Incluye referencias a programas de bienestar existentes',
          'Usa lenguaje inclusivo y motivador',
          'Prueba los prompts con casos reales antes de activarlos',
          'Revisa y actualiza los prompts trimestralmente',
          'Solicita feedback de usuarios sobre las recomendaciones'
        ],
        margin: [0, 0, 0, 10]
      },
      
      { text: '6.4 Insights Organizacionales', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'Análisis avanzados y predictivos del bienestar organizacional.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Análisis disponibles:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Análisis de Riesgo Organizacional: Identificación de áreas críticas',
          'Análisis Predictivo: Proyección de tendencias futuras',
          'Análisis de Impacto: Correlación con métricas de negocio',
          'Benchmarking: Comparación con estándares de la industria',
          'Análisis de Efectividad: Evaluación de programas de bienestar'
        ],
        margin: [0, 0, 0, 10]
      },
      
      // 7. Manual para Administrador de Plataforma
      { text: '7. Manual para Administrador de Plataforma', style: 'header', id: 'platform-admin', pageBreak: 'before' },
      
      { text: '7.1 Gestión de Organizaciones', style: 'subheader', margin: [0, 10, 0, 5] },
      {
        text: 'Administra todas las organizaciones en la plataforma HoloCheck Equilibria.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Funciones globales:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Crear nuevas organizaciones',
          'Configurar información corporativa (nombre, logo, dominio)',
          'Asignar recursos y límites de uso',
          'Configurar planes de suscripción',
          'Monitorear uso por organización',
          'Gestionar facturación y pagos',
          'Activar/Desactivar organizaciones',
          'Exportar datos de organizaciones'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Crear una organización:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ol: [
          'Haz clic en "Crear Nueva Organización"',
          'Ingresa el nombre de la organización',
          'Configura el dominio personalizado (opcional)',
          'Sube el logo corporativo',
          'Define el plan de suscripción',
          'Asigna créditos iniciales de escaneo',
          'Configura límites de usuarios',
          'Asigna un administrador de organización',
          'Haz clic en "Crear Organización"'
        ],
        margin: [0, 0, 0, 10]
      },
      
      { text: '7.2 Gestión de Partnerships', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'Administra partners comerciales y los beneficios que ofrecen a los usuarios.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Gestión de Partners:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Crear nuevos partners comerciales',
          'Definir información de contacto del partner',
          'Especificar tipo de servicio (gimnasio, nutrición, salud mental, etc.)',
          'Crear beneficios asociados al partner',
          'Configurar términos y condiciones',
          'Asignar partners a organizaciones específicas',
          'Gestionar acuerdos y renovaciones',
          'Monitorear uso de beneficios'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Crear un partner:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ol: [
          'Haz clic en "Crear Nuevo Partner"',
          'Ingresa el nombre del partner',
          'Sube el logo del partner',
          'Selecciona la categoría de servicio',
          'Ingresa información de contacto',
          'Define el tipo de beneficio (descuento, cupón, acceso)',
          'Configura los términos y condiciones',
          'Asigna a qué organizaciones estará disponible',
          'Haz clic en "Crear Partner"'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Gestión de beneficios:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ul: [
          'Crear beneficios específicos por partner',
          'Definir requisitos de elegibilidad',
          'Configurar códigos de descuento',
          'Establecer vigencia de beneficios',
          'Monitorear uso y redención',
          'Generar reportes de efectividad'
        ],
        margin: [0, 0, 0, 10]
      },
      
      { text: '7.3 Configuración de Branding', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'Personaliza la identidad visual de cada organización en la plataforma.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Personalización disponible:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Subir logo corporativo (header y favicon)',
          'Definir paleta de colores primarios y secundarios',
          'Personalizar tema visual (claro, oscuro, personalizado)',
          'Configurar mensajes de bienvenida personalizados',
          'Personalizar textos de la interfaz',
          'Configurar elementos de marca en reportes',
          'Definir dominio personalizado'
        ],
        margin: [0, 0, 0, 10]
      },
      { text: 'Configurar branding:', style: 'bold', margin: [0, 15, 0, 5] },
      {
        ol: [
          'Selecciona la organización a personalizar',
          'Haz clic en "Configuración de Branding"',
          'Sube el logo (formato PNG, máximo 2MB)',
          'Selecciona los colores primarios y secundarios',
          'Personaliza el mensaje de bienvenida',
          'Configura el dominio personalizado (opcional)',
          'Previsualiza los cambios',
          'Haz clic en "Guardar Configuración"'
        ],
        margin: [0, 0, 0, 10]
      },
      
      { text: '7.4 Gestión de Usuarios Globales', style: 'subheader', pageBreak: 'before', margin: [0, 0, 0, 5] },
      {
        text: 'Administra usuarios a nivel de plataforma con permisos especiales.',
        margin: [0, 5, 0, 10]
      },
      { text: 'Funciones:', style: 'bold', margin: [0, 10, 0, 5] },
      {
        ul: [
          'Crear administradores de plataforma',
          'Asignar permisos granulares',
          'Gestionar accesos a múltiples organizaciones',
          'Monitorear actividad de administradores',
          'Auditar cambios realizados',
          'Configurar autenticación de dos factores',
          'Gestionar sesiones activas'
        ],
        margin: [0, 0, 0, 10]
      },
      
      // 8. Preguntas Frecuentes
      { text: '8. Preguntas Frecuentes (FAQ)', style: 'header', id: 'faq', pageBreak: 'before' },
      
      { text: 'Generales', style: 'subheader', margin: [0, 10, 0, 5] },
      {
        text: 'P: ¿Qué es HoloCheck Equilibria?',
        style: 'bold',
        margin: [0, 10, 0, 3]
      },
      {
        text: 'R: Es una plataforma de bienestar corporativo que utiliza escaneo biométrico no invasivo e inteligencia artificial para monitorear y mejorar la salud de los colaboradores.',
        margin: [0, 0, 0, 10]
      },
      {
        text: 'P: ¿Es seguro el escaneo biométrico?',
        style: 'bold',
        margin: [0, 10, 0, 3]
      },
      {
        text: 'R: Sí, el escaneo es completamente no invasivo y utiliza tecnología de análisis facial que no almacena imágenes. Solo se procesan y guardan las métricas biométricas.',
        margin: [0, 0, 0, 10]
      },
      {
        text: 'P: ¿Cuánto tiempo toma un escaneo?',
        style: 'bold',
        margin: [0, 10, 0, 3]
      },
      {
        text: 'R: El escaneo en sí toma aproximadamente 30 segundos. El procesamiento de resultados toma entre 2-3 minutos adicionales.',
        margin: [0, 0, 0, 10]
      },
      {
        text: 'P: ¿Con qué frecuencia debo realizar escaneos?',
        style: 'bold',
        margin: [0, 10, 0, 3]
      },
      {
        text: 'R: Se recomienda realizar al menos un escaneo mensual para monitorear tendencias. Para seguimiento más cercano, puedes realizar escaneos semanales.',
        margin: [0, 0, 0, 10]
      },
      
      { text: 'Privacidad y Seguridad', style: 'subheader', margin: [0, 20, 0, 5] },
      {
        text: 'P: ¿Quién puede ver mis datos de salud?',
        style: 'bold',
        margin: [0, 10, 0, 3]
      },
      {
        text: 'R: Solo tú tienes acceso completo a tus datos individuales. HR puede ver datos agregados y anónimos. Los líderes de equipo ven métricas consolidadas de su equipo sin identificar individuos específicos.',
        margin: [0, 0, 0, 10]
      },
      {
        text: 'P: ¿Mis datos están protegidos?',
        style: 'bold',
        margin: [0, 10, 0, 3]
      },
      {
        text: 'R: Sí, todos los datos están encriptados en tránsito y en reposo. Cumplimos con GDPR, HIPAA y otras regulaciones de privacidad de datos de salud.',
        margin: [0, 0, 0, 10]
      },
      
      { text: 'Técnicos', style: 'subheader', margin: [0, 20, 0, 5] },
      {
        text: 'P: ¿Qué navegadores son compatibles?',
        style: 'bold',
        margin: [0, 10, 0, 3]
      },
      {
        text: 'R: Chrome, Firefox, Safari y Edge en sus versiones más recientes. Se requiere acceso a cámara web.',
        margin: [0, 0, 0, 10]
      },
      {
        text: 'P: ¿Funciona en dispositivos móviles?',
        style: 'bold',
        margin: [0, 10, 0, 3]
      },
      {
        text: 'R: Sí, la plataforma es responsive y funciona en tablets y smartphones con cámara frontal.',
        margin: [0, 0, 0, 10]
      },
      {
        text: 'P: ¿Qué hago si el escaneo falla?',
        style: 'bold',
        margin: [0, 10, 0, 3]
      },
      {
        text: 'R: Verifica tu conexión a internet, asegúrate de tener buena iluminación, y que la cámara esté funcionando correctamente. Si persiste el problema, contacta a soporte.',
        margin: [0, 0, 0, 10]
      },
      
      // 9. Soporte y Contacto
      { text: '9. Soporte y Contacto', style: 'header', id: 'support', pageBreak: 'before' },
      {
        text: 'Para soporte técnico, consultas o asistencia, puedes contactarnos a través de los siguientes canales:',
        margin: [0, 10, 0, 15]
      },
      { text: 'Email', style: 'subheader', margin: [0, 10, 0, 5] },
      {
        text: 'soporte@holocheck.com',
        style: 'bold',
        margin: [0, 5, 0, 3]
      },
      {
        text: 'Tiempo de respuesta: 24 horas hábiles',
        fontSize: 10,
        color: '#64748b',
        margin: [0, 0, 0, 15]
      },
      { text: 'Chat en Vivo', style: 'subheader', margin: [0, 10, 0, 5] },
      {
        text: 'Disponible en la plataforma (esquina inferior derecha)',
        style: 'bold',
        margin: [0, 5, 0, 3]
      },
      {
        text: 'Horario: Lunes a Viernes, 8:00 AM - 6:00 PM (hora local)',
        fontSize: 10,
        color: '#64748b',
        margin: [0, 0, 0, 15]
      },
      { text: 'Teléfono', style: 'subheader', margin: [0, 10, 0, 5] },
      {
        text: '+506 1234-5678',
        style: 'bold',
        margin: [0, 5, 0, 3]
      },
      {
        text: 'Horario: Lunes a Viernes, 8:00 AM - 6:00 PM (hora local)',
        fontSize: 10,
        color: '#64748b',
        margin: [0, 0, 0, 15]
      },
      { text: 'Centro de Ayuda', style: 'subheader', margin: [0, 10, 0, 5] },
      {
        text: 'www.holocheck.com/ayuda',
        style: 'bold',
        margin: [0, 5, 0, 3]
      },
      {
        text: 'Artículos, tutoriales en video y guías paso a paso',
        fontSize: 10,
        color: '#64748b',
        margin: [0, 0, 0, 15]
      },
      { text: 'Soporte de Emergencia', style: 'subheader', margin: [0, 20, 0, 5] },
      {
        text: 'Para problemas críticos que afectan a múltiples usuarios o la operación de la plataforma:',
        margin: [0, 5, 0, 5]
      },
      {
        text: 'emergencias@holocheck.com',
        style: 'bold',
        color: '#ef4444',
        margin: [0, 5, 0, 3]
      },
      {
        text: 'Disponible 24/7',
        fontSize: 10,
        color: '#64748b',
        margin: [0, 0, 0, 20]
      },
      { text: 'Información Adicional', style: 'subheader', margin: [0, 20, 0, 5] },
      {
        text: 'Sitio Web: www.holocheck.com',
        margin: [0, 5, 0, 3]
      },
      {
        text: 'Blog: www.holocheck.com/blog',
        margin: [0, 5, 0, 3]
      },
      {
        text: 'LinkedIn: /company/holocheck',
        margin: [0, 5, 0, 3]
      },
      {
        text: 'Twitter: @HoloCheckHealth',
        margin: [0, 5, 0, 20]
      },
      { text: 'Notas de Versión', style: 'subheader', margin: [0, 20, 0, 5] },
      {
        text: `Versión del Manual: 1.0`,
        margin: [0, 5, 0, 3]
      },
      {
        text: `Fecha de Publicación: ${new Date().toLocaleDateString('es-ES')}`,
        margin: [0, 5, 0, 3]
      },
      {
        text: 'Última Actualización: Este manual se actualiza regularmente. Consulta la versión más reciente en la plataforma.',
        margin: [0, 5, 0, 20]
      },
      {
        text: '© 2026 HoloCheck Equilibria. Todos los derechos reservados.',
        alignment: 'center',
        fontSize: 9,
        color: '#94a3b8',
        margin: [0, 40, 0, 0]
      }
    ],
    
    styles: {
      title: { 
        fontSize: 32, 
        bold: true, 
        color: '#0284c7' 
      },
      subtitle: { 
        fontSize: 22, 
        bold: true, 
        color: '#64748b' 
      },
      header: { 
        fontSize: 20, 
        bold: true, 
        color: '#0284c7', 
        margin: [0, 20, 0, 10] 
      },
      subheader: { 
        fontSize: 15, 
        bold: true, 
        color: '#475569', 
        margin: [0, 15, 0, 5] 
      },
      bold: {
        bold: true
      }
    },
    
    defaultStyle: {
      fontSize: 11,
      lineHeight: 1.5,
      color: '#334155'
    },
    
    header: function(currentPage: number, pageCount: number) {
      if (currentPage === 1) return null;
      return {
        text: 'HoloCheck Equilibria - Manual de Usuario',
        alignment: 'center',
        fontSize: 9,
        color: '#64748b',
        margin: [0, 20, 0, 0]
      };
    },
    
    footer: function(currentPage: number, pageCount: number) {
      if (currentPage === 1) return null;
      return {
        text: `Página ${currentPage} de ${pageCount}`,
        alignment: 'center',
        fontSize: 9,
        color: '#64748b',
        margin: [0, 0, 0, 20]
      };
    }
  };
  
  pdfMake.createPdf(docDefinition).download('Manual_Usuario_HoloCheck_Equilibria.pdf');
}