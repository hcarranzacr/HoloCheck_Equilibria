import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Settings,
  Activity,
  Zap,
  Brain,
  ChevronDown,
  ChevronRight,
  Briefcase,
  UserCircle,
  Scan,
  History,
  Heart,
  BarChart3,
  Target,
  TrendingUp,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: any;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: 'Empleado',
    href: '/employee',
    icon: UserCircle,
    children: [
      { title: 'Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
      { title: 'Escaneo', href: '/employee/scan', icon: Scan },
      { title: 'Historial', href: '/employee/history', icon: History },
      { title: 'Perfil', href: '/employee/profile', icon: UserCircle },
      { title: 'Recomendaciones', href: '/employee/recommendations', icon: Heart },
    ],
  },
  {
    title: 'Líder',
    href: '/leader',
    icon: Target,
    children: [
      { title: 'Dashboard', href: '/leader/dashboard', icon: LayoutDashboard },
      { title: 'Equipo', href: '/leader/team', icon: Users },
      { title: 'Análisis IA', href: '/leader/ai-analyses', icon: Brain },
      { title: 'Insights', href: '/leader/insights', icon: TrendingUp },
      { title: 'Mediciones', href: '/leader/measurements', icon: BarChart3 },
    ],
  },
  {
    title: 'RRHH',
    href: '/hr',
    icon: Briefcase,
    children: [
      { title: 'Dashboard', href: '/hr/dashboard', icon: LayoutDashboard },
      { title: 'Usuarios', href: '/hr/users', icon: Users },
      { title: 'Análisis IA', href: '/hr/ai-analyses', icon: Brain },
      { title: 'Insights', href: '/hr/insights', icon: TrendingUp },
      { title: 'Mediciones', href: '/hr/measurements', icon: BarChart3 },
      { title: 'Uso', href: '/hr/usage', icon: Activity },
    ],
  },
  {
    title: 'Admin Organización',
    href: '/org',
    icon: Building2,
    children: [
      { title: 'Dashboard', href: '/org/dashboard', icon: LayoutDashboard },
      { title: 'Usuarios', href: '/org/users', icon: Users },
      { title: 'Departamentos', href: '/org/departments', icon: Building2 },
      { title: 'Insights Departamentales', href: '/org/department-insights', icon: TrendingUp },
      { title: 'Mediciones', href: '/org/measurements', icon: BarChart3 },
      { title: 'Análisis IA', href: '/org/ai-analyses', icon: Brain },
      { title: 'Prompts', href: '/org/prompts', icon: Zap },
    ],
  },
  {
    title: 'Admin Plataforma',
    href: '/admin',
    icon: Settings,
    children: [
      { title: 'Gestión de Organizaciones', href: '/admin/organizations', icon: Building2 },
      { title: 'Branding Organizacional', href: '/admin/organization-branding', icon: FileText },
      { title: 'Gestión de Usuarios', href: '/admin/users', icon: Users },
      { title: 'Gestión de Departamentos', href: '/admin/departments', icon: Building2 },
      { title: 'Invitar Usuario', href: '/admin/invite-user', icon: Users },
      { title: 'Sectores e Industrias', href: '/admin/sectors-industries', icon: Briefcase },
      { title: 'Planes de Suscripción', href: '/admin/subscription-plans', icon: FileText },
      { title: 'Uso de Créditos', href: '/admin/usage-logs', icon: Activity },
      { title: 'Prompts', href: '/admin/prompts', icon: Zap },
      { title: 'Análisis IA', href: '/admin/ai-analyses', icon: Brain },
      { title: 'Logs del Sistema', href: '/admin/system-logs', icon: FileText },
      { title: 'Configuración', href: '/admin/settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    '/employee',
    '/leader',
    '/hr',
    '/org',
    '/admin',
  ]);

  const toggleSection = (href: string) => {
    setExpandedSections((prev) =>
      prev.includes(href) ? prev.filter((s) => s !== href) : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold text-slate-900">HoloCheck</h1>
        <p className="text-sm text-slate-600">Equilibria</p>
      </div>

      <nav className="px-3 pb-6">
        {navigation.map((section) => (
          <div key={section.href} className="mb-2">
            <button
              onClick={() => toggleSection(section.href)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive(section.href)
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              <div className="flex items-center gap-3">
                <section.icon className="w-5 h-5" />
                <span>{section.title}</span>
              </div>
              {expandedSections.includes(section.href) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {expandedSections.includes(section.href) && section.children && (
              <div className="mt-1 ml-4 space-y-1">
                {section.children.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      isActive(item.href)
                        ? 'bg-sky-50 text-sky-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}