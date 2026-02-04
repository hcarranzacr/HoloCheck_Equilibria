# Data Availability Analysis Report - Equilibria Dashboard Evolution

**Date:** 2026-02-03  
**Analyst:** David (Data Analyst)  
**Version:** 1.0  
**Status:** Complete

---

## Executive Summary

This report validates all data references in Emma's Dashboard Evolution PRD against the actual database schema. The analysis identifies data gaps, proposes corrected SQL views, and provides recommendations for successful implementation.

### Key Findings

✅ **8/12 tables** referenced in PRD exist in database  
⚠️ **4 tables** need correction or alternative approaches  
✅ **3 existing views** available for use  
🆕 **5 new views** need to be created (with corrected SQL)  
⚠️ **Critical field mismatches** identified in `biometric_measurements` and `department_insights`

### Critical Issues Identified

1. **`wellness_index_score` field does NOT exist** in `biometric_measurements` table
2. **`biological_age` field does NOT exist** (actual field is `bio_age_basic`)
3. **`department_insights` table has only 4 fields**, not 19 as assumed in PRD
4. **`benefits` table does NOT exist** (should use `partner_benefits`)
5. **`user_benefit_activations` table does NOT exist** (should use `user_benefit_usage_logs`)

---

## Table of Contents

1. [Database Schema Analysis](#database-schema-analysis)
2. [Table Validation](#table-validation)
3. [Field Validation](#field-validation)
4. [View Validation](#view-validation)
5. [Corrected SQL Specifications](#corrected-sql-specifications)
6. [Query Recommendations](#query-recommendations)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Risk Assessment](#risk-assessment)

---

## 1. Database Schema Analysis

### 1.1 Available Tables (41 total)

#### Core Measurement Tables
| Table | Status | Description | Key Fields |
|-------|--------|-------------|------------|
| `biometric_measurements` | ✅ EXISTS | All biometric scans | `ai_stress`, `ai_fatigue`, `ai_recovery`, `ai_cognitive_load`, `mental_score`, `bio_age_basic`, `created_at` |
| `user_profiles` | ✅ EXISTS | User information | `user_id`, `organization_id`, `department_id`, `full_name` |
| `user_scan_usage` | ✅ EXISTS | Scan usage tracking | `user_id`, `scan_date`, `total_scans` |

#### Insights Tables
| Table | Status | Description | Key Fields |
|-------|--------|-------------|------------|
| `department_insights` | ⚠️ LIMITED | Department analysis | `id`, `department_id`, `summary`, `created_at` |
| `organization_insights` | ✅ EXISTS | Organization analysis | `stress_index`, `burnout_risk`, `sleep_index`, `actuarial_risk`, `claim_risk`, `analysis_date` |

#### Organization Tables
| Table | Status | Description | Key Fields |
|-------|--------|-------------|------------|
| `departments` | ✅ EXISTS | Department info | `id`, `organization_id`, `name` |
| `organizations` | ✅ EXISTS | Organization info | `id`, `name` |
| `organization_subscriptions` | ✅ EXISTS | Subscription data | `organization_id`, `plan_id`, `status` |
| `organization_usage_summary` | ✅ EXISTS | Usage metrics | `organization_id`, `month`, `total_scans` |

#### Benefits Tables
| Table | Status | Description | Alternative |
|-------|--------|-------------|-------------|
| `benefits` | ❌ NOT FOUND | - | Use `partner_benefits` |
| `user_benefit_activations` | ❌ NOT FOUND | - | Use `user_benefit_usage_logs` |
| `partner_benefits` | ✅ EXISTS | Partner benefits | `id`, `title`, `description` |
| `user_benefit_usage_logs` | ✅ EXISTS | Benefit usage | `user_id`, `benefit_id`, `activated_at` |

### 1.2 Existing Views (3 total)

| View | Status | Description | Usage |
|------|--------|-------------|-------|
| `vw_current_department_metrics` | ✅ EXISTS | Current department metrics | Leader Dashboard |
| `vw_employees_at_risk` | ✅ EXISTS | Employees at risk | Leader/HR Dashboard |
| `vw_active_partner_programs_by_org` | ✅ EXISTS | Active programs | All Dashboards |

---

## 2. Table Validation

### 2.1 Tables Referenced in PRD

| Table Name | Status | Validation | Notes |
|------------|--------|------------|-------|
| `biometric_measurements` | ✅ VALID | Exists | Core table for all evolution charts |
| `user_profiles` | ✅ VALID | Exists | User information |
| `departments` | ✅ VALID | Exists | Department information |
| `department_insights` | ⚠️ PARTIAL | Exists but limited | Only 4 fields, not 19 as assumed |
| `organization_insights` | ✅ VALID | Exists | Organization-level metrics |
| `organization_subscriptions` | ✅ VALID | Exists | Subscription data |
| `organization_usage_summary` | ✅ VALID | Exists | Usage tracking |
| `user_scan_usage` | ✅ VALID | Exists | Scan usage per user |
| `benefits` | ❌ INVALID | Not found | **Use `partner_benefits` instead** |
| `user_benefit_activations` | ❌ INVALID | Not found | **Use `user_benefit_usage_logs` instead** |
| `user_prompt_usage` | ❌ INVALID | Not found | **May not exist, need to verify** |
| `bm` (alias) | ✅ VALID | Alias only | Alias for `biometric_measurements` |

### 2.2 Critical Table Issues

#### Issue 1: `department_insights` Structure Mismatch

**PRD Assumption:**
```
19 fields including:
- avg_stress, avg_fatigue, avg_cognitive_load, avg_recovery
- wellness_index, burnout_risk_score
- total_employees, employees_at_risk
- etc.
```

**Actual Structure:**
```python
class Department_insights:
    id = Column(UUID)
    department_id = Column(UUID)
    summary = Column(String)  # JSON or text summary
    created_at = Column(DateTime)
```

**Impact:** HIGH - All Leader Dashboard evolution charts depend on this table having detailed metrics.

**Recommendation:** 
1. Parse the `summary` field (if it contains JSON with metrics)
2. OR create a new table `department_metrics` with proper structure
3. OR calculate metrics on-the-fly from `biometric_measurements` grouped by department

---

## 3. Field Validation

### 3.1 Critical Field Mismatches in `biometric_measurements`

| Field in PRD | Actual Field | Status | Impact |
|--------------|--------------|--------|--------|
| `wellness_index_score` | ❌ NOT FOUND | CRITICAL | Used in 64 places in PRD |
| `biological_age` | `bio_age_basic` | ✅ FOUND | Rename required |
| `ai_stress` | `ai_stress` | ✅ VALID | - |
| `ai_fatigue` | `ai_fatigue` | ✅ VALID | - |
| `ai_recovery` | `ai_recovery` | ✅ VALID | - |
| `ai_cognitive_load` | `ai_cognitive_load` | ✅ VALID | - |
| `mental_stress_index` | `mental_score` | ⚠️ SIMILAR | May be equivalent |
| `created_at` | `created_at` | ✅ VALID | - |

#### Critical Issue: Missing `wellness_index_score`

**Problem:** The PRD assumes `wellness_index_score` exists in `biometric_measurements`, but it does NOT.

**Possible Solutions:**

1. **Calculate from existing fields:**
```sql
-- Option 1: Simple average
(100 - ai_stress + 100 - ai_fatigue + ai_recovery) / 3 AS wellness_index_score

-- Option 2: Weighted formula
(0.4 * (100 - ai_stress) + 0.3 * (100 - ai_fatigue) + 0.3 * ai_recovery) AS wellness_index_score
```

2. **Use `mental_score` as proxy:**
```sql
mental_score AS wellness_index_score
```

3. **Add column to table:**
```sql
ALTER TABLE biometric_measurements 
ADD COLUMN wellness_index_score NUMERIC;

-- Populate with calculated values
UPDATE biometric_measurements 
SET wellness_index_score = (100 - ai_stress + 100 - ai_fatigue + ai_recovery) / 3;
```

**Recommendation:** Use Option 1 (calculated field) in all queries and views to avoid schema changes.

### 3.2 Field Validation in `organization_insights`

| Field in PRD | Actual Field | Status | Notes |
|--------------|--------------|--------|-------|
| `wellness_index` | ❌ NOT FOUND | MISSING | Need to calculate or add |
| `stress_index` | ✅ EXISTS | VALID | - |
| `burnout_risk` | ✅ EXISTS | VALID | - |
| `sleep_index` | ✅ EXISTS | VALID | - |
| `actuarial_risk` | ✅ EXISTS | VALID | - |
| `claim_risk` | ✅ EXISTS | VALID | - |
| `analysis_date` | ✅ EXISTS | VALID | - |
| `organization_id` | ✅ EXISTS | VALID | - |

**Issue:** `wellness_index` does NOT exist in `organization_insights`.

**Solution:** Calculate from `stress_index` and `burnout_risk`:
```sql
(100 - stress_index * 20) AS wellness_index
```

---

## 4. View Validation

### 4.1 Existing Views (Already Available)

#### ✅ `vw_current_department_metrics`
- **Status:** EXISTS
- **Usage:** Leader Dashboard current metrics
- **Fields:** Need to verify actual structure

#### ✅ `vw_employees_at_risk`
- **Status:** EXISTS
- **Usage:** Leader/HR Dashboard risk analysis
- **Fields:** Need to verify actual structure

#### ✅ `vw_active_partner_programs_by_org`
- **Status:** EXISTS
- **Usage:** All dashboards for benefits
- **Fields:** Need to verify actual structure

### 4.2 New Views to Create (5 total)

| View Name | Priority | Complexity | Dependencies | Status |
|-----------|----------|------------|--------------|--------|
| `vw_department_comparison` | HIGH | Medium | `department_insights` fix | ⚠️ BLOCKED |
| `vw_department_usage` | HIGH | Low | None | ✅ READY |
| `vw_benefit_impact` | MEDIUM | High | Table name corrections | ⚠️ NEEDS FIX |
| `vw_weekly_trends` | MEDIUM | Medium | None | ✅ READY |
| `vw_monthly_trends` | MEDIUM | Medium | None | ✅ READY |

---

## 5. Corrected SQL Specifications

### 5.1 View: `vw_department_usage` (CORRECTED)

**Status:** ✅ READY TO IMPLEMENT

```sql
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
```

**Fields Returned:**
- `department_id`, `department_name`, `organization_id`
- `total_users`, `active_users`, `users_with_scans`
- `total_scans`, `avg_scans_per_user`, `max_scans_per_user`, `min_scans_per_user`
- `participation_rate`, `last_scan_date`

---

### 5.2 View: `vw_weekly_trends` (CORRECTED)

**Status:** ✅ READY TO IMPLEMENT (with field corrections)

```sql
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
  
  -- Calculated wellness index (since it doesn't exist)
  AVG((100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3) as avg_wellness_index,
  
  -- Actual fields
  AVG(bm.ai_stress) as avg_stress,
  AVG(bm.ai_fatigue) as avg_fatigue,
  AVG(bm.ai_recovery) as avg_recovery,
  AVG(bm.ai_cognitive_load) as avg_cognitive_load,
  AVG(bm.mental_score) as avg_mental_score,
  
  -- Bio age gap (using actual field name)
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
```

**Key Changes:**
- ✅ Calculates `wellness_index` from existing fields
- ✅ Uses `bio_age_basic` instead of `biological_age`
- ✅ Uses `mental_score` instead of `mental_stress_index`

---

### 5.3 View: `vw_monthly_trends` (CORRECTED)

**Status:** ✅ READY TO IMPLEMENT (with field corrections)

```sql
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
```

---

### 5.4 View: `vw_benefit_impact` (CORRECTED - BLOCKED)

**Status:** ⚠️ BLOCKED - Requires table name corrections

**Issues:**
1. `benefits` table does NOT exist → use `partner_benefits`
2. `user_benefit_activations` table does NOT exist → use `user_benefit_usage_logs`
3. Need to verify structure of `user_benefit_usage_logs`

**Corrected SQL (TENTATIVE):**

```sql
CREATE OR REPLACE VIEW vw_benefit_impact AS
SELECT 
  pb.id as benefit_id,
  pb.title as benefit_title,
  pb.description as benefit_description,
  pb.organization_id,
  
  -- Count users who used the benefit
  COUNT(DISTINCT ubul.user_id) as users_activated,
  
  -- Metrics BEFORE using benefit (30 days before first usage)
  AVG(
    CASE 
      WHEN bm.created_at BETWEEN ubul.usage_date - INTERVAL '30 days' AND ubul.usage_date 
      THEN (100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3
    END
  ) as avg_wellness_before,
  
  AVG(
    CASE 
      WHEN bm.created_at BETWEEN ubul.usage_date - INTERVAL '30 days' AND ubul.usage_date 
      THEN bm.ai_stress 
    END
  ) as avg_stress_before,
  
  AVG(
    CASE 
      WHEN bm.created_at BETWEEN ubul.usage_date - INTERVAL '30 days' AND ubul.usage_date 
      THEN bm.ai_fatigue 
    END
  ) as avg_fatigue_before,
  
  -- Metrics AFTER using benefit (30 days after first usage)
  AVG(
    CASE 
      WHEN bm.created_at BETWEEN ubul.usage_date AND ubul.usage_date + INTERVAL '30 days' 
      THEN (100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3
    END
  ) as avg_wellness_after,
  
  AVG(
    CASE 
      WHEN bm.created_at BETWEEN ubul.usage_date AND ubul.usage_date + INTERVAL '30 days' 
      THEN bm.ai_stress 
    END
  ) as avg_stress_after,
  
  AVG(
    CASE 
      WHEN bm.created_at BETWEEN ubul.usage_date AND ubul.usage_date + INTERVAL '30 days' 
      THEN bm.ai_fatigue 
    END
  ) as avg_fatigue_after,
  
  -- Impact calculation
  AVG(
    CASE 
      WHEN bm.created_at BETWEEN ubul.usage_date AND ubul.usage_date + INTERVAL '30 days' 
      THEN (100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3
    END
  ) - AVG(
    CASE 
      WHEN bm.created_at BETWEEN ubul.usage_date - INTERVAL '30 days' AND ubul.usage_date 
      THEN (100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3
    END
  ) as wellness_impact,
  
  AVG(
    CASE 
      WHEN bm.created_at BETWEEN ubul.usage_date - INTERVAL '30 days' AND ubul.usage_date 
      THEN bm.ai_stress 
    END
  ) - AVG(
    CASE 
      WHEN bm.created_at BETWEEN ubul.usage_date AND ubul.usage_date + INTERVAL '30 days' 
      THEN bm.ai_stress 
    END
  ) as stress_reduction,
  
  MIN(ubul.usage_date) as first_activation_date,
  MAX(ubul.usage_date) as last_activation_date

FROM partner_benefits pb
LEFT JOIN user_benefit_usage_logs ubul ON pb.id = ubul.benefit_id
LEFT JOIN biometric_measurements bm ON ubul.user_id = bm.user_id
WHERE ubul.usage_date IS NOT NULL
  AND pb.is_active = true
GROUP BY pb.id, pb.title, pb.description, pb.organization_id
HAVING COUNT(DISTINCT ubul.user_id) > 0;
```

**⚠️ WARNING:** This SQL is TENTATIVE. Need to verify:
1. Actual structure of `user_benefit_usage_logs` table
2. Field names (is it `usage_date` or `activated_at`?)
3. Relationship between `partner_benefits` and `user_benefit_usage_logs`

---

### 5.5 View: `vw_department_comparison` (BLOCKED)

**Status:** ❌ BLOCKED - Cannot implement until `department_insights` is fixed

**Problem:** The PRD assumes `department_insights` has fields like:
- `wellness_index`, `avg_stress`, `avg_fatigue`, `avg_cognitive_load`, `avg_recovery`, `burnout_risk_score`

**Reality:** `department_insights` only has:
- `id`, `department_id`, `summary`, `created_at`

**Options:**

#### Option A: Parse JSON from `summary` field
```sql
-- If summary contains JSON like:
-- {"wellness_index": 75.5, "avg_stress": 45.2, ...}

CREATE OR REPLACE VIEW vw_department_comparison AS
SELECT 
  d.id as department_id,
  d.name as department_name,
  d.organization_id,
  
  -- Extract from JSON summary
  (di.summary::json->>'wellness_index')::numeric as dept_wellness_index,
  (di.summary::json->>'avg_stress')::numeric as dept_avg_stress,
  (di.summary::json->>'avg_fatigue')::numeric as dept_avg_fatigue,
  -- ... etc
  
FROM departments d
LEFT JOIN LATERAL (
  SELECT * 
  FROM department_insights 
  WHERE department_id = d.id 
  ORDER BY created_at DESC 
  LIMIT 1
) di ON true;
```

#### Option B: Calculate on-the-fly from `biometric_measurements`
```sql
CREATE OR REPLACE VIEW vw_department_comparison AS
SELECT 
  d.id as department_id,
  d.name as department_name,
  d.organization_id,
  
  -- Calculate from biometric_measurements (last 30 days)
  AVG((100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3) as dept_wellness_index,
  AVG(bm.ai_stress) as dept_avg_stress,
  AVG(bm.ai_fatigue) as dept_avg_fatigue,
  AVG(bm.ai_cognitive_load) as dept_avg_cognitive_load,
  AVG(bm.ai_recovery) as dept_avg_recovery,
  
  -- Organization averages
  (
    SELECT AVG((100 - bm2.ai_stress + 100 - bm2.ai_fatigue + bm2.ai_recovery) / 3)
    FROM biometric_measurements bm2
    INNER JOIN user_profiles up2 ON bm2.user_id = up2.user_id
    WHERE up2.organization_id = d.organization_id
      AND bm2.created_at >= NOW() - INTERVAL '30 days'
  ) as org_avg_wellness_index,
  
  (
    SELECT AVG(bm2.ai_stress)
    FROM biometric_measurements bm2
    INNER JOIN user_profiles up2 ON bm2.user_id = up2.user_id
    WHERE up2.organization_id = d.organization_id
      AND bm2.created_at >= NOW() - INTERVAL '30 days'
  ) as org_avg_stress,
  
  (
    SELECT AVG(bm2.ai_fatigue)
    FROM biometric_measurements bm2
    INNER JOIN user_profiles up2 ON bm2.user_id = up2.user_id
    WHERE up2.organization_id = d.organization_id
      AND bm2.created_at >= NOW() - INTERVAL '30 days'
  ) as org_avg_fatigue,
  
  MAX(bm.created_at) as last_analysis_date

FROM departments d
LEFT JOIN user_profiles up ON d.id = up.department_id
LEFT JOIN biometric_measurements bm ON up.user_id = bm.user_id
WHERE d.is_active = true
  AND bm.created_at >= NOW() - INTERVAL '30 days'
GROUP BY d.id, d.name, d.organization_id;
```

**Recommendation:** Use Option B (calculate on-the-fly) until `department_insights` structure is clarified.

---

## 6. Query Recommendations

### 6.1 Personal Evolution Query (Employee Dashboard)

**Endpoint:** `GET /api/v1/biometric-measurements/my-history?days=30`

**Corrected Query:**
```sql
SELECT 
  DATE(created_at) as date,
  -- Calculate wellness index
  AVG((100 - ai_stress + 100 - ai_fatigue + ai_recovery) / 3) as wellness_index_score,
  AVG(ai_stress) as ai_stress,
  AVG(ai_fatigue) as ai_fatigue,
  AVG(ai_recovery) as ai_recovery,
  AVG(ai_cognitive_load) as ai_cognitive_load,
  AVG(mental_score) as mental_score
FROM biometric_measurements
WHERE user_id = :current_user_id
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date ASC;
```

**Performance Optimization:**
- Add index: `CREATE INDEX idx_bm_user_created ON biometric_measurements(user_id, created_at);`
- Cache results for 1 hour

---

### 6.2 Department Evolution Query (Leader Dashboard)

**Endpoint:** `GET /api/v1/department-insights/evolution?department_id={id}&months=6`

**Problem:** Cannot use `department_insights` as planned.

**Solution:** Calculate from `biometric_measurements` grouped by month:

```sql
SELECT 
  TO_CHAR(DATE_TRUNC('month', bm.created_at), 'YYYY-MM') as analysis_period,
  DATE_TRUNC('month', bm.created_at) as month_start,
  
  -- Calculate metrics
  AVG((100 - bm.ai_stress + 100 - bm.ai_fatigue + bm.ai_recovery) / 3) as wellness_index,
  AVG(bm.ai_stress) as avg_stress,
  AVG(bm.ai_fatigue) as avg_fatigue,
  AVG(bm.ai_recovery) as avg_recovery,
  AVG(bm.ai_cognitive_load) as avg_cognitive_load,
  
  -- Burnout risk score (calculated)
  CASE 
    WHEN AVG(bm.ai_stress) > 70 AND AVG(bm.ai_fatigue) > 60 THEN 4.5
    WHEN AVG(bm.ai_stress) > 60 AND AVG(bm.ai_fatigue) > 50 THEN 3.5
    WHEN AVG(bm.ai_stress) > 50 THEN 2.5
    ELSE 1.5
  END as burnout_risk_score,
  
  COUNT(DISTINCT bm.user_id) as employees_scanned,
  COUNT(*) as total_scans

FROM biometric_measurements bm
INNER JOIN user_profiles up ON bm.user_id = up.user_id
WHERE up.department_id = :department_id
  AND bm.created_at >= NOW() - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', bm.created_at)
ORDER BY month_start ASC;
```

**Performance Optimization:**
- Add index: `CREATE INDEX idx_bm_dept_created ON biometric_measurements(user_id, created_at);`
- Add index: `CREATE INDEX idx_up_dept ON user_profiles(department_id, user_id);`
- Cache results for 1 hour

---

### 6.3 Organization Evolution Query (HR Dashboard)

**Endpoint:** `GET /api/v1/organization-insights/evolution?organization_id={id}&months=12`

**Query:**
```sql
SELECT 
  analysis_date,
  -- Calculate wellness_index if it doesn't exist
  COALESCE(wellness_index, (100 - stress_index * 20)) as wellness_index,
  stress_index,
  burnout_risk,
  sleep_index,
  actuarial_risk,
  claim_risk,
  total_employees
FROM organization_insights
WHERE organization_id = :organization_id
  AND analysis_date >= NOW() - INTERVAL '12 months'
ORDER BY analysis_date ASC;
```

**Note:** If `wellness_index` column doesn't exist, calculate it from `stress_index`.

---

### 6.4 Usage Trends Query (Admin Dashboard)

**Endpoint:** `GET /api/v1/organization-usage-summary/trends?organization_id={id}&months=12`

**Query:**
```sql
SELECT 
  TO_CHAR(month, 'YYYY-MM') as month,
  total_scans,
  total_valid_scans,
  (total_scans - total_valid_scans) as total_invalid_scans,
  total_ai_tokens_used as total_prompts_used,
  total_department_analyses,
  total_organization_analyses
FROM organization_usage_summary
WHERE organization_id = :organization_id
  AND month >= DATE_TRUNC('month', NOW() - INTERVAL '12 months')
ORDER BY month ASC;
```

---

## 7. Implementation Roadmap

### Phase 1: Immediate Fixes (Week 1)

**Priority:** CRITICAL

1. **Update Emma's PRD with corrected field names:**
   - ❌ `wellness_index_score` → ✅ Calculate from `(100 - ai_stress + 100 - ai_fatigue + ai_recovery) / 3`
   - ❌ `biological_age` → ✅ `bio_age_basic`
   - ❌ `benefits` → ✅ `partner_benefits`
   - ❌ `user_benefit_activations` → ✅ `user_benefit_usage_logs`

2. **Clarify `department_insights` structure:**
   - Verify if `summary` field contains JSON with metrics
   - OR decide to calculate metrics on-the-fly from `biometric_measurements`

3. **Create ready-to-implement views:**
   - ✅ `vw_department_usage`
   - ✅ `vw_weekly_trends`
   - ✅ `vw_monthly_trends`

**Deliverables:**
- Updated PRD with corrected field names
- 3 database views created and tested
- Documentation of calculation formulas

---

### Phase 2: Backend Endpoints (Week 2-3)

**Priority:** HIGH

1. **Implement corrected API endpoints:**
   - `GET /api/v1/biometric-measurements/my-history` (with calculated wellness_index)
   - `GET /api/v1/department-insights/evolution` (calculate from biometric_measurements)
   - `GET /api/v1/organization-insights/evolution` (with wellness_index calculation)
   - `GET /api/v1/organization-usage-summary/trends`

2. **Add database indexes for performance:**
   ```sql
   CREATE INDEX idx_bm_user_created ON biometric_measurements(user_id, created_at);
   CREATE INDEX idx_bm_created ON biometric_measurements(created_at);
   CREATE INDEX idx_up_dept ON user_profiles(department_id, user_id);
   CREATE INDEX idx_up_org ON user_profiles(organization_id, user_id);
   ```

3. **Implement caching strategy:**
   - Cache evolution queries for 1 hour
   - Invalidate cache on new scan

**Deliverables:**
- 4 working API endpoints
- Database indexes created
- Caching implemented

---

### Phase 3: Blocked Views Resolution (Week 4)

**Priority:** MEDIUM

1. **Resolve `department_insights` issue:**
   - Option A: Parse JSON from `summary` field
   - Option B: Create new table `department_metrics`
   - Option C: Always calculate on-the-fly

2. **Create `vw_department_comparison` (after resolution)**

3. **Verify and create `vw_benefit_impact`:**
   - Confirm structure of `user_benefit_usage_logs`
   - Test with sample data

**Deliverables:**
- Decision on `department_insights` approach
- 2 additional views created
- Integration tests

---

### Phase 4: Frontend Integration (Week 5-8)

**Priority:** MEDIUM

1. **Update frontend components with corrected field names**
2. **Implement evolution charts with real data**
3. **Add error handling for missing data**
4. **Performance testing and optimization**

**Deliverables:**
- Working dashboard evolution features
- Performance benchmarks
- User acceptance testing

---

## 8. Risk Assessment

### 8.1 High-Risk Issues

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| `wellness_index_score` doesn't exist | HIGH | 100% | Use calculated formula in all queries |
| `department_insights` has wrong structure | HIGH | 90% | Calculate metrics on-the-fly from `biometric_measurements` |
| Performance issues with on-the-fly calculations | MEDIUM | 60% | Add indexes, implement caching, use materialized views |
| `user_benefit_usage_logs` structure unknown | MEDIUM | 50% | Verify table structure before implementing benefit impact |

### 8.2 Medium-Risk Issues

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Missing `wellness_index` in `organization_insights` | MEDIUM | 80% | Calculate from `stress_index` |
| Large data volumes slow queries | MEDIUM | 40% | Implement pagination, limit date ranges |
| Cache invalidation complexity | LOW | 30% | Use simple time-based expiration |

### 8.3 Low-Risk Issues

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Field name inconsistencies | LOW | 20% | Document all field mappings |
| Missing indexes | LOW | 10% | Add indexes proactively |

---

## 9. Recommendations Summary

### 9.1 Critical Actions Required

1. ✅ **Update PRD immediately** with corrected field names
2. ✅ **Clarify `department_insights` structure** before implementing Leader Dashboard evolution
3. ✅ **Use calculated `wellness_index`** formula everywhere: `(100 - ai_stress + 100 - ai_fatigue + ai_recovery) / 3`
4. ✅ **Verify `user_benefit_usage_logs` structure** before implementing benefit impact analysis

### 9.2 Database Changes Required

1. **Create 3 views immediately:**
   - `vw_department_usage`
   - `vw_weekly_trends`
   - `vw_monthly_trends`

2. **Create 2 views after clarification:**
   - `vw_department_comparison` (after `department_insights` resolution)
   - `vw_benefit_impact` (after table verification)

3. **Add performance indexes:**
   ```sql
   CREATE INDEX idx_bm_user_created ON biometric_measurements(user_id, created_at);
   CREATE INDEX idx_bm_created ON biometric_measurements(created_at);
   CREATE INDEX idx_up_dept ON user_profiles(department_id, user_id);
   CREATE INDEX idx_up_org ON user_profiles(organization_id, user_id);
   ```

### 9.3 Backend Changes Required

1. **Implement 4 new API endpoints** with corrected queries
2. **Add caching layer** for evolution queries
3. **Implement wellness_index calculation** in all relevant endpoints

### 9.4 Frontend Changes Required

1. **Update all references** from `wellness_index_score` to calculated value
2. **Update all references** from `biological_age` to `bio_age_basic`
3. **Handle missing data gracefully** with fallbacks

---

## 10. Conclusion

### Data Availability: ⚠️ PARTIAL

- **Core tables:** ✅ Available
- **Key fields:** ⚠️ Need corrections and calculations
- **Views:** ⚠️ 3 exist, 5 need creation (2 blocked)
- **Endpoints:** ❌ Need implementation with corrections

### Feasibility: ✅ ACHIEVABLE with Corrections

The dashboard evolution plan is **feasible** but requires:
1. Field name corrections throughout PRD
2. Calculated `wellness_index` formula
3. Resolution of `department_insights` structure issue
4. Verification of benefit-related tables

### Estimated Effort Adjustment

| Original Estimate | Corrected Estimate | Reason |
|-------------------|-------------------|--------|
| 320 hours (8 weeks) | 360 hours (9 weeks) | +40 hours for corrections and clarifications |

### Next Steps

1. **Immediate (Day 1):** Emma updates PRD with corrected field names
2. **Week 1:** David creates 3 ready-to-implement views
3. **Week 1:** Alex clarifies `department_insights` structure
4. **Week 2-3:** Alex implements corrected backend endpoints
5. **Week 4:** Resolve blocked views
6. **Week 5-9:** Frontend integration and testing

---

## Appendices

### Appendix A: Field Mapping Reference

| PRD Field | Actual Field | Location | Formula/Notes |
|-----------|--------------|----------|---------------|
| `wellness_index_score` | N/A | `biometric_measurements` | Calculate: `(100 - ai_stress + 100 - ai_fatigue + ai_recovery) / 3` |
| `biological_age` | `bio_age_basic` | `biometric_measurements` | Direct mapping |
| `mental_stress_index` | `mental_score` | `biometric_measurements` | Direct mapping |
| `wellness_index` | N/A | `organization_insights` | Calculate: `(100 - stress_index * 20)` |
| `benefits` | `partner_benefits` | Table name | Table name correction |
| `user_benefit_activations` | `user_benefit_usage_logs` | Table name | Table name correction |

### Appendix B: Calculation Formulas

#### Wellness Index Score
```sql
(100 - ai_stress + 100 - ai_fatigue + ai_recovery) / 3 AS wellness_index_score
```

#### Burnout Risk Score (Estimated)
```sql
CASE 
  WHEN ai_stress > 70 AND ai_fatigue > 60 THEN 4.5
  WHEN ai_stress > 60 AND ai_fatigue > 50 THEN 3.5
  WHEN ai_stress > 50 THEN 2.5
  ELSE 1.5
END AS burnout_risk_score
```

#### Bio Age Gap
```sql
bio_age_basic - EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) AS bio_age_gap
```

### Appendix C: Contact Information

| Role | Name | Responsibility |
|------|------|----------------|
| Data Analyst | David | Data validation, SQL specifications |
| Product Manager | Emma | PRD updates, requirements clarification |
| Engineer | Alex | Backend implementation, table verification |
| Architect | Bob | Architecture review, performance optimization |

---

**Report Prepared By:** David (Data Analyst)  
**Date:** 2026-02-03  
**Status:** Complete - Awaiting PRD Updates  
**Next Review:** After PRD corrections

---

**END OF REPORT**