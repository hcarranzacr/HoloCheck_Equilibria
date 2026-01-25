import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  age: number;
  sex: number; // 1=male, 2=female, 3=other
  height: number; // cm
  weight: number; // kg
  diabetes: number; // 4=no, 5=pre-diabetic, 6=diabetic
  smoking: number; // 0=no, 1=yes (CRITICAL: SDK expects "smoking" not "smoker")
  bloodPressureMedication: number; // 0=no, 1=yes
}

export default function PreScanQuestionnaire() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<ProfileData>({
    age: 30,
    sex: 1,
    height: 170,
    weight: 70,
    diabetes: 4,
    smoking: 0, // Changed from "smoker" to "smoking"
    bloodPressureMedication: 0,
  });

  const handleSubmit = () => {
    console.group('📋 [QUESTIONNAIRE] Validando y guardando perfil');
    console.info('📍 Timestamp:', new Date().toISOString());
    
    // Validate all fields
    if (profile.age < 18 || profile.age > 120) {
      console.error('❌ Edad inválida:', profile.age);
      toast.error('Por favor ingresa una edad válida (18-120 años)');
      console.groupEnd();
      return;
    }
    if (profile.height < 120 || profile.height > 220) {
      console.error('❌ Altura inválida:', profile.height);
      toast.error('Por favor ingresa una altura válida (120-220 cm)');
      console.groupEnd();
      return;
    }
    if (profile.weight < 30 || profile.weight > 300) {
      console.error('❌ Peso inválido:', profile.weight);
      toast.error('Por favor ingresa un peso válido (30-300 kg)');
      console.groupEnd();
      return;
    }

    // CRITICAL: Validate smoking and bloodPressureMedication are 0 or 1
    if (profile.smoking !== 0 && profile.smoking !== 1) {
      console.error('❌ Valor de smoking inválido:', profile.smoking, '(debe ser 0 o 1)');
      toast.error('Error en configuración de fumador');
      console.groupEnd();
      return;
    }
    if (profile.bloodPressureMedication !== 0 && profile.bloodPressureMedication !== 1) {
      console.error('❌ Valor de bloodPressureMedication inválido:', profile.bloodPressureMedication, '(debe ser 0 o 1)');
      toast.error('Error en configuración de medicación');
      console.groupEnd();
      return;
    }

    console.info('✅ Validación completa exitosa');
    console.info('👤 Perfil a guardar:', {
      age: profile.age,
      sex: profile.sex,
      height: profile.height,
      weight: profile.weight,
      diabetes: profile.diabetes,
      smoking: profile.smoking, // Changed from "smoker" to "smoking"
      bloodPressureMedication: profile.bloodPressureMedication
    });

    // Save to localStorage
    localStorage.setItem('wmeaProfile', JSON.stringify(profile));
    console.info('💾 Perfil guardado en localStorage');

    toast.success('Perfil guardado correctamente');
    console.groupEnd();
    
    // Navigate to scan page
    setTimeout(() => {
      navigate('/employee/scan');
    }, 500);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Información Básica</h2>
        <p className="text-slate-600">Por favor completa tu información personal</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Edad (años)
          </label>
          <input
            type="number"
            min="18"
            max="120"
            value={profile.age}
            onChange={(e) => {
              const value = e.target.value;
              // Allow empty string during typing
              if (value === '') {
                setProfile({ ...profile, age: 18 });
                return;
              }
              const numValue = parseInt(value);
              // Only update if it's a valid number
              if (!isNaN(numValue)) {
                setProfile({ ...profile, age: numValue });
              }
            }}
            onBlur={(e) => {
              // Ensure valid value on blur
              const numValue = parseInt(e.target.value);
              if (isNaN(numValue) || numValue < 18) {
                setProfile({ ...profile, age: 18 });
              } else if (numValue > 120) {
                setProfile({ ...profile, age: 120 });
              }
            }}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Sexo
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setProfile({ ...profile, sex: 1 })}
              className={`px-4 py-3 rounded-lg font-bold transition ${
                profile.sex === 1
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Masculino
            </button>
            <button
              type="button"
              onClick={() => setProfile({ ...profile, sex: 2 })}
              className={`px-4 py-3 rounded-lg font-bold transition ${
                profile.sex === 2
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Femenino
            </button>
            <button
              type="button"
              onClick={() => setProfile({ ...profile, sex: 3 })}
              className={`px-4 py-3 rounded-lg font-bold transition ${
                profile.sex === 3
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Otro
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Altura (cm)
            </label>
            <input
              type="number"
              min="120"
              max="220"
              value={profile.height}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setProfile({ ...profile, height: 120 });
                  return;
                }
                const numValue = parseInt(value);
                if (!isNaN(numValue)) {
                  setProfile({ ...profile, height: numValue });
                }
              }}
              onBlur={(e) => {
                const numValue = parseInt(e.target.value);
                if (isNaN(numValue) || numValue < 120) {
                  setProfile({ ...profile, height: 120 });
                } else if (numValue > 220) {
                  setProfile({ ...profile, height: 220 });
                }
              }}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Peso (kg)
            </label>
            <input
              type="number"
              min="30"
              max="300"
              value={profile.weight}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setProfile({ ...profile, weight: 30 });
                  return;
                }
                const numValue = parseInt(value);
                if (!isNaN(numValue)) {
                  setProfile({ ...profile, weight: numValue });
                }
              }}
              onBlur={(e) => {
                const numValue = parseInt(e.target.value);
                if (isNaN(numValue) || numValue < 30) {
                  setProfile({ ...profile, weight: 30 });
                } else if (numValue > 300) {
                  setProfile({ ...profile, weight: 300 });
                }
              }}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        className="w-full px-6 py-4 bg-sky-600 text-white rounded-lg font-bold hover:bg-sky-700 transition flex items-center justify-center gap-2"
      >
        Continuar
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Información de Salud</h2>
        <p className="text-slate-600">Ayúdanos a obtener resultados más precisos</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            ¿Tienes diabetes?
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setProfile({ ...profile, diabetes: 4 })}
              className={`px-4 py-3 rounded-lg font-bold transition ${
                profile.diabetes === 4
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              No
            </button>
            <button
              type="button"
              onClick={() => setProfile({ ...profile, diabetes: 5 })}
              className={`px-4 py-3 rounded-lg font-bold transition ${
                profile.diabetes === 5
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pre-diabético
            </button>
            <button
              type="button"
              onClick={() => setProfile({ ...profile, diabetes: 6 })}
              className={`px-4 py-3 rounded-lg font-bold transition ${
                profile.diabetes === 6
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sí
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            ¿Eres fumador?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                console.info('🚭 [QUESTIONNAIRE] Usuario seleccionó: No fumador (0)');
                setProfile({ ...profile, smoking: 0 }); // Changed from "smoker" to "smoking"
              }}
              className={`px-4 py-3 rounded-lg font-bold transition ${
                profile.smoking === 0
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              No
            </button>
            <button
              type="button"
              onClick={() => {
                console.info('🚬 [QUESTIONNAIRE] Usuario seleccionó: Fumador (1)');
                setProfile({ ...profile, smoking: 1 }); // Changed from "smoker" to "smoking"
              }}
              className={`px-4 py-3 rounded-lg font-bold transition ${
                profile.smoking === 1
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sí
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            ¿Tomas medicación para la presión arterial?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                console.info('💊 [QUESTIONNAIRE] Usuario seleccionó: Sin medicación (0)');
                setProfile({ ...profile, bloodPressureMedication: 0 });
              }}
              className={`px-4 py-3 rounded-lg font-bold transition ${
                profile.bloodPressureMedication === 0
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              No
            </button>
            <button
              type="button"
              onClick={() => {
                console.info('💊 [QUESTIONNAIRE] Usuario seleccionó: Con medicación (1)');
                setProfile({ ...profile, bloodPressureMedication: 1 });
              }}
              className={`px-4 py-3 rounded-lg font-bold transition ${
                profile.bloodPressureMedication === 1
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sí
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep(1)}
          className="flex-1 px-6 py-4 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition"
        >
          Atrás
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
        >
          <Camera className="w-5 h-5" />
          Iniciar Escaneo
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full transition ${step >= 1 ? 'bg-sky-600' : 'bg-slate-300'}`} />
            <div className="w-16 h-1 bg-slate-300">
              <div className={`h-full bg-sky-600 transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`w-3 h-3 rounded-full transition ${step >= 2 ? 'bg-sky-600' : 'bg-slate-300'}`} />
          </div>
          <p className="text-center text-sm text-slate-600">
            Paso {step} de 2
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 ? renderStep1() : renderStep2()}
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            🔒 Tu información es privada y segura
          </p>
        </div>
      </div>
    </main>
  );
}