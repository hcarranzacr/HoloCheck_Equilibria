#!/usr/bin/env python3
"""
Script de prueba para validar las claves API de Supabase
Demuestra si las claves proporcionadas son válidas o no
"""
import os
import sys
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

print("=" * 80)
print("🔍 PRUEBA DE VALIDACIÓN DE CLAVES API DE SUPABASE")
print("=" * 80)
print()

# Mostrar las claves actuales
supabase_url = os.getenv('SUPABASE_URL', 'NOT SET')
anon_key = os.getenv('SUPABASE_ANON_KEY', 'NOT SET')
service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'NOT SET')

print("📋 CLAVES ACTUALES EN .env:")
print(f"   URL: {supabase_url}")
print(f"   ANON_KEY: {anon_key[:30]}... (longitud: {len(anon_key)})")
print(f"   SERVICE_KEY: {service_key[:30]}... (longitud: {len(service_key)})")
print()

# Verificar formato de las claves
print("🔎 VERIFICACIÓN DE FORMATO:")
print()

def check_key_format(key_name, key_value):
    """Verifica si una clave tiene el formato correcto de JWT"""
    print(f"   {key_name}:")
    
    # Verificar longitud
    if len(key_value) < 100:
        print(f"      ❌ Longitud incorrecta: {len(key_value)} caracteres")
        print(f"         (Las claves JWT reales tienen ~150-200 caracteres)")
        return False
    else:
        print(f"      ✅ Longitud: {len(key_value)} caracteres")
    
    # Verificar que empiece con "eyJ"
    if not key_value.startswith('eyJ'):
        print(f"      ❌ No empieza con 'eyJ'")
        print(f"         Empieza con: '{key_value[:20]}...'")
        print(f"         (Las claves JWT reales empiezan con 'eyJ')")
        return False
    else:
        print(f"      ✅ Empieza con 'eyJ'")
    
    # Verificar que tenga 3 partes separadas por puntos
    parts = key_value.split('.')
    if len(parts) != 3:
        print(f"      ❌ No tiene 3 partes separadas por puntos")
        print(f"         Tiene {len(parts)} partes")
        print(f"         (Las claves JWT tienen formato: header.payload.signature)")
        return False
    else:
        print(f"      ✅ Tiene 3 partes (header.payload.signature)")
    
    return True

anon_valid = check_key_format("ANON_KEY", anon_key)
print()
service_valid = check_key_format("SERVICE_ROLE_KEY", service_key)
print()

# Intentar conectar con Supabase
print("🔌 PRUEBA DE CONEXIÓN CON SUPABASE:")
print()

try:
    from supabase import create_client
    
    print("   Intentando crear cliente Supabase...")
    client = create_client(supabase_url, service_key)
    print("   ✅ Cliente creado exitosamente")
    
    print("   Intentando consultar base de datos...")
    response = client.table('user_profiles').select('*').limit(1).execute()
    print(f"   ✅ Consulta exitosa - {len(response.data)} registros")
    
except Exception as e:
    error_msg = str(e)
    print(f"   ❌ ERROR: {error_msg}")
    print()
    
    if "Invalid API key" in error_msg:
        print("   💡 DIAGNÓSTICO:")
        print("      Las claves proporcionadas NO son claves JWT válidas de Supabase.")
        print("      El SDK de Supabase rechaza estas claves antes de hacer cualquier consulta.")
    elif "JWT" in error_msg or "token" in error_msg.lower():
        print("   💡 DIAGNÓSTICO:")
        print("      Las claves tienen un problema de formato JWT.")
    else:
        print("   💡 DIAGNÓSTICO:")
        print("      Error inesperado al conectar con Supabase.")

print()
print("=" * 80)
print("📊 RESULTADO FINAL:")
print("=" * 80)

if anon_valid and service_valid:
    print("✅ Las claves tienen el formato correcto de JWT")
    print("   Si hay errores de conexión, verifica:")
    print("   - Que las claves no hayan expirado")
    print("   - Que el proyecto de Supabase esté activo")
    print("   - Que las claves correspondan al proyecto correcto")
else:
    print("❌ LAS CLAVES NO TIENEN EL FORMATO CORRECTO")
    print()
    print("🔑 FORMATO ESPERADO:")
    print("   - Debe empezar con: eyJ")
    print("   - Longitud aproximada: 150-200 caracteres")
    print("   - Formato: header.payload.signature (3 partes separadas por puntos)")
    print()
    print("📍 DÓNDE OBTENER LAS CLAVES CORRECTAS:")
    print("   1. Ve a: https://supabase.com/dashboard/project/nmwbfvvacilgyxbwvnqb/settings/api")
    print("   2. Busca la sección 'Project API keys'")
    print("   3. Copia las claves que empiezan con 'eyJ'")
    print()
    print("❓ ¿QUÉ CLAVES TIENES AHORA?")
    print(f"   Formato actual: {anon_key[:20]}...")
    print("   Esto parece ser un identificador corto, NO una clave JWT")

print()
print("=" * 80)