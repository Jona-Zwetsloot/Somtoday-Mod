//! Somtoday Analytics WASM Module
//! 
//! High-performance grade calculations, statistics, and predictions
//! compiled to WebAssembly for use in the Somtoday Mod browser extension.

mod grades;
mod statistics;
mod predictions;

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

// Initialize panic hook for better error messages in browser console
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

// ============================================================================
// Data Types
// ============================================================================

/// Represents a single grade entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Grade {
    pub value: f64,
    pub weight: f64,
    pub subject: String,
    pub description: String,
    pub timestamp: i64,
    pub is_passing: bool,
}

impl Grade {
    pub fn new(value: f64, weight: f64, subject: String, description: String, timestamp: i64) -> Self {
        Self {
            value,
            weight,
            subject,
            description,
            timestamp,
            is_passing: value >= 5.5,
        }
    }
}

/// Subject summary with aggregated statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubjectSummary {
    pub subject: String,
    pub average: f64,
    pub weighted_average: f64,
    pub grade_count: usize,
    pub total_weight: f64,
    pub highest: f64,
    pub lowest: f64,
    pub passing_count: usize,
    pub failing_count: usize,
    pub trend: f64,
    pub predicted_next: f64,
}

/// Complete statistics result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Statistics {
    pub count: usize,
    pub sum: f64,
    pub mean: f64,
    pub median: f64,
    pub mode: Vec<f64>,
    pub min: f64,
    pub max: f64,
    pub range: f64,
    pub variance: f64,
    pub std_deviation: f64,
    pub percentile_25: f64,
    pub percentile_50: f64,
    pub percentile_75: f64,
    pub percentile_90: f64,
    pub iqr: f64,
    pub skewness: f64,
    pub kurtosis: f64,
}

/// Trend analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrendResult {
    pub slope: f64,
    pub intercept: f64,
    pub r_squared: f64,
    pub direction: String,
    pub strength: String,
    pub predicted_values: Vec<f64>,
}

/// Prediction result with confidence intervals
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictionResult {
    pub predicted_value: f64,
    pub confidence: f64,
    pub lower_bound: f64,
    pub upper_bound: f64,
    pub method: String,
}

/// What-if scenario result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WhatIfResult {
    pub current_average: f64,
    pub new_average: f64,
    pub change: f64,
    pub change_percent: f64,
    pub grades_needed_for_target: Vec<GradeNeeded>,
    pub impact_analysis: Vec<ImpactEntry>,
}

/// Grade needed to reach a target
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GradeNeeded {
    pub target_average: f64,
    pub grade_needed: f64,
    pub weight: f64,
    pub achievable: bool,
}

/// Impact analysis entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImpactEntry {
    pub hypothetical_grade: f64,
    pub resulting_average: f64,
    pub impact: f64,
}

/// GPA scale configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpaScale {
    pub max_grade: f64,
    pub passing_grade: f64,
    pub gpa_max: f64,
}

impl Default for GpaScale {
    fn default() -> Self {
        Self {
            max_grade: 10.0,
            passing_grade: 5.5,
            gpa_max: 4.0,
        }
    }
}

/// Overall analytics result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyticsResult {
    pub overall_average: f64,
    pub weighted_average: f64,
    pub gpa: f64,
    pub total_grades: usize,
    pub passing_grades: usize,
    pub failing_grades: usize,
    pub pass_rate: f64,
    pub subjects: Vec<SubjectSummary>,
    pub statistics: Statistics,
    pub trend: TrendResult,
    pub predictions: Vec<PredictionResult>,
}

// ============================================================================
// WASM Exports - Core Grade Functions
// ============================================================================

