//! Statistics Engine
//! 
//! Comprehensive statistical analysis functions including descriptive statistics,
//! trend analysis, correlation, and distribution analysis.

use crate::{Statistics, TrendResult};
use std::collections::HashMap;

/// Calculate comprehensive statistics for a data set
pub fn calculate_statistics(data: &[f64]) -> Statistics {
    if data.is_empty() {
        return Statistics {
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
        };
    }

    let count = data.len();
    let sum: f64 = data.iter().sum();
    let mean = sum / count as f64;
    
    let mut sorted = data.to_vec();
    sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
    
    let median = calculate_median(&sorted);
    let mode = calculate_mode(data);
    
    let min = sorted[0];
    let max = sorted[count - 1];
    let range = max - min;
    
    let variance = calculate_variance(data, mean);
    let std_deviation = variance.sqrt();
    
    let percentile_25 = calculate_percentile_sorted(&sorted, 25.0);
    let percentile_50 = calculate_percentile_sorted(&sorted, 50.0);
    let percentile_75 = calculate_percentile_sorted(&sorted, 75.0);
    let percentile_90 = calculate_percentile_sorted(&sorted, 90.0);
    
    let iqr = percentile_75 - percentile_25;
    
    let skewness = calculate_skewness(data, mean, std_deviation);
    let kurtosis = calculate_kurtosis(data, mean, std_deviation);
    
    Statistics {
        count,
        sum,
        mean,
        median,
        mode,
        min,
        max,
        range,
        variance,
        std_deviation,
        percentile_25,
        percentile_50,
        percentile_75,
        percentile_90,
        iqr,
        skewness,
        kurtosis,
    }
}

/// Calculate the mean (average) of a data set
pub fn calculate_mean(data: &[f64]) -> f64 {
    if data.is_empty() {
        return 0.0;
    }
    data.iter().sum::<f64>() / data.len() as f64
}

/// Calculate the median of a sorted data set
pub fn calculate_median(sorted: &[f64]) -> f64 {
    if sorted.is_empty() {
        return 0.0;
    }
    
    let len = sorted.len();
    if len % 2 == 0 {
        (sorted[len / 2 - 1] + sorted[len / 2]) / 2.0
    } else {
        sorted[len / 2]
    }
}

/// Calculate the mode(s) of a data set
pub fn calculate_mode(data: &[f64]) -> Vec<f64> {
    if data.is_empty() {
        return vec![];
    }
    
    let mut frequency: HashMap<i64, usize> = HashMap::new();
    
    // Use fixed-point representation to handle floating point comparison
    for &value in data {
        let key = (value * 100.0).round() as i64;
        *frequency.entry(key).or_insert(0) += 1;
    }
    
    let max_freq = frequency.values().max().copied().unwrap_or(0);
    
    if max_freq <= 1 {
        return vec![]; // No mode if all values are unique
    }
    
    frequency
        .iter()
        .filter(|(_, &freq)| freq == max_freq)
        .map(|(&key, _)| key as f64 / 100.0)
        .collect()
}

/// Calculate variance of a data set
pub fn calculate_variance(data: &[f64], mean: f64) -> f64 {
    if data.len() < 2 {
        return 0.0;
    }
    
    let sum_squared_diff: f64 = data.iter().map(|x| (x - mean).powi(2)).sum();
    sum_squared_diff / (data.len() - 1) as f64 // Sample variance (n-1)
}

/// Calculate standard deviation
pub fn calculate_std_deviation(data: &[f64]) -> f64 {
    let mean = calculate_mean(data);
    calculate_variance(data, mean).sqrt()
}

/// Calculate a specific percentile
pub fn calculate_percentile(data: &[f64], percentile: f64) -> f64 {
    if data.is_empty() {
        return 0.0;
    }
    
    let mut sorted = data.to_vec();
    sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
    
    calculate_percentile_sorted(&sorted, percentile)
}

/// Calculate percentile from pre-sorted data
fn calculate_percentile_sorted(sorted: &[f64], percentile: f64) -> f64 {
    if sorted.is_empty() {
        return 0.0;
    }
    
    let percentile = percentile.clamp(0.0, 100.0);
    let index = (percentile / 100.0) * (sorted.len() - 1) as f64;
    let lower = index.floor() as usize;
    let upper = index.ceil() as usize;
    let weight = index - lower as f64;
    
    if lower == upper || upper >= sorted.len() {
        sorted[lower.min(sorted.len() - 1)]
    } else {
        sorted[lower] * (1.0 - weight) + sorted[upper] * weight
    }
}

/// Calculate skewness (measure of asymmetry)
pub fn calculate_skewness(data: &[f64], mean: f64, std_dev: f64) -> f64 {
    if data.len() < 3 || std_dev == 0.0 {
        return 0.0;
    }
    
    let n = data.len() as f64;
    let sum_cubed: f64 = data.iter().map(|x| ((x - mean) / std_dev).powi(3)).sum();
    
    (n / ((n - 1.0) * (n - 2.0))) * sum_cubed
}

