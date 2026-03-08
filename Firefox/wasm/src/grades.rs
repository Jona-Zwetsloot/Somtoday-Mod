//! Grade calculation functions
//! 
//! This module provides all grade-related calculations including averages,
//! GPA conversion, subject analysis, and comprehensive grade analytics.

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::{Grade, GpaScale, SubjectSummary, AnalyticsResult, Statistics, TrendResult, PredictionResult};
use crate::statistics;
use crate::predictions;

/// Pass/fail statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PassFailStats {
    pub total: usize,
    pub passing: usize,
    pub failing: usize,
    pub pass_rate: f64,
    pub fail_rate: f64,
    pub average_passing: f64,
    pub average_failing: f64,
}

/// Calculate simple (unweighted) average of grades
pub fn calculate_simple_average(grades: &[Grade]) -> f64 {
    if grades.is_empty() {
        return 0.0;
    }
    
    let sum: f64 = grades.iter().map(|g| g.value).sum();
    sum / grades.len() as f64
}

/// Calculate weighted average of grades
pub fn calculate_weighted_average(grades: &[Grade]) -> f64 {
    if grades.is_empty() {
        return 0.0;
    }
    
    let total_weight: f64 = grades.iter().map(|g| g.weight).sum();
    if total_weight == 0.0 {
        return calculate_simple_average(grades);
    }
    
    let weighted_sum: f64 = grades.iter().map(|g| g.value * g.weight).sum();
    weighted_sum / total_weight
}

/// Calculate GPA from grades using the specified scale
pub fn calculate_gpa(grades: &[Grade], scale: &GpaScale) -> f64 {
    if grades.is_empty() {
        return 0.0;
    }
    
    let weighted_avg = calculate_weighted_average(grades);
    
    // Convert Dutch 1-10 scale to GPA scale
    // Formula: GPA = (grade - 1) / (max - 1) * gpa_max
    let normalized = (weighted_avg - 1.0) / (scale.max_grade - 1.0);
    (normalized * scale.gpa_max).clamp(0.0, scale.gpa_max)
}

/// Calculate average for a specific subject
pub fn calculate_subject_average(grades: &[Grade], subject: &str) -> f64 {
    let subject_grades: Vec<&Grade> = grades
        .iter()
        .filter(|g| g.subject.to_lowercase() == subject.to_lowercase())
        .collect();
    
    if subject_grades.is_empty() {
        return 0.0;
    }
    
    let total_weight: f64 = subject_grades.iter().map(|g| g.weight).sum();
    if total_weight == 0.0 {
        let sum: f64 = subject_grades.iter().map(|g| g.value).sum();
        return sum / subject_grades.len() as f64;
    }
    
    let weighted_sum: f64 = subject_grades.iter().map(|g| g.value * g.weight).sum();
    weighted_sum / total_weight
}

