//! Prediction Engine
//! 
//! Grade prediction, what-if analysis, and forecasting functions
//! using various statistical methods including linear regression,
//! exponential smoothing, and machine learning-inspired approaches.

use crate::{Grade, PredictionResult, WhatIfResult, GradeNeeded, ImpactEntry};
use crate::statistics;

/// Predict the grade needed to achieve a target average
pub fn predict_grade_needed(
    current_average: f64,
    current_total_weight: f64,
    target_average: f64,
    new_grade_weight: f64,
) -> f64 {
    if new_grade_weight <= 0.0 {
        return f64::NAN;
    }
    
    // Formula: target = (current_avg * current_weight + new_grade * new_weight) / (current_weight + new_weight)
    // Solving for new_grade:
    // new_grade = (target * (current_weight + new_weight) - current_avg * current_weight) / new_weight
    
    let total_weight = current_total_weight + new_grade_weight;
    let grade_needed = (target_average * total_weight - current_average * current_total_weight) / new_grade_weight;
    
    grade_needed
}

/// Predict the next grade based on historical data
pub fn predict_next_grade(grades: &[Grade]) -> PredictionResult {
    if grades.is_empty() {
        return PredictionResult {
            predicted_value: 0.0,
            confidence: 0.0,
            lower_bound: 0.0,
            upper_bound: 0.0,
            method: "none".to_string(),
        };
    }
    
    if grades.len() == 1 {
        return PredictionResult {
            predicted_value: grades[0].value,
            confidence: 0.2,
            lower_bound: (grades[0].value - 1.0).max(1.0),
            upper_bound: (grades[0].value + 1.0).min(10.0),
            method: "single_value".to_string(),
        };
    }
    
    // Sort grades by timestamp
    let mut sorted_grades = grades.to_vec();
    sorted_grades.sort_by_key(|g| g.timestamp);
    
    // Try multiple prediction methods and combine results
    let trend_prediction = predict_from_trend(&sorted_grades);
    let ema_prediction = predict_from_ema(&sorted_grades);
    let regression_prediction = predict_from_regression(&sorted_grades);
    
    // Weight the predictions based on data characteristics
    let trend_weight = if sorted_grades.len() >= 5 { 0.4 } else { 0.2 };
    let ema_weight = 0.3;
    let regression_weight = 1.0 - trend_weight - ema_weight;
    
    let combined_prediction = 
        trend_prediction.predicted_value * trend_weight +
        ema_prediction.predicted_value * ema_weight +
        regression_prediction.predicted_value * regression_weight;
    
    // Calculate combined confidence
    let avg_confidence = (trend_prediction.confidence + ema_prediction.confidence + regression_prediction.confidence) / 3.0;
    
    // Calculate bounds based on historical variance
    let values: Vec<f64> = sorted_grades.iter().map(|g| g.value).collect();
    let std_dev = statistics::calculate_std_deviation(&values);
    
    let lower_bound = (combined_prediction - 2.0 * std_dev).max(1.0);
    let upper_bound = (combined_prediction + 2.0 * std_dev).min(10.0);
    
    PredictionResult {
        predicted_value: combined_prediction.clamp(1.0, 10.0),
        confidence: avg_confidence,
        lower_bound,
        upper_bound,
        method: "ensemble".to_string(),
    }
}

