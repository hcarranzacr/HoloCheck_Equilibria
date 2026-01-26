import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Mail, Briefcase } from 'lucide-react';
import { getRiskLevel, RiskIndicator } from './RiskIndicator';

interface TeamMember {
  user_id: string;
  full_name: string;
  email: string;
  role?: string;
  department?: string;
  last_scan?: {
    date: string;
    stress?: number;
    fatigue?: number;
    wellness?: number;
  };
  status?: 'active' | 'inactive' | 'on_leave';
}

interface TeamMemberCardProps {
  member: TeamMember;
  onClick?: (member: TeamMember) => void;
  showDetails?: boolean;
}

export function TeamMemberCard({
  member,
  onClick,
  showDetails = true
}: TeamMemberCardProps) {
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusBadge = () => {
    const statusConfig = {
      active: { label: 'Activo', variant: 'default' as const },
      inactive: { label: 'Inactivo', variant: 'secondary' as const },
      on_leave: { label: 'Ausente', variant: 'outline' as const }
    };
    const config = statusConfig[member.status || 'active'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const getOverallRisk = () => {
    if (!member.last_scan?.stress && !member.last_scan?.fatigue) return null;
    const avgValue = ((member.last_scan?.stress || 0) + (member.last_scan?.fatigue || 0)) / 2;
    return getRiskLevel(avgValue, { low: 30, medium: 60 });
  };

  const overallRisk = getOverallRisk();

  return (
    <Card 
      className={`hover:shadow-md transition-all ${onClick ? 'cursor-pointer hover:border-sky-300' : ''}`}
      onClick={() => onClick?.(member)}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-sky-100 text-sky-700 font-semibold">
              {getInitials(member.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-slate-900 truncate">
                {member.full_name}
              </h4>
              {getStatusBadge()}
            </div>
            
            {showDetails && (
              <>
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{member.email}</span>
                </div>
                
                {member.role && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <Briefcase className="w-3 h-3" />
                    <span>{member.role}</span>
                  </div>
                )}
                
                {member.last_scan && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>Último escaneo: {formatDate(member.last_scan.date)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {member.last_scan.stress !== undefined && (
                        <RiskIndicator
                          level={getRiskLevel(member.last_scan.stress, { low: 30, medium: 60 })}
                          label="Estrés"
                          value={member.last_scan.stress}
                          size="sm"
                          showIcon={false}
                        />
                      )}
                      {member.last_scan.fatigue !== undefined && (
                        <RiskIndicator
                          level={getRiskLevel(member.last_scan.fatigue, { low: 30, medium: 60 })}
                          label="Fatiga"
                          value={member.last_scan.fatigue}
                          size="sm"
                          showIcon={false}
                        />
                      )}
                      {member.last_scan.wellness !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          Wellness: {member.last_scan.wellness}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}