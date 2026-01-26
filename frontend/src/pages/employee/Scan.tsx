import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { loadWmeaSdk } from "@/lib/wmeaSdk";
import { apiClient } from "@/lib/api-client";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { toast } from "sonner";
import { Camera, Info, X, AlertCircle } from "lucide-react";

const CDN_DIST =
  "https://unpkg.com/@nuralogix.ai/web-measurement-embedded-app/dist";

const ERROR_MESSAGES: Record<
  string,
  { title: string; message: string; recoverable: boolean }
> = {
  CAMERA_PERMISSION_DENIED: {
    title: "Permiso de cámara denegado",
    message: "Por favor permite el acceso a la cámara en tu navegador.",
    recoverable: true,
  },
  MEASUREMENT_LOW_SNR: {
    title: "Señal débil",
    message: "Busca mejor iluminación y mantente quieto.",
    recoverable: true,
  },
  MEASUREMENT_INCOMPLETE: {
    title: "Calidad de medición baja",
    message:
      "No se pudo completar el escaneo correctamente. Revisa las instrucciones en 'Ayuda' e intenta nuevamente.",
    recoverable: true,
  },
  NO_DEVICES_FOUND: {
    title: "No se encontró cámara",
    message: "No detectamos ninguna cámara conectada.",
    recoverable: false,
  },
  PAGE_NOT_VISIBLE: {
    title: "Pestaña no visible",
    message: "Vuelve a esta pantalla para continuar con la medición.",
    recoverable: true,
  },
};

type ErrorType = {
  code: string;
  message: string;
  title: string;
  recoverable: boolean;
};

/** Portal simple para overlays (monta en document.body) */
function OverlayPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const elRef = useRef<HTMLDivElement | null>(null);

  if (!elRef.current && typeof document !== "undefined") {
    elRef.current = document.createElement("div");
    elRef.current.setAttribute("data-overlay-root", "scan");
  }

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const existing = document.querySelector('div[data-overlay-root="scan"]');
    if (existing && existing !== el) {
      elRef.current = existing as HTMLDivElement;
      setMounted(true);
      return;
    }

    document.body.appendChild(el);
    setMounted(true);

    return () => {
      if (el.parentNode === document.body) document.body.removeChild(el);
    };
  }, []);

  if (!mounted || !elRef.current) return null;
  return createPortal(children, elRef.current);
}

