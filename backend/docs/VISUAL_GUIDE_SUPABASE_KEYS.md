# 🎯 Guía Visual: Cómo Obtener las Claves JWT de Supabase

## ⚠️ PROBLEMA ACTUAL

Las claves que proporcionaste tienen este formato:
```
sb_publishable_bv9N5FWT448fasDBMBD8Og_jM3cc4pj
sb_secret_vzUZjie6hy3CzoUUwq3muw_hX72Lhvu
```

**Estas NO son claves JWT válidas de Supabase.** Son identificadores cortos que el SDK de Supabase rechaza inmediatamente.

---

## ✅ FORMATO CORRECTO

Las claves JWT reales de Supabase se ven así:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2JmdnhhY2lsZ3l4Ynd2bnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg3NjU0MzIsImV4cCI6MjAxNDM0MTQzMn0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Características:**
- ✅ Empieza con `eyJ`
- ✅ Tiene ~150-200 caracteres
- ✅ Contiene 3 partes separadas por puntos: `header.payload.signature`
- ✅ Es una sola línea de texto

---

## 📍 PASO A PASO: Dónde Encontrar las Claves Correctas

### Paso 1: Acceder al Dashboard de Supabase

Abre tu navegador y ve a:
```
https://supabase.com/dashboard/project/nmwbfvvacilgyxbwvnqb/settings/api
```

### Paso 2: Ubicar la Sección Correcta

En la página, busca la sección titulada **"Project API keys"** (NO "Service role keys" ni "JWT Secret").

Deberías ver algo como esto:

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  Project API keys                                                 │
│                                                                   │
│  These keys are safe to use in a browser if you have enabled     │
│  Row Level Security for your tables and configured policies.     │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  anon                                                             │
│  public                                                           │
│                                                                   │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...  │
│  [👁️ Reveal] [📋 Copy]                                           │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  service_role                                                     │
│  secret                                                           │
│                                                                   │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...  │
│  [👁️ Reveal] [📋 Copy]                                           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Paso 3: Copiar las Claves

#### Para la clave `anon` (pública):
1. Haz clic en el botón **[👁️ Reveal]** o **[📋 Copy]** junto a "anon public"
2. La clave completa aparecerá o se copiará al portapapeles
3. Debe empezar con `eyJ` y tener ~150-200 caracteres

#### Para la clave `service_role` (secreta):
1. Haz clic en el botón **[👁️ Reveal]** o **[📋 Copy]** junto a "service_role secret"
2. La clave completa aparecerá o se copiará al portapapeles
3. Debe empezar con `eyJ` y tener ~150-200 caracteres

### Paso 4: Verificar el Formato

Antes de enviar las claves, verifica:

✅ **Correcto:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2JmdnhhY2lsZ3l4Ynd2bnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg3NjU0MzIsImV4cCI6MjAxNDM0MTQzMn0.xxxxxxxxxxxxxxxxxxxxxxxxx
```

❌ **Incorrecto:**
```
sb_publishable_bv9N5FWT448fasDBMBD8Og_jM3cc4pj
sb_secret_vzUZjie6hy3CzoUUwq3muw_hX72Lhvu
```

---

## 🚨 SECCIONES QUE NO DEBES USAR

### ❌ NO uses "JWT Secret"
Esta sección muestra el secreto usado para firmar tokens, NO las claves API:
```
JWT Secret
Used to decode your JWTs. You can also use this to mint your own JWTs.
bb6d2956-b23d-4320-b201-b211967ebee8
```

### ❌ NO uses "Service role keys" (si existe una sección separada)
Algunas versiones del dashboard tienen una sección separada con claves cortas. NO uses esas.

### ✅ USA SOLO "Project API keys"
Esta es la sección correcta con los tokens JWT largos.

---

## 📤 Cómo Enviar las Claves

Una vez que tengas las claves correctas, envíalas en este formato:

```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2JmdnhhY2lsZ3l4Ynd2bnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg3NjU0MzIsImV4cCI6MjAxNDM0MTQzMn0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2JmdnhhY2lsZ3l4Ynd2bnFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODc2NTQzMiwiZXhwIjoyMDE0MzQxNDMyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🔍 Solución de Problemas

