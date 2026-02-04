-- =====================================================
-- Dashboard Evolution Views - Equilibria 2026
-- Based on David's Data Availability Analysis
-- =====================================================

-- View 1: vw_department_usage
-- Purpose: Compare platform usage across departments
CREATE OR REPLACE VIEW vw_department_usage AS
SELECT 
  d.id as department_id,
  d.name as department_name,
  d.organization_id,
  
  -- User counts
  COUNT(DISTINCT up.user_id) as total_users,
  COUNT(DISTINCT CASE WHEN up.is_active = true THEN up.user_id END) as active_users,
  COUNT(DISTINCT usu.user_id) as users_with_scans,
  
  -- Scan metrics
  COALESCE(SUM(usu.total_scans), 0) as total_scans,
  COALESCE(AVG(usu.total_scans), 0) as avg_scans_per_user,
  COALESCE(MAX(usu.total_scans), 0) as max_scans_per_user,
  COALESCE(MIN(CASE WHEN usu.total_scans > 0 THEN usu.total_scans END), 0) as min_scans_per_user,
  
  -- Participation rate
  ROUND(
    (COUNT(DISTINCT usu.user_id)::numeric / NULLIF(COUNT(DISTINCT up.user_id), 0)) * 100, 
    2
  ) as participation_rate,
  
  -- Last scan date
  MAX(usu.last_scan_date) as last_scan_date

FROM departments d
LEFT JOIN user_profiles up ON d.id = up.department_id
LEFT JOIN user_scan_usage usu ON up.user_id = usu.user_id
WHERE d.is_active = true
GROUP BY d.id, d.name, d.organization_id;

-- View 2: vw_weekly_trends
-- Purpose: Weekly aggregation of biometric metrics for trend analysis
CREATE OR REPLACE VIEW vw_weekly_trends AS
SELECT 
  up.user_id,
  up.organization_id,
  up.department_id,
  
  -- Week identification
  DATE_TRUNC('week', bm.created_at) as week_start,
  EXTRACT(YEAR FROM bm.created_at) as year,
  EXTRACT(WEEK FROM bm.created_at) as week_number,
  
  -- Scan count
  COUNT(*) as scans_count,
  
  -- Calculated wellness index (field doesn't exist, use formula)
  AVG((100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3) as avg_wellness_index,
  
  -- Actual fields
  AVG(bm.ai_stress) as avg_stress,
  AVG(bm.ai_fatigue) as avg_fatigue,
  AVG(bm.ai_recovery) as avg_recovery,
  AVG(bm.ai_cognitive_load) as avg_cognitive_load,
  AVG(bm.mental_score) as avg_mental_score,
  
  -- Bio age gap (using actual field name bio_age_basic)
  AVG(bm.bio_age_basic - EXTRACT(YEAR FROM AGE(CURRENT_DATE, up.date_of_birth))) as avg_bio_age_gap,
  
  -- Min/Max values
  MIN((100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3) as min_wellness_index,
  MAX((100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3) as max_wellness_index,
  MIN(bm.ai_stress) as min_stress,
  MAX(bm.ai_stress) as max_stress,
  
  -- Variability
  STDDEV((100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3) as stddev_wellness_index,
  STDDEV(bm.ai_stress) as stddev_stress

FROM biometric_measurements bm
INNER JOIN user_profiles up ON bm.user_id = up.user_id
WHERE bm.created_at >= NOW() - INTERVAL '6 months'
GROUP BY 
  up.user_id, 
  up.organization_id, 
  up.department_id, 
  DATE_TRUNC('week', bm.created_at),
  EXTRACT(YEAR FROM bm.created_at),
  EXTRACT(WEEK FROM bm.created_at);

-- View 3: vw_monthly_trends
-- Purpose: Monthly aggregation of biometric metrics for trend analysis
CREATE OR REPLACE VIEW vw_monthly_trends AS
SELECT 
  up.user_id,
  up.organization_id,
  up.department_id,
  
  -- Month identification
  DATE_TRUNC('month', bm.created_at) as month_start,
  EXTRACT(YEAR FROM bm.created_at) as year,
  EXTRACT(MONTH FROM bm.created_at) as month_number,
  TO_CHAR(bm.created_at, 'YYYY-MM') as month_label,
  
  -- Scan count
  COUNT(*) as scans_count,
  
  -- Calculated wellness index
  AVG((100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3) as avg_wellness_index,
  
  -- Actual fields
  AVG(bm.ai_stress) as avg_stress,
  AVG(bm.ai_fatigue) as avg_fatigue,
  AVG(bm.ai_recovery) as avg_recovery,
  AVG(bm.ai_cognitive_load) as avg_cognitive_load,
  AVG(bm.mental_score) as avg_mental_score,
  
  -- Bio age gap
  AVG(bm.bio_age_basic - EXTRACT(YEAR FROM AGE(CURRENT_DATE, up.date_of_birth))) as avg_bio_age_gap,
  
  -- Min/Max values
  MIN((100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3) as min_wellness_index,
  MAX((100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3) as max_wellness_index,
  MIN(bm.ai_stress) as min_stress,
  MAX(bm.ai_stress) as max_stress,
  
  -- Variability
  STDDEV((100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3) as stddev_wellness_index,
  STDDEV(bm.ai_stress) as stddev_stress,
  
  -- Percentiles
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY (100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3) as p25_wellness_index,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY (100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3) as p50_wellness_index,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY (100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3) as p75_wellness_index

FROM biometric_measurements bm
INNER JOIN user_profiles up ON bm.user_id = up.user_id
WHERE bm.created_at >= NOW() - INTERVAL '12 months'
GROUP BY 
  up.user_id, 
  up.organization_id, 
  up.department_id, 
  DATE_TRUNC('month', bm.created_at),
  EXTRACT(YEAR FROM bm.created_at),
  EXTRACT(MONTH FROM bm.created_at),
  TO_CHAR(bm.created_at, 'YYYY-MM');

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_bm_user_created ON biometric_measurements(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_bm_created ON biometric_measurements(created_at);
CREATE INDEX IF NOT EXISTS idx_up_dept ON user_profiles(department_id, user_id);
CREATE INDEX IF NOT EXISTS idx_up_org ON user_profiles(organization_id, user_id);

-- Success message
SELECT 'Evolution views created successfully!' as status;
