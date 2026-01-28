import { apiClient } from './api-client';

/**
 * Standard Dashboard Data Loading Pattern
 * USE THIS IN ALL DASHBOARDS (Employee, Leader, HR, Admin)
 */

export interface DashboardLoadResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Standard authentication check for all dashboards
 */
export async function checkDashboardAuth(): Promise<DashboardLoadResult<{ user: any; session: any }>> {
  try {
    console.log('🔑 [Dashboard Utils] Checking authentication...');
    
    // Get session using Supabase client
    const session = await apiClient.auth.getSession();
    
    if (!session) {
      console.error('❌ [Dashboard Utils] No session found');
      return {
        success: false,
        error: 'No active session. Please log in.'
      };
    }

    console.log('✅ [Dashboard Utils] Session exists');

    // Get current user
    const user = await apiClient.auth.getUser();
    
    if (!user) {
      console.error('❌ [Dashboard Utils] No user found');
      return {
        success: false,
        error: 'User not found. Please log in again.'
      };
    }

    console.log(`✅ [Dashboard Utils] User authenticated: ${user.email}`);

    return {
      success: true,
      data: { user, session }
    };
  } catch (error: any) {
    console.error('❌ [Dashboard Utils] Authentication error:', error);
    return {
      success: false,
      error: error.message || 'Authentication failed'
    };
  }
}

/**
 * Standard user profile loading
 */
export async function loadUserProfile(userId: string): Promise<DashboardLoadResult<any>> {
  try {
    console.log(`📋 [Dashboard Utils] Loading profile for user: ${userId}`);
    
    const response = await apiClient.userProfiles.query({
      query: { user_id: userId },
      limit: 1
    });

    if (!response.data.items || response.data.items.length === 0) {
      console.warn('⚠️ [Dashboard Utils] No profile found');
      return {
        success: false,
        error: 'User profile not found. Please complete onboarding.'
      };
    }

    const profile = response.data.items[0];
    console.log(`✅ [Dashboard Utils] Profile loaded: ${profile.full_name}`);

    return {
      success: true,
      data: profile
    };
  } catch (error: any) {
    console.error('❌ [Dashboard Utils] Profile loading error:', error);
    return {
      success: false,
      error: error.message || 'Failed to load user profile'
    };
  }
}

/**
 * Standard biometric data loading
 */
export async function loadBiometricData(userId: string): Promise<DashboardLoadResult<{
  latest: any;
  history: any[];
}>> {
  try {
    console.log(`📊 [Dashboard Utils] Loading biometric data for user: ${userId}`);

    // Load latest measurement
    const latest = await apiClient.getLatestMeasurement(userId);
    
    if (!latest) {
      console.warn('⚠️ [Dashboard Utils] No measurements found');
    } else {
      console.log('✅ [Dashboard Utils] Latest measurement loaded');
    }

    // Load measurement history
    const history = await apiClient.getMeasurementHistory(userId, 30);
    console.log(`✅ [Dashboard Utils] Loaded ${history.length} historical measurements`);

    return {
      success: true,
      data: { latest, history }
    };
  } catch (error: any) {
    console.error('❌ [Dashboard Utils] Biometric data loading error:', error);
    return {
      success: false,
      error: error.message || 'Failed to load biometric data'
    };
  }
}

/**
 * Standard recommendations loading
 */
export async function loadRecommendations(userId: string): Promise<DashboardLoadResult<any[]>> {
  try {
    console.log(`💡 [Dashboard Utils] Loading recommendations for user: ${userId}`);
    
    const recommendations = await apiClient.getUserRecommendations(userId);
    console.log(`✅ [Dashboard Utils] Loaded ${recommendations.length} recommendations`);

    return {
      success: true,
      data: recommendations
    };
  } catch (error: any) {
    console.error('❌ [Dashboard Utils] Recommendations loading error:', error);
    return {
      success: false,
      error: error.message || 'Failed to load recommendations'
    };
  }
}

/**
 * Standard indicator ranges loading
 */
export async function loadIndicatorRanges(): Promise<DashboardLoadResult<any[]>> {
  try {
    console.log('📏 [Dashboard Utils] Loading indicator ranges...');
    
    const response = await apiClient.entities.biometric_indicator_info.query({
      limit: 100
    });

    const ranges = response.data.items;
    console.log(`✅ [Dashboard Utils] Loaded ${ranges.length} indicator ranges`);

    return {
      success: true,
      data: ranges
    };
  } catch (error: any) {
    console.error('❌ [Dashboard Utils] Indicator ranges loading error:', error);
    return {
      success: false,
      error: error.message || 'Failed to load indicator ranges'
    };
  }
}

/**
 * Complete dashboard data loading (Employee Dashboard pattern)
 */
export async function loadEmployeeDashboardData() {
  console.log('📊 [Dashboard Utils] START - Loading employee dashboard data');

  // Step 1: Check authentication
  const authResult = await checkDashboardAuth();
  if (!authResult.success || !authResult.data) {
    return { success: false, error: authResult.error };
  }

  const { user } = authResult.data;

  // Step 2: Load indicator ranges
  const rangesResult = await loadIndicatorRanges();
  if (!rangesResult.success) {
    return { success: false, error: rangesResult.error };
  }

  // Step 3: Load user profile
  const profileResult = await loadUserProfile(user.id);
  // Profile is optional, continue even if not found

  // Step 4: Load biometric data
  const biometricResult = await loadBiometricData(user.id);
  // Biometric data is optional, continue even if not found

  // Step 5: Load recommendations
  const recommendationsResult = await loadRecommendations(user.id);
  // Recommendations are optional, continue even if not found

  console.log('✅ [Dashboard Utils] SUCCESS - All data loaded');

  return {
    success: true,
    data: {
      user,
      profile: profileResult.data || null,
      ranges: rangesResult.data || [],
      latestMeasurement: biometricResult.data?.latest || null,
      measurementHistory: biometricResult.data?.history || [],
      recommendations: recommendationsResult.data || []
    }
  };
}