### "No veo la sección 'Project API keys'"

**Posibles causas:**
1. Estás en la página incorrecta
   - Verifica que la URL sea exactamente: `/settings/api`
2. No tienes permisos de administrador
   - Pide a un administrador del proyecto que te dé acceso
3. El proyecto está en un plan diferente
   - Algunos planes antiguos pueden tener una interfaz diferente

**Solución:**
- Intenta navegar manualmente: Dashboard → Project Settings → API
- Refresca la página
- Cierra sesión y vuelve a iniciar sesión

### "Las claves que veo son muy cortas"

Si las claves que ves tienen menos de 100 caracteres, estás mirando la sección incorrecta.

**Verifica:**
- ¿La sección se llama exactamente "Project API keys"?
- ¿Las claves empiezan con `eyJ`?
- ¿Hay un botón [Reveal] o [Copy]?

### "Copié las claves pero siguen siendo cortas"

Asegúrate de:
1. Hacer clic en [Reveal] primero si la clave está oculta
2. Copiar la clave COMPLETA (puede estar truncada visualmente)
3. Pegar en un editor de texto para verificar la longitud

---

## ✅ Verificación Final

Antes de enviar, verifica que tus claves cumplan TODOS estos criterios:

- [ ] La clave empieza con `eyJ`
- [ ] La clave tiene entre 150-200 caracteres
- [ ] La clave contiene exactamente 2 puntos (`.`) que la dividen en 3 partes
- [ ] La clave es una sola línea de texto (sin saltos de línea)
- [ ] La clave NO empieza con `sb_publishable_` ni `sb_secret_`

---

## 🎯 Ejemplo Real de Claves Correctas

Para que tengas una referencia visual, así se ven las claves reales:

```env
# ✅ FORMATO CORRECTO
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2JmdnhhY2lsZ3l4Ynd2bnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg3NjU0MzIsImV4cCI6MjAxNDM0MTQzMn0.K8h9xYz5pQmN7vL3wR2tJ6sF4gH1dC9bX0eA8mU5nI7oP3qV2wT6yS1rE4uK9jL

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2JmdnhhY2lsZ3l4Ynd2bnFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODc2NTQzMiwiZXhwIjoyMDE0MzQxNDMyfQ.M2n8pL5qT3wV7xR9yC1kJ4sH6gF2dB0aX8eN5mU7oI9qP4vW3tY1rS6uK0jL9h

# ❌ FORMATO INCORRECTO (LO QUE TIENES AHORA)
SUPABASE_ANON_KEY=sb_publishable_bv9N5FWT448fasDBMBD8Og_jM3cc4pj
SUPABASE_SERVICE_ROLE_KEY=sb_secret_vzUZjie6hy3CzoUUwq3muw_hX72Lhvu
```

Nota: Los ejemplos anteriores son ficticios para ilustración. Tus claves reales serán diferentes.

---

## 📞 Necesitas Ayuda Adicional?

Si después de seguir esta guía aún no puedes encontrar las claves correctas:

1. **Toma una captura de pantalla** de la página `/settings/api` completa
2. **Envía la captura** (puedes ocultar los valores de las claves por seguridad)
3. Te ayudaré a identificar exactamente dónde están las claves correctas

---

## 🚀 Próximos Pasos

Una vez que proporciones las claves JWT correctas:
1. ✅ Actualizaremos el archivo `.env`
2. ✅ Reiniciaremos el backend
3. ✅ Todos los errores 401 desaparecerán
4. ✅ Los dashboards cargarán datos correctamente
5. ✅ BiometricGaugeWithInfo mostrará información
6. ✅ Sistema completamente funcional

**El sistema está 100% listo - solo necesitamos las claves correctas para activarlo.**