/// Predict using linear trend
fn predict_from_trend(grades: &[Grade]) -> PredictionResult {
    let time_series: Vec<(i64, f64)> = grades
        .iter()
        .map(|g| (g.timestamp, g.value))
        .collect();
    
    let trend = statistics::calculate_trend(&time_series);
    
    // Predict next value based on trend
    let last_time = grades.last().map(|g| g.timestamp).unwrap_or(0);
    let avg_interval = if grades.len() > 1 {
        let first_time = grades.first().map(|g| g.timestamp).unwrap_or(0);
        (last_time - first_time) / (grades.len() - 1) as i64
    } else {
        86400000 // Default 1 day in milliseconds
    };
    
    let next_time = (last_time - grades.first().map(|g| g.timestamp).unwrap_or(0)) as f64 + avg_interval as f64;
    let predicted_value = trend.slope * next_time + trend.intercept;
    
    PredictionResult {
        predicted_value: predicted_value.clamp(1.0, 10.0),
        confidence: trend.r_squared,
        lower_bound: (predicted_value - 1.5).max(1.0),
        upper_bound: (predicted_value + 1.5).min(10.0),
        method: "trend".to_string(),
    }
}

/// Predict using exponential moving average
fn predict_from_ema(grades: &[Grade]) -> PredictionResult {
    let values: Vec<f64> = grades.iter().map(|g| g.value).collect();
    
    // Use alpha = 0.3 for EMA (more weight on recent values)
    let ema = statistics::calculate_ema(&values, 0.3);
    let predicted_value = ema.last().copied().unwrap_or(0.0);
    
    // Confidence based on how consistent the EMA has been
    let ema_variance = if ema.len() > 1 {
        let ema_mean = ema.iter().sum::<f64>() / ema.len() as f64;
        ema.iter().map(|x| (x - ema_mean).powi(2)).sum::<f64>() / (ema.len() - 1) as f64
    } else {
        1.0
    };
    let confidence = (1.0 / (1.0 + ema_variance.sqrt())).clamp(0.1, 0.9);
    
    PredictionResult {
        predicted_value: predicted_value.clamp(1.0, 10.0),
        confidence,
        lower_bound: (predicted_value - 1.0).max(1.0),
        upper_bound: (predicted_value + 1.0).min(10.0),
        method: "ema".to_string(),
    }
}

/// Predict using polynomial regression
fn predict_from_regression(grades: &[Grade]) -> PredictionResult {
    if grades.len() < 3 {
        let avg = grades.iter().map(|g| g.value).sum::<f64>() / grades.len() as f64;
        return PredictionResult {
            predicted_value: avg,
            confidence: 0.3,
            lower_bound: (avg - 1.5).max(1.0),
            upper_bound: (avg + 1.5).min(10.0),
            method: "simple_average".to_string(),
        };
    }
    
    // Use weighted recent average with exponential decay
    let n = grades.len();
    let mut weighted_sum = 0.0;
    let mut weight_total = 0.0;
    
    for (i, grade) in grades.iter().enumerate() {
        let weight = (i as f64 + 1.0).powi(2); // Quadratic weighting
        weighted_sum += grade.value * weight;
        weight_total += weight;
    }
    
    let predicted_value = weighted_sum / weight_total;
    
    // Calculate confidence based on consistency
    let values: Vec<f64> = grades.iter().map(|g| g.value).collect();
    let cv = statistics::calculate_cv(&values);
    let confidence = (100.0 - cv.min(100.0)) / 100.0;
    
    PredictionResult {
        predicted_value: predicted_value.clamp(1.0, 10.0),
        confidence: confidence.clamp(0.1, 0.9),
        lower_bound: (predicted_value - 1.5).max(1.0),
        upper_bound: (predicted_value + 1.5).min(10.0),
        method: "weighted_regression".to_string(),
    }
}

