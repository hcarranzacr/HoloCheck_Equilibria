-- Create param_biometric_indicators_info table
-- This table stores metadata and risk ranges for biometric indicators

CREATE TABLE IF NOT EXISTS param_biometric_indicators_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_code VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    indicator_name VARCHAR(255),
    unit VARCHAR(50),
    min_value NUMERIC,
    max_value NUMERIC,
    description TEXT,
    interpretation TEXT,
    influencing_factors TEXT,
    tips TEXT,
    risk_ranges JSONB,
    is_clinical BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on indicator_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_biometric_indicator_code ON param_biometric_indicators_info(indicator_code);

-- Insert default biometric indicators
INSERT INTO param_biometric_indicators_info (
    indicator_code, 
    display_name, 
    indicator_name,
    unit, 
    min_value, 
    max_value, 
    description,
    risk_ranges,
    is_clinical
) VALUES 
(
    'heart_rate',
    'Heart Rate',
    'Heart Rate',
    'bpm',
    40,
    200,
    'Resting heart rate measurement',
    '{"baja": [40, 59], "normal": [60, 100], "alta": [101, 140]}'::jsonb,
    false
),
(
    'bmi',
    'BMI',
    'Body Mass Index',
    'kg/m²',
    10,
    50,
    'Body Mass Index calculation',
    '{"bajo_peso": [0, 18.4], "normal": [18.5, 24.9], "sobrepeso": [25.0, 29.9], "obesidad": [30.0, 100]}'::jsonb,
    false
),
(
    'sdnn',
    'SDNN',
    'Standard Deviation of NN Intervals',
    'ms',
    0,
    200,
    'Heart rate variability metric',
    '{"baja": [0, 49], "normal": [50, 100], "alta": [101, 200]}'::jsonb,
    false
),
(
    'rmssd',
    'RMSSD',
    'Root Mean Square of Successive Differences',
    'ms',
    0,
    200,
    'Heart rate variability metric',
    '{"baja": [0, 29], "normal": [30, 80], "alta": [81, 200]}'::jsonb,
    false
),
(
    'vital_index_score',
    'Vital Index Score',
    'Vital Index Score',
    'points',
    0,
    100,
    'Overall vital signs score',
    '{"bajo": [0, 59], "normal": [60, 79], "alto": [80, 100]}'::jsonb,
    false
),
(
    'mental_stress_index',
    'Mental Stress Index',
    'Mental Stress Index',
    'points',
    0,
    100,
    'Mental stress level indicator',
    '{"bajo": [0, 39], "normal": [40, 69], "alto": [70, 100]}'::jsonb,
    false
),
(
    'body_shape_index',
    'Body Shape Index',
    'Body Shape Index',
    'index',
    0,
    10,
    'Body composition indicator',
    '{"bajo": [0, 3.9], "normal": [4.0, 6.9], "alto": [7.0, 10]}'::jsonb,
    false
),
(
    'physical_score',
    'Physical Score',
    'Physical Score',
    'points',
    0,
    100,
    'Physical fitness score',
    '{"bajo": [0, 59], "normal": [60, 79], "alto": [80, 100]}'::jsonb,
    false
),
(
    'mental_score',
    'Mental Score',
    'Mental Score',
    'points',
    0,
    100,
    'Mental health score',
    '{"bajo": [0, 59], "normal": [60, 79], "alto": [80, 100]}'::jsonb,
    false
),
(
    'waist_height_ratio',
    'Waist-Height Ratio',
    'Waist-Height Ratio',
    'ratio',
    0,
    1,
    'Waist to height ratio',
    '{"bajo": [0, 0.49], "normal": [0.5, 0.59], "alto": [0.6, 1]}'::jsonb,
    false
),
(
    'global_health_score',
    'Global Health Score',
    'Global Health Score',
    'points',
    0,
    100,
    'Overall health score',
    '{"bajo": [0, 59], "normal": [60, 79], "alto": [80, 100]}'::jsonb,
    false
),
(
    'physiological_score',
    'Physiological Score',
    'Physiological Score',
    'points',
    0,
    100,
    'Physiological health score',
    '{"bajo": [0, 59], "normal": [60, 79], "alto": [80, 100]}'::jsonb,
    false
)
ON CONFLICT (indicator_code) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_param_biometric_indicators_info_updated_at
    BEFORE UPDATE ON param_biometric_indicators_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();