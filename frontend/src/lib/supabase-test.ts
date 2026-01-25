import { supabase } from './supabase';

/**
 * Diagnostic script to test Supabase connection and data access
 */
export async function testSupabaseConnection() {
  console.log('🔍 [Supabase Diagnostic] Starting connection tests...');
  
  const results: Record<string, any> = {};

  // Test 1: Check environment variables
  console.log('\n📋 Test 1: Environment Variables');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  results.env = {
    url: supabaseUrl ? '✅ Present' : '❌ Missing',
    key: supabaseAnonKey ? '✅ Present' : '❌ Missing',
    urlValue: supabaseUrl,
    keyPrefix: supabaseAnonKey?.substring(0, 20) + '...'
  };
  console.log('Environment:', results.env);

  // Test 2: Check authentication status
  console.log('\n🔐 Test 2: Authentication Status');
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    results.auth = {
      status: session ? '✅ Authenticated' : '⚠️ Not authenticated',
      userId: session?.user?.id || 'N/A',
      error: sessionError?.message || 'None'
    };
    console.log('Auth:', results.auth);
  } catch (err: any) {
    results.auth = { status: '❌ Error', error: err.message };
    console.error('Auth error:', err);
  }

  // Test 3: Test each table
  const tables = [
    'organizations',
    'user_profiles',
    'departments',
    'param_subscription_plans',
    'param_catalogs',
    'app_settings',
    'prompts',
    'system_logs',
    'ai_analysis_results',
    'subscription_usage_logs',
    'biometric_measurements'
  ];

  console.log('\n📊 Test 3: Table Access');
  results.tables = {};

  for (const table of tables) {
    try {
      console.log(`\nTesting ${table}...`);
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: false })
        .limit(5);

      if (error) {
        results.tables[table] = {
          status: '❌ Error',
          error: error.message,
          code: error.code,
          hint: error.hint
        };
        console.error(`  ❌ ${table}:`, error.message);
        
        // Check if it's an RLS error
        if (error.code === 'PGRST301' || error.message.includes('RLS')) {
          console.warn(`  ⚠️ RLS Policy Issue: ${table} requires authentication or has restrictive policies`);
        }
      } else {
        results.tables[table] = {
          status: '✅ Success',
          count: count || 0,
          hasData: (data?.length || 0) > 0,
          sampleCount: data?.length || 0
        };
        console.log(`  ✅ ${table}: ${count || 0} rows, fetched ${data?.length || 0} samples`);
      }
    } catch (err: any) {
      results.tables[table] = {
        status: '❌ Exception',
        error: err.message
      };
      console.error(`  ❌ ${table} exception:`, err.message);
    }
  }

  // Test 4: Check RLS policies
  console.log('\n🔒 Test 4: RLS Policy Check');
  console.log('Note: If tables show "RLS" errors, policies need to be adjusted in Supabase Dashboard');
  console.log('Common solutions:');
  console.log('  1. Disable RLS for development: ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;');
  console.log('  2. Create permissive policy: CREATE POLICY "Allow all" ON table_name FOR ALL USING (true);');
  console.log('  3. Add user-specific policies based on user_id or role');

  // Summary
  console.log('\n📈 Summary:');
  const successCount = Object.values(results.tables).filter((t: any) => t.status === '✅ Success').length;
  const errorCount = Object.values(results.tables).filter((t: any) => t.status.includes('❌')).length;
  console.log(`  ✅ Successful: ${successCount}/${tables.length}`);
  console.log(`  ❌ Failed: ${errorCount}/${tables.length}`);

  return results;
}

// Auto-run on import in development
if (import.meta.env.DEV) {
  console.log('🚀 Running Supabase diagnostic on load...');
  testSupabaseConnection().then(() => {
    console.log('✅ Diagnostic complete. Check results above.');
  });
}