/// Get comprehensive summary for a subject
pub fn get_subject_summary(grades: &[Grade], subject: &str) -> SubjectSummary {
    let subject_grades: Vec<&Grade> = grades
        .iter()
        .filter(|g| g.subject.to_lowercase() == subject.to_lowercase())
        .collect();
    
    if subject_grades.is_empty() {
        return SubjectSummary {
            subject: subject.to_string(),
            average: 0.0,
            weighted_average: 0.0,
            grade_count: 0,
            total_weight: 0.0,
            highest: 0.0,
            lowest: 0.0,
            passing_count: 0,
            failing_count: 0,
            trend: 0.0,
            predicted_next: 0.0,
        };
    }
    
    let values: Vec<f64> = subject_grades.iter().map(|g| g.value).collect();
    let weights: Vec<f64> = subject_grades.iter().map(|g| g.weight).collect();
    
    let average = values.iter().sum::<f64>() / values.len() as f64;
    let total_weight: f64 = weights.iter().sum();
    
    let weighted_average = if total_weight > 0.0 {
        subject_grades.iter().map(|g| g.value * g.weight).sum::<f64>() / total_weight
    } else {
        average
    };
    
    let highest = values.iter().cloned().fold(f64::NEG_INFINITY, f64::max);
    let lowest = values.iter().cloned().fold(f64::INFINITY, f64::min);
    
    let passing_count = subject_grades.iter().filter(|g| g.is_passing).count();
    let failing_count = subject_grades.len() - passing_count;
    
    // Calculate trend if we have time series data
    let mut time_series: Vec<(i64, f64)> = subject_grades
        .iter()
        .map(|g| (g.timestamp, g.value))
        .collect();
    time_series.sort_by_key(|(t, _)| *t);
    
    let trend = if time_series.len() >= 2 {
        let trend_result = statistics::calculate_trend(&time_series);
        trend_result.slope
    } else {
        0.0
    };
    
    // Predict next grade
    let subject_grades_vec: Vec<Grade> = subject_grades.iter().map(|g| (*g).clone()).collect();
    let prediction = predictions::predict_next_grade(&subject_grades_vec);
    
    SubjectSummary {
        subject: subject.to_string(),
        average,
        weighted_average,
        grade_count: subject_grades.len(),
        total_weight,
        highest,
        lowest,
        passing_count,
        failing_count,
        trend,
        predicted_next: prediction.predicted_value,
    }
}

/// Get summaries for all subjects
pub fn get_all_subject_summaries(grades: &[Grade]) -> Vec<SubjectSummary> {
    let mut subjects: HashMap<String, Vec<&Grade>> = HashMap::new();
    
    for grade in grades {
        subjects
            .entry(grade.subject.to_lowercase())
            .or_default()
            .push(grade);
    }
    
    let mut summaries: Vec<SubjectSummary> = subjects
        .keys()
        .map(|subject| get_subject_summary(grades, subject))
        .collect();
    
    // Sort by subject name
    summaries.sort_by(|a, b| a.subject.cmp(&b.subject));
    
    summaries
}

/// Calculate pass/fail statistics
pub fn calculate_pass_fail_stats(grades: &[Grade]) -> PassFailStats {
    if grades.is_empty() {
        return PassFailStats {
            total: 0,
            passing: 0,
            failing: 0,
            pass_rate: 0.0,
            fail_rate: 0.0,
            average_passing: 0.0,
            average_failing: 0.0,
        };
    }
    
    let passing: Vec<&Grade> = grades.iter().filter(|g| g.is_passing).collect();
    let failing: Vec<&Grade> = grades.iter().filter(|g| !g.is_passing).collect();
    
    let total = grades.len();
    let passing_count = passing.len();
    let failing_count = failing.len();
    
    let pass_rate = (passing_count as f64 / total as f64) * 100.0;
    let fail_rate = (failing_count as f64 / total as f64) * 100.0;
    
    let average_passing = if passing.is_empty() {
        0.0
    } else {
        passing.iter().map(|g| g.value).sum::<f64>() / passing.len() as f64
    };
    
    let average_failing = if failing.is_empty() {
        0.0
    } else {
        failing.iter().map(|g| g.value).sum::<f64>() / failing.len() as f64
    };
    
    PassFailStats {
        total,
        passing: passing_count,
        failing: failing_count,
        pass_rate,
        fail_rate,
        average_passing,
        average_failing,
    }
}