export default function EmployeeScan() {
  const navigate = useNavigate();
  const { logActivity } = useActivityLogger();
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<any>(null);

  const isRestartingRef = useRef(false);
  const measurementStartedRef = useRef(false);

  const warningCountRef = useRef(0);
  const lastWarningTimeRef = useRef(0);
  const warningTimerRef = useRef<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorType | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const hasResultsRef = useRef(false);
  const isRedirectingRef = useRef(false);
  
  useEffect(() => {
    hasResultsRef.current = hasResults;
  }, [hasResults]);
  
  useEffect(() => {
    isRedirectingRef.current = isRedirecting;
  }, [isRedirecting]);

  useEffect(() => {
    logActivity('page_view', { page: 'Employee - Scan' });
    loadCurrentUser();
  }, []);

  async function loadCurrentUser() {
    try {
      const user = await apiClient.auth.me();
      
      if (user) {
        const profileResponse = await apiClient.userProfiles.list({
          query: JSON.stringify({ user_id: user.id }),
          limit: 1
        });
        
        const profile = profileResponse?.items?.[0];
        if (profile) {
          setCurrentUser(profile);
        }
      }
    } catch (err: any) {
      console.error('Error loading user:', err);
    }
  }

  const clearWarningTimer = () => {
    if (warningTimerRef.current != null) {
      window.clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  };

  const showWarning = useCallback((msg: string, ttl = 2000) => {
    clearWarningTimer();
    setWarning(msg);
    warningTimerRef.current = window.setTimeout(() => setWarning(null), ttl);
  }, []);

  const detachHandlers = useCallback(() => {
    const app = appRef.current;
    if (!app) return;
    try {
      app.on.results = () => {};
      app.on.error = () => {};
      app.on.event = () => {};
    } catch (err) {
      console.error('Error detaching handlers:', err);
    }
  }, []);

  const freezeSdk = useCallback(async () => {
    const app = appRef.current;
    if (!app) return;

    try {
      if (typeof app.cancel === "function") {
        await app.cancel(false);
        return;
      }
      if (typeof app.stop === "function") {
        await app.stop();
      }
    } catch (err) {
      console.error('Error freezing SDK:', err);
    }
  }, []);

  const stopAndDestroy = useCallback(async () => {
    const app = appRef.current;
    if (!app) return;

    try {
      if (typeof app.cancel === "function") await app.cancel(true);
      else if (typeof app.stop === "function") await app.stop();
    } catch (err) {
      console.error('Error stopping SDK:', err);
    }

    try {
      if (typeof app.destroy === "function") app.destroy();
    } catch (err) {
      console.error('Error destroying SDK:', err);
    }

    appRef.current = null;
  }, []);

  const autoRestart = useCallback(async () => {
    if (isRestartingRef.current || hasResultsRef.current || isRedirectingRef.current)
      return;

    isRestartingRef.current = true;

    try {
      detachHandlers();
      await stopAndDestroy();
    } catch (err) {
      console.error('Error during auto-restart:', err);
    }

    setTimeout(() => {
      window.location.reload();
    }, 300);
  }, [detachHandlers, stopAndDestroy]);

  const retryMeasurement = useCallback(() => {
    void autoRestart();
  }, [autoRestart]);

  async function saveMeasurement(scanResults: any) {
    if (!currentUser) {
      toast.error('Usuario no encontrado');
      return;
    }

    try {
      setIsSaving(true);

      const points = scanResults.points || {};

      const measurementData = {
        user_id: currentUser.user_id,
        measurement_date: new Date().toISOString(),
        
        heart_rate: points.HR_BPM?.value || null,
        sdnn: points.HRV_SDNN?.value || null,
        rmssd: points.HRV_RMSSD?.value || null,
        ai_stress: points.MSI?.value || null,
        ai_fatigue: points.FATIGUE_LEVEL?.value || null,
        ai_cognitive_load: points.COGNITIVE_LOAD?.value || null,
        ai_recovery: points.RECOVERY_STATUS?.value || null,
        bio_age_basic: points.BIO_AGE?.value || null,
        
        vital_index_score: points.VITAL_SCORE?.value || null,
        physiological_score: points.PHYSIO_SCORE?.value || null,
        mental_score: points.MENTAL_SCORE?.value || null,
        wellness_index_score: points.WELLNESS_SCORE?.value || null,
        mental_stress_index: points.MSI?.value || null,
        cardiac_load: points.CARDIAC_WORKLOAD?.value || null,
        vascular_capacity: points.VASCULAR_CAPACITY?.value || null,
        cv_risk_heart_attack: points.BP_HEART_ATTACK?.value || null,
        cv_risk_stroke: points.BP_STROKE?.value || null,
        
        bmi: points.BMI_CALC?.value || null,
        abdominal_circumference_cm: points.WAIST_CIRCUMFERENCE?.value || null,
        waist_height_ratio: points.WAIST_TO_HEIGHT?.value || null,
        body_shape_index: points.ABSI?.value || null,
        
        arrhythmias_detected: points.IHB_COUNT?.value ? parseInt(points.IHB_COUNT.value) : null,
        signal_to_noise_ratio: points.SNR?.value || null,
        scan_quality_index: points.SIGNAL_QUALITY?.value || null,
        global_health_score: points.HEALTH_SCORE?.value || null,
      };

      const data = await apiClient.measurements.create(measurementData);

      toast.success('Medición guardada exitosamente');
      
      await logActivity('measurement_saved', { 
        page: 'Employee - Scan',
        measurementId: data.id 
      });

      setTimeout(() => {
        navigate('/employee/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error('Error saving measurement:', err);
      toast.error('Error al guardar la medición: ' + err.message);
      
      await logActivity('measurement_save_error', { 
        page: 'Employee - Scan',
        error: err.message 
      }, 'error');
    } finally {
      setIsSaving(false);
    }
  }

  const handleResults = useCallback(
    (results: any) => {
      if (hasResultsRef.current) return;

      const statusId = results?.statusId || "";
      const isPartial = statusId === "PARTIAL";
      const hasLivenessError = results?.errors?.code === "LIVENESS_ERROR";

      if (isPartial || hasLivenessError) {
        setError({
          code: "MEASUREMENT_INCOMPLETE",
          title: "Calidad de medición baja",
          message:
            "No se pudo completar el escaneo. Revisa las instrucciones en 'Ayuda' e intenta nuevamente.",
          recoverable: true,
        });

        void freezeSdk();
        return;
      }

      setHasResults(true);
      setIsRedirecting(true);

      logActivity('scan_complete', { 
        page: 'Employee - Scan',
        measurementId: results.measurementId 
      });

      saveMeasurement(results);
    },
    [freezeSdk, logActivity]
  );

  const handleError = useCallback(
    async (err: any) => {
      if (hasResultsRef.current || isRedirectingRef.current) return;

      const errorCode = err?.code || "UNKNOWN";
      const errorMessage = err?.message || String(err);

      console.log('🔴 [SDK Error]', { errorCode, errorMessage, fullError: err });

      const isEmptyError =
        !err || (typeof err === "object" && Object.keys(err).length === 0);
      if (isEmptyError) return;

      const technicalErrorPatterns = [
        /websocket/i,
        /disconnected/i,
        /wasClean/i,
        /connection/i,
        /network/i,
      ];
      
      if (technicalErrorPatterns.some((p) => p.test(errorMessage))) {
        if (measurementStartedRef.current) showWarning("⚠️ Reconectando...", 2000);
        return;
      }

      if (errorCode === "MEASUREMENT_LOW_SNR") {
        showWarning("⚠️ Señal débil - Mejora la iluminación", 3000);
        return;
      }

      const warningPatterns = [/movement/i, /motion/i];
      if (warningPatterns.some((p) => p.test(errorMessage))) {
        const now = Date.now();
        const timeSinceLast = now - lastWarningTimeRef.current;

        warningCountRef.current = timeSinceLast < 2000 ? warningCountRef.current + 1 : 1;
        lastWarningTimeRef.current = now;

        showWarning("⚠️ Mantente quieto", 2000);

        if (warningCountRef.current >= 5) {
          void autoRestart();
        }
        return;
      }

      const info = ERROR_MESSAGES[errorCode];
      if (info) {
        await freezeSdk();
        setError({
          code: errorCode,
          title: info.title,
          message: info.message,
          recoverable: info.recoverable,
        });
        
        await logActivity('scan_error', { 
          page: 'Employee - Scan',
          errorCode: errorCode,
          error: errorMessage 
        }, 'error');
        
        return;
      }

      if (errorCode === "COLLECTOR" || errorCode === "WORKER_ERROR") {
        void autoRestart();
        return;
      }

      await freezeSdk();
      setError({
        code: errorCode,
        title: "Error inesperado",
        message: errorMessage,
        recoverable: true,
      });
      
      await logActivity('scan_error', { 
        page: 'Employee - Scan',
        errorCode: errorCode,
        error: errorMessage 
      }, 'error');
    },
    [autoRestart, freezeSdk, showWarning, logActivity]
  );

  useEffect(() => {
    let canceled = false;
    let appInstance: any = null;

    async function init() {
      try {
        console.log('🚀 [Scan Init] Starting initialization...');
        
        await new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r()))
        );

        console.log('📋 [Step 1] Loading profile from localStorage...');
        const rawProfile = localStorage.getItem("wmeaProfile");
        if (!rawProfile) {
          console.error('❌ [Step 1] Profile not found in localStorage');
          throw new Error("Perfil no encontrado.");
        }

        const profile = JSON.parse(rawProfile);
        console.log('✅ [Step 1] Profile loaded:', profile);
        
        console.log('📋 [Step 2] Reading environment credentials...');
        const apiUrl = import.meta.env.VITE_DEEPAFFEX_API_URL;
        const licenseKey = import.meta.env.VITE_DEEPAFFEX_LICENSE_KEY;
        const studyId = import.meta.env.VITE_DEEPAFFEX_STUDY_ID;

        console.log('📋 [Step 2] Credentials check:', {
          apiUrl: apiUrl,
          hasLicenseKey: !!licenseKey,
          hasStudyId: !!studyId,
          licenseKeyLength: licenseKey?.length,
          studyIdLength: studyId?.length,
          licenseKeyPrefix: licenseKey?.substring(0, 8),
          studyIdPrefix: studyId?.substring(0, 8)
        });

        if (!apiUrl || !licenseKey || !studyId) {
          console.error('❌ [Step 2] Missing credentials');
          throw new Error("Credenciales de DeepAffex no configuradas");
        }

        // Build the full API URL
        const tokenEndpoint = `https://${apiUrl}/v2/auth/token`;
        
        console.log('🔑 [Step 3] Generating authentication token...');
        console.log('🔑 [Step 3] API endpoint:', tokenEndpoint);
        console.log('🔑 [Step 3] Request body:', {
          licenseKey: licenseKey.substring(0, 8) + '...',
          studyId: studyId.substring(0, 8) + '...'
        });

        const tokenResponse = await fetch(tokenEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            licenseKey: licenseKey,
            studyId: studyId,
          }),
        });

        console.log('📡 [Step 3] Response status:', tokenResponse.status);
        console.log('📡 [Step 3] Response headers:', Object.fromEntries(tokenResponse.headers.entries()));

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('❌ [Step 3] Error response body:', errorText);
          throw new Error(`Error al generar token: ${tokenResponse.status} - ${errorText}`);
        }

        const tokenData = await tokenResponse.json();
        console.log('✅ [Step 3] Token generated successfully:', {
          hasToken: !!tokenData.token,
          hasRefreshToken: !!tokenData.refreshToken,
          tokenLength: tokenData.token?.length,
          tokenPrefix: tokenData.token?.substring(0, 20) + '...'
        });

        const container = containerRef.current;
        if (!container) {
          console.error('❌ [Step 4] Container ref not found');
          throw new Error("Container not found");
        }
        if (canceled) {
          console.log('⚠️ [Step 4] Init canceled before SDK load');
          return;
        }

        console.log('📦 [Step 4] Loading WMEA SDK from:', CDN_DIST);
        const { default: MeasurementEmbeddedApp } = await loadWmeaSdk();
        console.log('✅ [Step 4] SDK loaded successfully');

        console.log('🎯 [Step 5] Creating app instance...');
        appInstance = new MeasurementEmbeddedApp();
        appRef.current = appInstance;
        console.log('✅ [Step 5] App instance created');

        console.log('🔗 [Step 6] Attaching event handlers...');
        appInstance.on.results = handleResults;
        appInstance.on.error = handleError;

        appInstance.on.event = (appEvent: string) => {
          console.log('📍 [SDK Event]', appEvent);
          if (appEvent === "MEASUREMENT_STARTED") measurementStartedRef.current = true;
          if (appEvent === "MEASUREMENT_COMPLETED" || appEvent === "MEASUREMENT_CANCELLED") {
            measurementStartedRef.current = false;
          }
        };
        console.log('✅ [Step 6] Event handlers attached');

        console.log('⚙️ [Step 7] Initializing SDK with config...');
        const initConfig = {
          container,
          appPath: CDN_DIST,
          settings: {
            token: tokenData.token,
            refreshToken: tokenData.refreshToken,
            studyId: studyId,
          },
          profile,
          config: {
            cameraFacingMode: "user",
            cameraAutoStart: true,
            measurementAutoStart: false,
            checkConstraints: true,
            cancelWhenLowSNR: false,
          },
        };
        console.log('⚙️ [Step 7] Init config:', {
          hasContainer: !!initConfig.container,
          appPath: initConfig.appPath,
          hasToken: !!initConfig.settings.token,
          hasRefreshToken: !!initConfig.settings.refreshToken,
          studyId: initConfig.settings.studyId.substring(0, 8) + '...',
          profileKeys: Object.keys(initConfig.profile),
          config: initConfig.config
        });

        await appInstance.init(initConfig);
        console.log('✅ [Step 7] SDK initialization complete');

        if (typeof appInstance.start === "function") {
          console.log('▶️ [Step 8] Starting measurement...');
          setTimeout(() => {
            if (!canceled) {
              appInstance.start();
              console.log('✅ [Step 8] Measurement started');
            }
          }, 0);
        } else {
          console.warn('⚠️ [Step 8] appInstance.start is not a function');
        }

        if (!canceled) {
          console.log('✅ [Complete] All initialization steps completed successfully');
          setLoading(false);
        }
      } catch (e: any) {
        if (canceled) return;
        console.error('❌ [Scan Init] Fatal error:', {
          message: e?.message,
          stack: e?.stack,
          fullError: e
        });
        setError({
          code: "INIT_ERROR",
          title: "Error de inicio",
          message: e?.message || "Error al conectar con la cámara",
          recoverable: true,
        });
        setLoading(false);
      }
    }

    void init();

    return () => {
      canceled = true;
      clearWarningTimer();
      detachHandlers();

      if (appInstance && typeof appInstance.destroy === "function") {
        try {
          appInstance.destroy();
        } catch (err) {
          console.error('Error destroying app instance:', err);
        }
      }
      appRef.current = null;
    };
  }, [detachHandlers, handleError, handleResults]);

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-bold text-slate-900">Escaneo Biométrico</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="px-3 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              Ayuda
            </button>
            <button
              onClick={retryMeasurement}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              Reiniciar
            </button>
            <button
              onClick={() => navigate('/employee/dashboard')}
              className="px-3 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-2 py-6">
        <div className="flex justify-center">
          <div
            className="relative w-full bg-black overflow-hidden"
            style={{
              maxWidth: "min(100vw - 1rem, 600px)",
              aspectRatio: "9/16",
              maxHeight: "calc(100vh - 140px)",
            }}
          >
            <div ref={containerRef} className="absolute inset-0 w-full h-full" />
          </div>
        </div>

        <div
          className={`fixed right-6 top-20 z-40 w-[340px] transition-all duration-300 ${
            showHelp
              ? "opacity-100 translate-y-0"
              : "opacity-0 pointer-events-none translate-y-4"
          }`}
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5">
            <p className="text-sm font-bold mb-3">Instrucciones</p>
            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
              <li>Mantén el rostro en el centro del cuadro.</li>
              <li>Asegura una iluminación uniforme y frontal.</li>
              <li>No hables ni te muevas durante el proceso.</li>
              <li>El sistema es tolerante a movimientos leves.</li>
              <li>Si la señal es débil, aparecerá una advertencia amarilla.</li>
            </ul>
          </div>
        </div>
      </div>

      <OverlayPortal>
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {loading && !error && (
            <div className="absolute inset-0 pointer-events-auto flex items-center justify-center bg-white/70">
              <div className="text-center">
                <div className="animate-spin h-9 w-9 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-700">
                  Iniciando escaneo...
                </p>
              </div>
            </div>
          )}

          {warning && !error && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-amber-500 text-white px-5 py-3 rounded-2xl shadow-lg">
                <p className="text-sm font-bold">{warning}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 pointer-events-auto flex items-center justify-center bg-white px-6">
              <div className="max-w-md text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {error.title}
                </h3>
                <p className="text-slate-600 mb-6">{error.message}</p>
                {error.recoverable && (
                  <button
                    onClick={retryMeasurement}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition"
                  >
                    Intentar nuevamente
                  </button>
                )}
              </div>
            </div>
          )}

          {isRedirecting && (
            <div className="absolute inset-0 pointer-events-auto flex items-center justify-center bg-white/90">
              <div className="text-center">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-lg font-bold text-slate-900 mb-2">
                  ¡Escaneo completado!
                </p>
                <p className="text-slate-600">
                  {isSaving ? 'Guardando resultados...' : 'Redirigiendo al dashboard...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </OverlayPortal>
    </main>
  );
}