/// Calculate what-if scenario with hypothetical grades
pub fn calculate_whatif(grades: &[Grade], hypothetical: &[Grade]) -> WhatIfResult {
    if grades.is_empty() && hypothetical.is_empty() {
        return WhatIfResult {
            current_average: 0.0,
            new_average: 0.0,
            change: 0.0,
            change_percent: 0.0,
            grades_needed_for_target: vec![],
            impact_analysis: vec![],
        };
    }
    
    // Calculate current weighted average
    let current_total_weight: f64 = grades.iter().map(|g| g.weight).sum();
    let current_weighted_sum: f64 = grades.iter().map(|g| g.value * g.weight).sum();
    let current_average = if current_total_weight > 0.0 {
        current_weighted_sum / current_total_weight
    } else {
        0.0
    };
    
    // Calculate new average with hypothetical grades
    let hypothetical_weight: f64 = hypothetical.iter().map(|g| g.weight).sum();
    let hypothetical_sum: f64 = hypothetical.iter().map(|g| g.value * g.weight).sum();
    
    let new_total_weight = current_total_weight + hypothetical_weight;
    let new_average = if new_total_weight > 0.0 {
        (current_weighted_sum + hypothetical_sum) / new_total_weight
    } else {
        0.0
    };
    
    let change = new_average - current_average;
    let change_percent = if current_average > 0.0 {
        (change / current_average) * 100.0
    } else {
        0.0
    };
    
    // Calculate grades needed for common targets
    let targets = vec![5.5, 6.0, 6.5, 7.0, 7.5, 8.0];
    let default_weight = hypothetical.first().map(|g| g.weight).unwrap_or(1.0);
    
    let grades_needed_for_target: Vec<GradeNeeded> = targets
        .iter()
        .map(|&target| {
            let grade_needed = predict_grade_needed(new_average, new_total_weight, target, default_weight);
            GradeNeeded {
                target_average: target,
                grade_needed,
                weight: default_weight,
                achievable: grade_needed >= 1.0 && grade_needed <= 10.0,
            }
        })
        .collect();
    
    // Generate impact analysis for different potential grades
    let impact_analysis = generate_impact_entries(new_average, new_total_weight, default_weight);
    
    WhatIfResult {
        current_average,
        new_average,
        change,
        change_percent,
        grades_needed_for_target,
        impact_analysis,
    }
}

/// Generate impact analysis entries for different grade values
fn generate_impact_entries(current_avg: f64, current_weight: f64, new_weight: f64) -> Vec<ImpactEntry> {
    let grade_values: Vec<f64> = (10..=100).step_by(5).map(|x| x as f64 / 10.0).collect();
    
    grade_values
        .iter()
        .map(|&grade| {
            let new_total_weight = current_weight + new_weight;
            let resulting_average = (current_avg * current_weight + grade * new_weight) / new_total_weight;
            let impact = resulting_average - current_avg;
            
            ImpactEntry {
                hypothetical_grade: grade,
                resulting_average,
                impact,
            }
        })
        .collect()
}

/// Generate impact analysis for a specific subject
pub fn generate_impact_analysis(grades: &[Grade], subject: &str, weight: f64) -> Vec<ImpactEntry> {
    // Filter grades for the subject
    let subject_grades: Vec<&Grade> = grades
        .iter()
        .filter(|g| g.subject.to_lowercase() == subject.to_lowercase())
        .collect();
    
    if subject_grades.is_empty() {
        // No existing grades, impact is the grade itself
        return (10..=100)
            .step_by(5)
            .map(|x| {
                let grade = x as f64 / 10.0;
                ImpactEntry {
                    hypothetical_grade: grade,
                    resulting_average: grade,
                    impact: 0.0,
                }
            })
            .collect();
    }
    
    let current_weight: f64 = subject_grades.iter().map(|g| g.weight).sum();
    let current_sum: f64 = subject_grades.iter().map(|g| g.value * g.weight).sum();
    let current_avg = current_sum / current_weight;
    
    generate_impact_entries(current_avg, current_weight, weight)
}