/// Perform comprehensive analysis on all grades
pub fn analyze_all(grades: &[Grade]) -> AnalyticsResult {
    if grades.is_empty() {
        return AnalyticsResult {
            overall_average: 0.0,
            weighted_average: 0.0,
            gpa: 0.0,
            total_grades: 0,
            passing_grades: 0,
            failing_grades: 0,
            pass_rate: 0.0,
            subjects: vec![],
            statistics: Statistics {
                count: 0,
                sum: 0.0,
                mean: 0.0,
                median: 0.0,
                mode: vec![],
                min: 0.0,
                max: 0.0,
                range: 0.0,
                variance: 0.0,
                std_deviation: 0.0,
                percentile_25: 0.0,
                percentile_50: 0.0,
                percentile_75: 0.0,
                percentile_90: 0.0,
                iqr: 0.0,
                skewness: 0.0,
                kurtosis: 0.0,
            },
            trend: TrendResult {
                slope: 0.0,
                intercept: 0.0,
                r_squared: 0.0,
                direction: "stable".to_string(),
                strength: "none".to_string(),
                predicted_values: vec![],
            },
            predictions: vec![],
        };
    }
    
    let overall_average = calculate_simple_average(grades);
    let weighted_average = calculate_weighted_average(grades);
    let gpa = calculate_gpa(grades, &GpaScale::default());
    
    let pass_fail = calculate_pass_fail_stats(grades);
    let subjects = get_all_subject_summaries(grades);
    
    // Calculate statistics on grade values
    let values: Vec<f64> = grades.iter().map(|g| g.value).collect();
    let stats = statistics::calculate_statistics(&values);
    
    // Calculate trend
    let mut time_series: Vec<(i64, f64)> = grades
        .iter()
        .map(|g| (g.timestamp, g.value))
        .collect();
    time_series.sort_by_key(|(t, _)| *t);
    let trend = statistics::calculate_trend(&time_series);
    
    // Generate predictions for each subject
    let predictions: Vec<PredictionResult> = subjects
        .iter()
        .map(|s| {
            let subject_grades: Vec<Grade> = grades
                .iter()
                .filter(|g| g.subject.to_lowercase() == s.subject.to_lowercase())
                .cloned()
                .collect();
            predictions::predict_next_grade(&subject_grades)
        })
        .collect();
    
    AnalyticsResult {
        overall_average,
        weighted_average,
        gpa,
        total_grades: grades.len(),
        passing_grades: pass_fail.passing,
        failing_grades: pass_fail.failing,
        pass_rate: pass_fail.pass_rate,
        subjects,
        statistics: stats,
        trend,
        predictions,
    }
}

/// Calculate the running average over time
pub fn calculate_running_average(grades: &[Grade]) -> Vec<(i64, f64)> {
    let mut sorted_grades = grades.to_vec();
    sorted_grades.sort_by_key(|g| g.timestamp);
    
    let mut running_sum = 0.0;
    let mut running_weight = 0.0;
    let mut result = Vec::new();
    
    for grade in sorted_grades {
        running_sum += grade.value * grade.weight;
        running_weight += grade.weight;
        let running_avg = if running_weight > 0.0 {
            running_sum / running_weight
        } else {
            grade.value
        };
        result.push((grade.timestamp, running_avg));
    }
    
    result
}

/// Group grades by time period (month)
pub fn group_by_month(grades: &[Grade]) -> HashMap<String, Vec<Grade>> {
    let mut groups: HashMap<String, Vec<Grade>> = HashMap::new();
    
    for grade in grades {
        // Convert timestamp to month key (YYYY-MM)
        let timestamp_secs = grade.timestamp / 1000; // Convert from milliseconds
        let date = chrono_lite_month_key(timestamp_secs);
        
        groups
            .entry(date)
            .or_default()
            .push(grade.clone());
    }
    
    groups
}

/// Simple month key extraction without full chrono dependency
fn chrono_lite_month_key(timestamp_secs: i64) -> String {
    // Simple calculation for YYYY-MM format
    // This is an approximation - for production use chrono crate
    let days_since_epoch = timestamp_secs / 86400;
    let years = days_since_epoch / 365;
    let year = 1970 + years;
    let day_of_year = days_since_epoch % 365;
    let month = (day_of_year / 30) + 1;
    format!("{:04}-{:02}", year, month.min(12))
}