/// Calculate the simple average of grades
#[wasm_bindgen]
pub fn calculate_average(grades_json: &str) -> Result<f64, JsValue> {
    let grades: Vec<Grade> = serde_json::from_str(grades_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse grades: {}", e)))?;
    
    Ok(grades::calculate_simple_average(&grades))
}

/// Calculate weighted average of grades
#[wasm_bindgen]
pub fn calculate_weighted_average(grades_json: &str) -> Result<f64, JsValue> {
    let grades: Vec<Grade> = serde_json::from_str(grades_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse grades: {}", e)))?;
    
    Ok(grades::calculate_weighted_average(&grades))
}

/// Calculate GPA from grades
#[wasm_bindgen]
pub fn calculate_gpa(grades_json: &str, scale_json: &str) -> Result<f64, JsValue> {
    let grades: Vec<Grade> = serde_json::from_str(grades_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse grades: {}", e)))?;
    
    let scale: GpaScale = if scale_json.is_empty() {
        GpaScale::default()
    } else {
        serde_json::from_str(scale_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse scale: {}", e)))?
    };
    
    Ok(grades::calculate_gpa(&grades, &scale))
}

/// Calculate average for a specific subject
#[wasm_bindgen]
pub fn calculate_subject_average(grades_json: &str, subject: &str) -> Result<f64, JsValue> {
    let grades: Vec<Grade> = serde_json::from_str(grades_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse grades: {}", e)))?;
    
    Ok(grades::calculate_subject_average(&grades, subject))
}

/// Get subject summary with all statistics
#[wasm_bindgen]
pub fn get_subject_summary(grades_json: &str, subject: &str) -> Result<String, JsValue> {
    let grades: Vec<Grade> = serde_json::from_str(grades_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse grades: {}", e)))?;
    
    let summary = grades::get_subject_summary(&grades, subject);
    
    serde_json::to_string(&summary)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize summary: {}", e)))
}

/// Get all subjects with their summaries
#[wasm_bindgen]
pub fn get_all_subjects(grades_json: &str) -> Result<String, JsValue> {
    let grades: Vec<Grade> = serde_json::from_str(grades_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse grades: {}", e)))?;
    
    let subjects = grades::get_all_subject_summaries(&grades);
    
    serde_json::to_string(&subjects)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize subjects: {}", e)))
}

/// Calculate pass/fail statistics
#[wasm_bindgen]
pub fn calculate_pass_fail_stats(grades_json: &str) -> Result<String, JsValue> {
    let grades: Vec<Grade> = serde_json::from_str(grades_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse grades: {}", e)))?;
    
    let stats = grades::calculate_pass_fail_stats(&grades);
    
    serde_json::to_string(&stats)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize stats: {}", e)))
}

/// Perform complete analytics on all grades
#[wasm_bindgen]
pub fn analyze_all_grades(grades_json: &str) -> Result<String, JsValue> {
    let grades: Vec<Grade> = serde_json::from_str(grades_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse grades: {}", e)))?;
    
    let result = grades::analyze_all(&grades);
    
    serde_json::to_string(&result)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize result: {}", e)))
}

// ============================================================================
// WASM Exports - Statistics Functions
// ============================================================================

/// Calculate comprehensive statistics for a data set
#[wasm_bindgen]
pub fn calculate_statistics(data_json: &str) -> Result<String, JsValue> {
    let data: Vec<f64> = serde_json::from_str(data_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse data: {}", e)))?;
    
    let stats = statistics::calculate_statistics(&data);
    
    serde_json::to_string(&stats)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize statistics: {}", e)))
}

/// Calculate a specific percentile
#[wasm_bindgen]
pub fn calculate_percentile(data_json: &str, percentile: f64) -> Result<f64, JsValue> {
    let data: Vec<f64> = serde_json::from_str(data_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse data: {}", e)))?;
    
    Ok(statistics::calculate_percentile(&data, percentile))
}

/// Calculate trend from time series data
#[wasm_bindgen]
pub fn calculate_trend(data_json: &str) -> Result<String, JsValue> {
    let data: Vec<(i64, f64)> = serde_json::from_str(data_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse data: {}", e)))?;
    
    let trend = statistics::calculate_trend(&data);
    
    serde_json::to_string(&trend)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize trend: {}", e)))
}

/// Calculate correlation between two data sets
#[wasm_bindgen]
pub fn calculate_correlation(data1_json: &str, data2_json: &str) -> Result<f64, JsValue> {
    let data1: Vec<f64> = serde_json::from_str(data1_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse data1: {}", e)))?;
    let data2: Vec<f64> = serde_json::from_str(data2_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse data2: {}", e)))?;
    
    Ok(statistics::calculate_correlation(&data1, &data2))
}

// ============================================================================
// WASM Exports - Prediction Functions
// ============================================================================

/// Predict the grade needed to achieve a target average
#[wasm_bindgen]
pub fn predict_grade_needed(
    current_average: f64,
    current_total_weight: f64,
    target_average: f64,
    new_grade_weight: f64
) -> Result<f64, JsValue> {
    Ok(predictions::predict_grade_needed(
        current_average,
        current_total_weight,
        target_average,
        new_grade_weight
    ))
}

/// Predict next grade based on history
#[wasm_bindgen]
pub fn predict_next_grade(grades_json: &str) -> Result<String, JsValue> {
    let grades: Vec<Grade> = serde_json::from_str(grades_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse grades: {}", e)))?;
    
    let prediction = predictions::predict_next_grade(&grades);
    
    serde_json::to_string(&prediction)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize prediction: {}", e)))
}

/// Calculate what-if scenario
#[wasm_bindgen]
pub fn calculate_whatif(grades_json: &str, hypothetical_json: &str) -> Result<String, JsValue> {
    let grades: Vec<Grade> = serde_json::from_str(grades_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse grades: {}", e)))?;
    let hypothetical: Vec<Grade> = serde_json::from_str(hypothetical_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse hypothetical grades: {}", e)))?;
    
    let result = predictions::calculate_whatif(&grades, &hypothetical);
    
    serde_json::to_string(&result)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize result: {}", e)))
}

/// Generate impact analysis for different grade scenarios
#[wasm_bindgen]
pub fn generate_impact_analysis(
    grades_json: &str,
    subject: &str,
    weight: f64
) -> Result<String, JsValue> {
    let grades: Vec<Grade> = serde_json::from_str(grades_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse grades: {}", e)))?;
    
    let analysis = predictions::generate_impact_analysis(&grades, subject, weight);
    
    serde_json::to_string(&analysis)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize analysis: {}", e)))
}

/// Calculate grades needed to reach various targets
#[wasm_bindgen]
pub fn calculate_grades_for_targets(
    grades_json: &str,
    subject: &str,
    weight: f64,
    targets_json: &str
) -> Result<String, JsValue> {
    let grades: Vec<Grade> = serde_json::from_str(grades_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse grades: {}", e)))?;
    let targets: Vec<f64> = serde_json::from_str(targets_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse targets: {}", e)))?;
    
    let results = predictions::calculate_grades_for_targets(&grades, subject, weight, &targets);
    
    serde_json::to_string(&results)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize results: {}", e)))
}

// ============================================================================
// WASM Exports - Utility Functions
// ============================================================================

/// Validate a grade value
#[wasm_bindgen]
pub fn validate_grade(value: f64) -> bool {
    value >= 1.0 && value <= 10.0
}

/// Format a grade for display (Dutch format with comma)
#[wasm_bindgen]
pub fn format_grade(value: f64, decimals: u32) -> String {
    let formatted = format!("{:.1$}", value, decimals as usize);
    formatted.replace('.', ",")
}

/// Parse a Dutch-formatted grade string
#[wasm_bindgen]
pub fn parse_grade(grade_str: &str) -> Result<f64, JsValue> {
    let normalized = grade_str.replace(',', ".");
    normalized.parse::<f64>()
        .map_err(|e| JsValue::from_str(&format!("Failed to parse grade: {}", e)))
}

/// Get version information
#[wasm_bindgen]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Check if WASM module is loaded correctly
#[wasm_bindgen]
pub fn health_check() -> bool {
    true
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_grade_creation() {
        let grade = Grade::new(8.5, 1.0, "Math".to_string(), "Test 1".to_string(), 1234567890);
        assert!(grade.is_passing);
        assert_eq!(grade.value, 8.5);
    }

    #[test]
    fn test_validate_grade() {
        assert!(validate_grade(5.5));
        assert!(validate_grade(10.0));
        assert!(validate_grade(1.0));
        assert!(!validate_grade(0.5));
        assert!(!validate_grade(10.5));
    }

    #[test]
    fn test_format_grade() {
        assert_eq!(format_grade(8.5, 1), "8,5");
        assert_eq!(format_grade(7.25, 2), "7,25");
    }
}
