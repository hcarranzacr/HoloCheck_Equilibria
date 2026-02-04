import { useState, useEffect } from 'react';
import { Star, ExternalLink, Gift } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Benefit {
  id: string;
  partner_id: string;
  title: string;
  benefit_description: string;
  how_to_use: string;
  link_url: string;
  image_url: string;
  tags: string[];
  is_active: boolean;
}

export default function LoyaltyBenefitsIndicator() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBenefits();
  }, []);

  async function loadBenefits() {
    try {
      setLoading(true);
      console.log('🌟 [LoyaltyBenefits] Loading benefits from partner_benefits table...');

      // Get current user's organization
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return;
      }

      // Get user profile to find organization_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        console.error('Error loading profile:', profileError);
        return;
      }

      // Get all active benefits from partner_benefits table
      const { data: benefitsData, error: benefitsError } = await supabase
        .from('partner_benefits')
        .select('*')
        .eq('is_active', true)
        .order('title');

      if (benefitsError) {
        console.error('Error loading benefits:', benefitsError);
        return;
      }

      console.log('✅ [LoyaltyBenefits] Loaded', benefitsData?.length || 0, 'benefits from partner_benefits');
      
      // Debug: Log each benefit's image_url
      benefitsData?.forEach((benefit, idx) => {
        console.log(`📸 [Benefit ${idx + 1}] ${benefit.title}:`, benefit.image_url);
      });
      
      setBenefits(benefitsData || []);
    } catch (error) {
      console.error('Error loading benefits:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || benefits.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Indicator */}
      <div className="fixed top-20 right-6 z-50">
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="relative bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full shadow-lg p-4 animate-bounce"
        >
          {/* Pulsing ring effect */}
          <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75"></span>
          
          {/* Star icon */}
          <Star className="w-6 h-6 relative z-10 fill-current" />
          
          {/* Badge with count */}
          <Badge 
            className="absolute -top-2 -right-2 bg-red-500 text-white border-2 border-white"
          >
            {benefits.length}
          </Badge>
        </Button>
      </div>

      {/* Benefits Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Gift className="w-6 h-6 text-amber-500" />
              Beneficios Disponibles
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-2">
              Aprovecha estos {benefits.length} beneficios exclusivos disponibles para ti
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {benefits.map((benefit) => {
              console.log(`🖼️ [Rendering] ${benefit.title} - Image URL:`, benefit.image_url);
              
              return (
                <Card key={benefit.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    {benefit.image_url && (
                      <div className="md:w-1/3 bg-gray-100 flex items-center justify-center">
                        <img
                          src={benefit.image_url}
                          alt={benefit.title}
                          className="w-full h-48 md:h-full object-cover"
                          onLoad={(e) => {
                            console.log(`✅ [Image Loaded] ${benefit.title}`);
                          }}
                          onError={(e) => {
                            console.error(`❌ [Image Failed] ${benefit.title} - URL:`, benefit.image_url);
                            // Show placeholder instead of hiding
                            e.currentTarget.src = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Beneficio';
                          }}
                        />
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="flex-1 p-6">
                      <CardHeader className="p-0 mb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">
                              {benefit.title}
                            </CardTitle>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Activo
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="p-0 space-y-3">
                        {/* Description */}
                        <p className="text-gray-700">
                          {benefit.benefit_description}
                        </p>

                        {/* How to Use - Highlighted */}
                        {benefit.how_to_use && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h4 className="font-semibold text-blue-900 text-sm mb-1 flex items-center gap-1">
                              <span>💡</span> Cómo usar este beneficio:
                            </h4>
                            <p className="text-blue-800 text-sm">
                              {benefit.how_to_use}
                            </p>
                          </div>
                        )}

                        {/* Tags */}
                        {benefit.tags && benefit.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {benefit.tags.map((tag, index) => (
                              <Badge 
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Action Button */}
                        {benefit.link_url && (
                          <Button
                            onClick={() => window.open(benefit.link_url, '_blank')}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Acceder al Beneficio
                          </Button>
                        )}
                      </CardContent>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="text-xs text-gray-500 italic border-t pt-4 mt-4">
            <p>
              <strong>Nota:</strong> Los beneficios están sujetos a disponibilidad y términos de cada aliado comercial. 
              Para más información, contacta a tu departamento de Recursos Humanos.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}