/// Calculate grade distribution (histogram)
pub fn calculate_distribution(grades: &[Grade]) -> HashMap<String, usize> {
    let mut distribution: HashMap<String, usize> = HashMap::new();
    
    // Initialize buckets
    for i in 1..=10 {
        distribution.insert(i.to_string(), 0);
    }
    
    for grade in grades {
        let bucket = grade.value.floor() as i32;
        let bucket = bucket.clamp(1, 10);
        *distribution.entry(bucket.to_string()).or_default() += 1;
    }
    
    distribution
}

/// Find best and worst subjects
pub fn find_extreme_subjects(grades: &[Grade]) -> (Option<SubjectSummary>, Option<SubjectSummary>) {
    let summaries = get_all_subject_summaries(grades);
    
    if summaries.is_empty() {
        return (None, None);
    }
    
    let best = summaries
        .iter()
        .max_by(|a, b| a.weighted_average.partial_cmp(&b.weighted_average).unwrap())
        .cloned();
    
    let worst = summaries
        .iter()
        .min_by(|a, b| a.weighted_average.partial_cmp(&b.weighted_average).unwrap())
        .cloned();
    
    (best, worst)
}

/// Calculate improvement since start of period
pub fn calculate_improvement(grades: &[Grade]) -> f64 {
    if grades.len() < 2 {
        return 0.0;
    }
    
    let mut sorted = grades.to_vec();
    sorted.sort_by_key(|g| g.timestamp);
    
    // Compare first quarter average to last quarter average
    let quarter_size = (sorted.len() / 4).max(1);
    
    let first_quarter: Vec<f64> = sorted[..quarter_size].iter().map(|g| g.value).collect();
    let last_quarter: Vec<f64> = sorted[sorted.len() - quarter_size..].iter().map(|g| g.value).collect();
    
    let first_avg = first_quarter.iter().sum::<f64>() / first_quarter.len() as f64;
    let last_avg = last_quarter.iter().sum::<f64>() / last_quarter.len() as f64;
    
    last_avg - first_avg
}

/// Get grades that need attention (failing or close to failing)
pub fn get_attention_needed(grades: &[Grade]) -> Vec<SubjectSummary> {
    let summaries = get_all_subject_summaries(grades);
    
    summaries
        .into_iter()
        .filter(|s| s.weighted_average < 6.0 || s.trend < -0.1)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_grades() -> Vec<Grade> {
        vec![
            Grade::new(8.0, 1.0, "Math".to_string(), "Test 1".to_string(), 1000),
            Grade::new(7.0, 2.0, "Math".to_string(), "Test 2".to_string(), 2000),
            Grade::new(6.0, 1.0, "English".to_string(), "Test 1".to_string(), 1500),
            Grade::new(9.0, 1.0, "English".to_string(), "Test 2".to_string(), 2500),
        ]
    }

    #[test]
    fn test_simple_average() {
        let grades = create_test_grades();
        let avg = calculate_simple_average(&grades);
        assert!((avg - 7.5).abs() < 0.01);
    }

    #[test]
    fn test_weighted_average() {
        let grades = create_test_grades();
        let avg = calculate_weighted_average(&grades);
        // (8*1 + 7*2 + 6*1 + 9*1) / (1+2+1+1) = 37/5 = 7.4
        assert!((avg - 7.4).abs() < 0.01);
    }

    #[test]
    fn test_subject_average() {
        let grades = create_test_grades();
        let math_avg = calculate_subject_average(&grades, "Math");
        // Math: (8*1 + 7*2) / 3 = 22/3 = 7.33...
        assert!((math_avg - 7.333).abs() < 0.01);
    }

    #[test]
    fn test_pass_fail_stats() {
        let grades = create_test_grades();
        let stats = calculate_pass_fail_stats(&grades);
        assert_eq!(stats.total, 4);
        assert_eq!(stats.passing, 4);
        assert_eq!(stats.failing, 0);
    }
}