/// Calculate kurtosis (measure of tail heaviness)
pub fn calculate_kurtosis(data: &[f64], mean: f64, std_dev: f64) -> f64 {
    if data.len() < 4 || std_dev == 0.0 {
        return 0.0;
    }
    
    let n = data.len() as f64;
    let sum_fourth: f64 = data.iter().map(|x| ((x - mean) / std_dev).powi(4)).sum();
    
    let numerator = n * (n + 1.0) * sum_fourth;
    let denominator = (n - 1.0) * (n - 2.0) * (n - 3.0);
    let adjustment = (3.0 * (n - 1.0).powi(2)) / ((n - 2.0) * (n - 3.0));
    
    (numerator / denominator) - adjustment
}

/// Calculate trend from time series data using linear regression
pub fn calculate_trend(data: &[(i64, f64)]) -> TrendResult {
    if data.len() < 2 {
        return TrendResult {
            slope: 0.0,
            intercept: 0.0,
            r_squared: 0.0,
            direction: "stable".to_string(),
            strength: "none".to_string(),
            predicted_values: vec![],
        };
    }
    
    // Normalize timestamps to avoid numerical issues
    let min_time = data.iter().map(|(t, _)| *t).min().unwrap_or(0);
    let normalized: Vec<(f64, f64)> = data
        .iter()
        .map(|(t, v)| ((t - min_time) as f64, *v))
        .collect();
    
    let n = normalized.len() as f64;
    
    let sum_x: f64 = normalized.iter().map(|(x, _)| x).sum();
    let sum_y: f64 = normalized.iter().map(|(_, y)| y).sum();
    let sum_xy: f64 = normalized.iter().map(|(x, y)| x * y).sum();
    let sum_x2: f64 = normalized.iter().map(|(x, _)| x * x).sum();
    let sum_y2: f64 = normalized.iter().map(|(_, y)| y * y).sum();
    
    let denominator = n * sum_x2 - sum_x * sum_x;
    
    if denominator.abs() < 1e-10 {
        return TrendResult {
            slope: 0.0,
            intercept: sum_y / n,
            r_squared: 0.0,
            direction: "stable".to_string(),
            strength: "none".to_string(),
            predicted_values: vec![],
        };
    }
    
    let slope = (n * sum_xy - sum_x * sum_y) / denominator;
    let intercept = (sum_y - slope * sum_x) / n;
    
    // Calculate R-squared
    let mean_y = sum_y / n;
    let ss_tot: f64 = normalized.iter().map(|(_, y)| (y - mean_y).powi(2)).sum();
    let ss_res: f64 = normalized
        .iter()
        .map(|(x, y)| (y - (slope * x + intercept)).powi(2))
        .sum();
    
    let r_squared = if ss_tot > 0.0 {
        1.0 - (ss_res / ss_tot)
    } else {
        0.0
    };
    
    // Determine direction and strength
    let direction = if slope.abs() < 0.001 {
        "stable"
    } else if slope > 0.0 {
        "improving"
    } else {
        "declining"
    };
    
    let strength = if r_squared < 0.1 {
        "none"
    } else if r_squared < 0.3 {
        "weak"
    } else if r_squared < 0.6 {
        "moderate"
    } else {
        "strong"
    };
    
    // Generate predicted values for each data point
    let predicted_values: Vec<f64> = normalized
        .iter()
        .map(|(x, _)| slope * x + intercept)
        .collect();
    
    TrendResult {
        slope,
        intercept,
        r_squared,
        direction: direction.to_string(),
        strength: strength.to_string(),
        predicted_values,
    }
}

/// Calculate Pearson correlation coefficient between two data sets
pub fn calculate_correlation(data1: &[f64], data2: &[f64]) -> f64 {
    if data1.len() != data2.len() || data1.len() < 2 {
        return 0.0;
    }
    
    let n = data1.len() as f64;
    let mean1 = calculate_mean(data1);
    let mean2 = calculate_mean(data2);
    
    let mut sum_product = 0.0;
    let mut sum_sq1 = 0.0;
    let mut sum_sq2 = 0.0;
    
    for i in 0..data1.len() {
        let diff1 = data1[i] - mean1;
        let diff2 = data2[i] - mean2;
        sum_product += diff1 * diff2;
        sum_sq1 += diff1 * diff1;
        sum_sq2 += diff2 * diff2;
    }
    
    let denominator = (sum_sq1 * sum_sq2).sqrt();
    
    if denominator.abs() < 1e-10 {
        return 0.0;
    }
    
    sum_product / denominator
}

/// Calculate moving average
pub fn calculate_moving_average(data: &[f64], window_size: usize) -> Vec<f64> {
    if data.is_empty() || window_size == 0 {
        return vec![];
    }
    
    let window_size = window_size.min(data.len());
    let mut result = Vec::with_capacity(data.len());
    
    for i in 0..data.len() {
        let start = if i >= window_size - 1 { i - window_size + 1 } else { 0 };
        let window = &data[start..=i];
        let avg = window.iter().sum::<f64>() / window.len() as f64;
        result.push(avg);
    }
    
    result
}