/// Calculate grades needed to reach various targets
pub fn calculate_grades_for_targets(
    grades: &[Grade],
    subject: &str,
    weight: f64,
    targets: &[f64],
) -> Vec<GradeNeeded> {
    // Filter grades for the subject
    let subject_grades: Vec<&Grade> = grades
        .iter()
        .filter(|g| g.subject.to_lowercase() == subject.to_lowercase())
        .collect();
    
    if subject_grades.is_empty() {
        return targets
            .iter()
            .map(|&target| GradeNeeded {
                target_average: target,
                grade_needed: target, // Need exactly the target if no grades exist
                weight,
                achievable: target >= 1.0 && target <= 10.0,
            })
            .collect();
    }
    
    let current_weight: f64 = subject_grades.iter().map(|g| g.weight).sum();
    let current_sum: f64 = subject_grades.iter().map(|g| g.value * g.weight).sum();
    let current_avg = current_sum / current_weight;
    
    targets
        .iter()
        .map(|&target| {
            let grade_needed = predict_grade_needed(current_avg, current_weight, target, weight);
            GradeNeeded {
                target_average: target,
                grade_needed,
                weight,
                achievable: grade_needed >= 1.0 && grade_needed <= 10.0,
            }
        })
        .collect()
}

/// Predict final grade based on current performance and remaining assessments
pub fn predict_final_grade(
    current_grades: &[Grade],
    remaining_assessments: usize,
    typical_weight: f64,
) -> PredictionResult {
    if current_grades.is_empty() {
        return PredictionResult {
            predicted_value: 0.0,
            confidence: 0.0,
            lower_bound: 0.0,
            upper_bound: 0.0,
            method: "none".to_string(),
        };
    }
    
    let prediction = predict_next_grade(current_grades);
    let current_weight: f64 = current_grades.iter().map(|g| g.weight).sum();
    let current_sum: f64 = current_grades.iter().map(|g| g.value * g.weight).sum();
    
    // Assume future grades will be around the predicted value
    let future_weight = remaining_assessments as f64 * typical_weight;
    let future_sum = prediction.predicted_value * future_weight;
    
    let total_weight = current_weight + future_weight;
    let predicted_final = (current_sum + future_sum) / total_weight;
    
    // Adjust confidence based on how many assessments remain
    let confidence_adjustment = 1.0 / (1.0 + (remaining_assessments as f64 * 0.1));
    
    PredictionResult {
        predicted_value: predicted_final.clamp(1.0, 10.0),
        confidence: prediction.confidence * confidence_adjustment,
        lower_bound: (predicted_final - 1.0).max(1.0),
        upper_bound: (predicted_final + 1.0).min(10.0),
        method: "final_projection".to_string(),
    }
}

/// Calculate probability of passing based on current performance
pub fn calculate_pass_probability(grades: &[Grade], remaining_weight: f64) -> f64 {
    if grades.is_empty() {
        return 0.5; // Unknown
    }
    
    let current_weight: f64 = grades.iter().map(|g| g.weight).sum();
    let current_sum: f64 = grades.iter().map(|g| g.value * g.weight).sum();
    let current_avg = current_sum / current_weight;
    
    // Calculate minimum grade needed to pass (5.5 average)
    let total_weight = current_weight + remaining_weight;
    let min_needed = (5.5 * total_weight - current_sum) / remaining_weight;
    
    if min_needed <= 1.0 {
        return 1.0; // Already guaranteed to pass
    }
    if min_needed > 10.0 {
        return 0.0; // Impossible to pass
    }
    
    // Estimate probability based on how achievable the required grade is
    // Using a sigmoid function centered around the average
    let difficulty = (min_needed - current_avg) / 2.0;
    1.0 / (1.0 + difficulty.exp())
}

/// Suggest study priorities based on grade analysis
pub fn suggest_priorities(grades: &[Grade]) -> Vec<(String, f64, String)> {
    use std::collections::HashMap;
    
    // Group by subject
    let mut subject_data: HashMap<String, Vec<&Grade>> = HashMap::new();
    for grade in grades {
        subject_data
            .entry(grade.subject.to_lowercase())
            .or_default()
            .push(grade);
    }
    
    let mut priorities: Vec<(String, f64, String)> = subject_data
        .iter()
        .map(|(subject, subject_grades)| {
            let avg = subject_grades.iter().map(|g| g.value).sum::<f64>() / subject_grades.len() as f64;
            let priority_score = calculate_priority_score(avg, subject_grades);
            let reason = get_priority_reason(avg, subject_grades);
            (subject.clone(), priority_score, reason)
        })
        .collect();
    
    // Sort by priority (highest first)
    priorities.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
    
    priorities
}

