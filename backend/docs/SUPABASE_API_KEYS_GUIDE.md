# Guía: Cómo Obtener las Claves API de Supabase

## ⚠️ IMPORTANTE: Diferencia entre JWK y API Keys

### ❌ Lo que NO necesitamos (JWK - JSON Web Key)
```json
{
  "x": "dn-5k_KabRaty6Lgrsci8HVECiZZ2CD6VL0oP_XcSRE",
  "y": "6atOQgeFOKHIyBx2hLk5-zwnDMFjf7JvBYBiNGjs-rE",
  "alg": "ES256",
  ...
}
```
Esta es una clave pública para **verificar** tokens JWT. No sirve para conectar al backend de Supabase.

### ✅ Lo que SÍ necesitamos (API Keys)
```
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2Jmdnhxx...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2Jmdnhxx...
```
Estas son claves JWT largas (~150-200 caracteres) que empiezan con `eyJ`.

---

## 📋 Pasos para Obtener las Claves Correctas

### Paso 1: Ir a la Configuración del Proyecto
1. Abre tu navegador
2. Ve a: **https://supabase.com/dashboard/project/nmwbfvvacilgyxbwvnqb/settings/api**
3. Inicia sesión si es necesario

### Paso 2: Ubicar las API Keys
En la página de configuración, busca la sección **"Project API keys"**. Verás:

```
┌─────────────────────────────────────────────────────────────┐
│ Project API keys                                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ anon                                                         │
│ public                                                       │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...  │
│ [Copy]                                                       │
│                                                              │
│ service_role                                                 │
│ secret                                                       │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...  │
│ [Copy]                                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Paso 3: Copiar las Claves
1. **anon key** (public):
   - Haz clic en el botón [Copy] junto a "anon public"
   - Esta clave es segura para usar en el frontend

2. **service_role key** (secret):
   - Haz clic en el botón [Copy] junto a "service_role secret"
   - ⚠️ Esta clave es SECRETA - solo para backend

### Paso 4: Verificar el Formato
Las claves correctas deben:
- ✅ Empezar con: `eyJ`
- ✅ Tener aproximadamente 150-200 caracteres
- ✅ Contener puntos (`.`) separando tres partes: `xxxxx.yyyyy.zzzzz`
- ✅ Ser una sola línea de texto (sin saltos de línea)

**Ejemplo de formato correcto:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2Jmdnhxx...
```

**Formato INCORRECTO (NO usar):**
```
sb_secret_vzUZjie6hy3CzoUUwq3muw_hX72Lhvu  ❌ Demasiado corto
sb_publishable_bv9N5FWT448fasDBMBD8Og_jM3cc4pj  ❌ No es JWT
{ "x": "dn-5k_KabRaty6Lgrsci8...", ... }  ❌ Esto es JWK, no API key
```

---

## 🔧 Cómo Actualizar las Claves en el Proyecto

Una vez que tengas las claves correctas, necesitas actualizar el archivo `.env`:

### Opción 1: Proporcionar las Claves al Equipo
Envía un mensaje con este formato:

```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2Jmdnhxx...

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2Jmdnhxx...
```

### Opción 2: Actualizar Manualmente
1. Abre el archivo: `/workspace/app/backend/.env`
2. Reemplaza las líneas:
   ```env
   SUPABASE_ANON_KEY=sb_publishable_bv9N5FWT448fasDBMBD8Og_jM3cc4pj
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_vzUZjie6hy3CzoUUwq3muw_hX72Lhvu
   ```
3. Con las claves reales:
   ```env
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2Jmdnhxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2Jmdnhxx...
   ```
4. Guarda el archivo
5. Reinicia el backend:
   ```bash
   cd /workspace/app/backend
   pkill -f uvicorn
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

---

## ❓ Preguntas Frecuentes

### ¿Por qué necesitamos estas claves?
Las API keys de Supabase permiten que el backend se conecte a tu base de datos y autentique usuarios. Sin ellas, el sistema no puede funcionar.

### ¿Son seguras estas claves?
- **anon key**: Segura para frontend, tiene permisos limitados
- **service_role key**: DEBE mantenerse secreta, tiene acceso completo

### ¿Qué pasa si no encuentro las claves?
Si no ves la sección "Project API keys" en tu dashboard:
1. Verifica que estás en el proyecto correcto (nmwbfvvacilgyxbwvnqb)
2. Asegúrate de tener permisos de administrador
3. Intenta refrescar la página
4. Contacta al soporte de Supabase si el problema persiste

### ¿Puedo regenerar las claves?
Sí, pero esto invalidará las claves antiguas y romperá todas las conexiones existentes. Solo hazlo si:
- Las claves fueron comprometidas
- Necesitas rotar las credenciales por seguridad

---

## 🚀 Próximos Pasos

Una vez que proporciones las claves correctas:
1. ✅ El backend se conectará a Supabase exitosamente
2. ✅ Los errores 401 desaparecerán
3. ✅ Los dashboards cargarán datos correctamente
4. ✅ BiometricGaugeWithInfo mostrará información de indicadores
5. ✅ Toda la funcionalidad estará operativa

---

## 📞 Soporte

Si tienes problemas para obtener las claves:
- Documentación oficial: https://supabase.com/docs/guides/api/api-keys
- Dashboard del proyecto: https://supabase.com/dashboard/project/nmwbfvvacilgyxbwvnqb/settings/api