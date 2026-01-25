import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface UseSupabaseQueryOptions {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}

export function useSupabaseQuery({
  table,
  select = '*',
  filters = {},
  orderBy,
  limit,
}: UseSupabaseQueryOptions) {
  console.log('🔍 [useSupabaseQuery] Query details:');
  console.log('   Table:', table);
  console.log('   Select:', select);
  console.log('   Filters:', filters);
  console.log('   OrderBy:', orderBy);
  console.log('   Limit:', limit);

  return useQuery({
    queryKey: [table, select, JSON.stringify(filters), orderBy, limit],
    queryFn: async () => {
      console.log('[useSupabaseQuery] Fetching data...');

      let query = supabase.from(table).select(select);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [useSupabaseQuery] Error:', error);
        console.error('   Message:', error.message);
        console.error('   Code:', error.code);
        console.error('   Details:', error.details);
        console.error('   Hint:', error.hint);
        console.error('❌ [useSupabaseQuery] Full error object:', error);
        throw error;
      }

      console.log('✅ [useSupabaseQuery] Data fetched successfully');
      console.log('   Rows returned:', data?.length || 0);
      return data;
    },
    retry: 1,           // Only retry once to prevent infinite loops
    retryDelay: 1000,   // Wait 1 second before retry
    staleTime: 30000,   // Cache for 30 seconds
  });
}