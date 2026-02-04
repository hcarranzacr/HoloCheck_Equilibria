import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrganizationBranding } from '@/types/branding';
import { FileText, Target } from 'lucide-react';

interface MissionVisionSectionProps {
  branding: OrganizationBranding | null;
}

export default function MissionVisionSection({ branding }: MissionVisionSectionProps) {
  const mission = branding?.mission_statement;
  const vision = branding?.vision_statement;

  // Don't render if both are empty
  if (!mission && !vision) {
    return null;
  }

  return (
    <div className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Mission Card */}
          {mission && (
            <Card className="hover:shadow-lg transition-shadow duration-300 animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 rounded-full bg-blue-100">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  Nuestra Misión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {mission}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Vision Card */}
          {vision && (
            <Card className="hover:shadow-lg transition-shadow duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 rounded-full bg-amber-100">
                    <Target className="w-6 h-6 text-amber-600" />
                  </div>
                  Nuestra Visión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {vision}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}