/// Calculate priority score for a subject
fn calculate_priority_score(avg: f64, grades: &[&Grade]) -> f64 {
    let mut score = 0.0;
    
    // Lower average = higher priority
    score += (10.0 - avg) * 10.0;
    
    // Failing grades add to priority
    let failing_count = grades.iter().filter(|g| !g.is_passing).count();
    score += failing_count as f64 * 15.0;
    
    // Recent trend affects priority
    if grades.len() >= 3 {
        let recent: Vec<f64> = grades.iter().rev().take(3).map(|g| g.value).collect();
        let recent_avg = recent.iter().sum::<f64>() / recent.len() as f64;
        if recent_avg < avg {
            score += 10.0; // Declining trend
        }
    }
    
    score
}

/// Get reason for priority recommendation
fn get_priority_reason(avg: f64, grades: &[&Grade]) -> String {
    if avg < 5.5 {
        return "Failing average - immediate attention needed".to_string();
    }
    
    let failing_count = grades.iter().filter(|g| !g.is_passing).count();
    if failing_count > 0 {
        return format!("{} failing grade(s) affecting average", failing_count);
    }
    
    if avg < 6.5 {
        return "Below target average - room for improvement".to_string();
    }
    
    if grades.len() >= 3 {
        let recent: Vec<f64> = grades.iter().rev().take(3).map(|g| g.value).collect();
        let recent_avg = recent.iter().sum::<f64>() / recent.len() as f64;
        if recent_avg < avg - 0.5 {
            return "Recent decline detected".to_string();
        }
    }
    
    "Maintain current performance".to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_grades() -> Vec<Grade> {
        vec![
            Grade::new(7.0, 1.0, "Math".to_string(), "Test 1".to_string(), 1000),
            Grade::new(8.0, 1.0, "Math".to_string(), "Test 2".to_string(), 2000),
            Grade::new(6.0, 1.0, "Math".to_string(), "Test 3".to_string(), 3000),
            Grade::new(7.5, 1.0, "Math".to_string(), "Test 4".to_string(), 4000),
        ]
    }

    #[test]
    fn test_predict_grade_needed() {
        // If current average is 7.0 with weight 4, and we want 7.5 with new grade weight 1
        // new_grade = (7.5 * 5 - 7.0 * 4) / 1 = 37.5 - 28 = 9.5
        let needed = predict_grade_needed(7.0, 4.0, 7.5, 1.0);
        assert!((needed - 9.5).abs() < 0.01);
    }

    #[test]
    fn test_predict_next_grade() {
        let grades = create_test_grades();
        let prediction = predict_next_grade(&grades);
        assert!(prediction.predicted_value >= 1.0 && prediction.predicted_value <= 10.0);
        assert!(prediction.confidence >= 0.0 && prediction.confidence <= 1.0);
    }

    #[test]
    fn test_whatif() {
        let grades = create_test_grades();
        let hypothetical = vec![
            Grade::new(9.0, 1.0, "Math".to_string(), "Test 5".to_string(), 5000),
        ];
        
        let result = calculate_whatif(&grades, &hypothetical);
        assert!(result.new_average > result.current_average); // 9.0 should increase average
    }

    #[test]
    fn test_pass_probability() {
        let passing_grades = vec![
            Grade::new(8.0, 1.0, "Math".to_string(), "Test".to_string(), 1000),
        ];
        let probability = calculate_pass_probability(&passing_grades, 1.0);
        assert!(probability > 0.5); // Good grades should have high pass probability
    }
}