/// Calculate exponential moving average
pub fn calculate_ema(data: &[f64], alpha: f64) -> Vec<f64> {
    if data.is_empty() {
        return vec![];
    }
    
    let alpha = alpha.clamp(0.0, 1.0);
    let mut result = Vec::with_capacity(data.len());
    
    result.push(data[0]);
    
    for i in 1..data.len() {
        let ema = alpha * data[i] + (1.0 - alpha) * result[i - 1];
        result.push(ema);
    }
    
    result
}

/// Detect outliers using IQR method
pub fn detect_outliers(data: &[f64]) -> Vec<(usize, f64)> {
    if data.len() < 4 {
        return vec![];
    }
    
    let stats = calculate_statistics(data);
    let lower_bound = stats.percentile_25 - 1.5 * stats.iqr;
    let upper_bound = stats.percentile_75 + 1.5 * stats.iqr;
    
    data.iter()
        .enumerate()
        .filter(|(_, &v)| v < lower_bound || v > upper_bound)
        .map(|(i, &v)| (i, v))
        .collect()
}

/// Calculate z-scores for data normalization
pub fn calculate_z_scores(data: &[f64]) -> Vec<f64> {
    let mean = calculate_mean(data);
    let std_dev = calculate_std_deviation(data);
    
    if std_dev == 0.0 {
        return vec![0.0; data.len()];
    }
    
    data.iter().map(|x| (x - mean) / std_dev).collect()
}

/// Calculate coefficient of variation (relative variability)
pub fn calculate_cv(data: &[f64]) -> f64 {
    let mean = calculate_mean(data);
    if mean == 0.0 {
        return 0.0;
    }
    let std_dev = calculate_std_deviation(data);
    (std_dev / mean.abs()) * 100.0
}

/// Calculate the rank percentile of a value in a data set
pub fn calculate_value_percentile(data: &[f64], value: f64) -> f64 {
    if data.is_empty() {
        return 0.0;
    }
    
    let count_below = data.iter().filter(|&&x| x < value).count();
    let count_equal = data.iter().filter(|&&x| (x - value).abs() < 0.001).count();
    
    let percentile = (count_below as f64 + 0.5 * count_equal as f64) / data.len() as f64;
    percentile * 100.0
}

/// Generate histogram buckets
pub fn generate_histogram(data: &[f64], num_buckets: usize) -> Vec<(f64, f64, usize)> {
    if data.is_empty() || num_buckets == 0 {
        return vec![];
    }
    
    let min = data.iter().cloned().fold(f64::INFINITY, f64::min);
    let max = data.iter().cloned().fold(f64::NEG_INFINITY, f64::max);
    
    if (max - min).abs() < 1e-10 {
        return vec![(min, max, data.len())];
    }
    
    let bucket_size = (max - min) / num_buckets as f64;
    let mut buckets: Vec<(f64, f64, usize)> = (0..num_buckets)
        .map(|i| {
            let start = min + i as f64 * bucket_size;
            let end = if i == num_buckets - 1 {
                max + 0.001 // Include max value
            } else {
                start + bucket_size
            };
            (start, end, 0)
        })
        .collect();
    
    for &value in data {
        let bucket_index = ((value - min) / bucket_size).floor() as usize;
        let bucket_index = bucket_index.min(num_buckets - 1);
        buckets[bucket_index].2 += 1;
    }
    
    buckets
}

/// Calculate autocorrelation for lag detection
pub fn calculate_autocorrelation(data: &[f64], lag: usize) -> f64 {
    if data.len() <= lag {
        return 0.0;
    }
    
    let mean = calculate_mean(data);
    let variance = calculate_variance(data, mean);
    
    if variance == 0.0 {
        return 0.0;
    }
    
    let n = data.len() - lag;
    let sum: f64 = (0..n)
        .map(|i| (data[i] - mean) * (data[i + lag] - mean))
        .sum();
    
    sum / (n as f64 * variance)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mean() {
        let data = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        assert!((calculate_mean(&data) - 3.0).abs() < 0.01);
    }

    #[test]
    fn test_median_odd() {
        let sorted = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        assert!((calculate_median(&sorted) - 3.0).abs() < 0.01);
    }

    #[test]
    fn test_median_even() {
        let sorted = vec![1.0, 2.0, 3.0, 4.0];
        assert!((calculate_median(&sorted) - 2.5).abs() < 0.01);
    }

    #[test]
    fn test_std_deviation() {
        let data = vec![2.0, 4.0, 4.0, 4.0, 5.0, 5.0, 7.0, 9.0];
        let std_dev = calculate_std_deviation(&data);
        assert!((std_dev - 2.0).abs() < 0.1);
    }

    #[test]
    fn test_correlation() {
        let data1 = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let data2 = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        assert!((calculate_correlation(&data1, &data2) - 1.0).abs() < 0.01);
    }

    #[test]
    fn test_trend() {
        let data = vec![(1, 5.0), (2, 6.0), (3, 7.0), (4, 8.0), (5, 9.0)];
        let trend = calculate_trend(&data);
        assert!(trend.direction == "improving");
        assert!((trend.slope - 1.0).abs() < 0.01);
    }
}
