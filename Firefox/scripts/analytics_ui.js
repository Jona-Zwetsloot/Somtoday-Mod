// ANALYTICS UI COMPONENTS
// Provides UI widgets for grade analytics, predictions, and what-if scenarios

// ============================================================================
// Analytics Dashboard
// ============================================================================

/**
 * Create the main analytics dashboard
 */
function createAnalyticsDashboard() {
    if (id('mod-analytics-dashboard')) {
        id('mod-analytics-dashboard').remove();
    }
    
    const dashboard = document.createElement('div');
    dashboard.id = 'mod-analytics-dashboard';
    dashboard.className = 'mod-analytics-dashboard';
    dashboard.innerHTML = `
        <div class="mod-analytics-header">
            <h2>📊 Grade Analytics</h2>
            <button class="mod-analytics-close" onclick="closeAnalyticsDashboard()">&times;</button>
        </div>
        <div class="mod-analytics-tabs">
            <button class="mod-analytics-tab active" data-tab="overview">Overview</button>
            <button class="mod-analytics-tab" data-tab="subjects">Subjects</button>
            <button class="mod-analytics-tab" data-tab="predictions">Predictions</button>
            <button class="mod-analytics-tab" data-tab="whatif">What-If</button>
            <button class="mod-analytics-tab" data-tab="statistics">Statistics</button>
        </div>
        <div class="mod-analytics-content">
            <div class="mod-analytics-panel active" id="mod-analytics-overview"></div>
            <div class="mod-analytics-panel" id="mod-analytics-subjects"></div>
            <div class="mod-analytics-panel" id="mod-analytics-predictions"></div>
            <div class="mod-analytics-panel" id="mod-analytics-whatif"></div>
            <div class="mod-analytics-panel" id="mod-analytics-statistics"></div>
        </div>
    `;
    
    tn('body', 0).appendChild(dashboard);
    
    // Add tab switching
    dashboard.querySelectorAll('.mod-analytics-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAnalyticsTab(tab.dataset.tab));
    });
    
    // Load data and render
    loadAnalyticsData();
}

/**
 * Close the analytics dashboard
 */
function closeAnalyticsDashboard() {
    const dashboard = id('mod-analytics-dashboard');
    if (dashboard) {
        dashboard.classList.add('closing');
        setTimeout(() => dashboard.remove(), 300);
    }
}

/**
 * Switch between analytics tabs
 */
function switchAnalyticsTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.mod-analytics-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update panels
    document.querySelectorAll('.mod-analytics-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `mod-analytics-${tabName}`);
    });
}

/**
 * Load analytics data and render all panels
 */
async function loadAnalyticsData() {
    // Ensure WASM is initialized
    if (window.SomtodayAnalytics) {
        await window.SomtodayAnalytics.init();
    }
    
    // Extract grades from DOM
    const gradeElements = document.querySelectorAll('sl-resultaat-item, sl-vakgemiddelde-item');
    const grades = window.SomtodayAnalytics 
        ? window.SomtodayAnalytics.extractGradesFromDOM(gradeElements)
        : extractGradesManually(gradeElements);
    
    // Store for use by other functions
    window.analyticsGrades = grades;
    
    // Get full analytics
    const analytics = window.SomtodayAnalytics 
        ? window.SomtodayAnalytics.analyzeAllGrades(grades)
        : null;
    
    // Render all panels
    renderOverviewPanel(analytics, grades);
    renderSubjectsPanel(analytics, grades);
    renderPredictionsPanel(analytics, grades);
    renderWhatIfPanel(grades);
    renderStatisticsPanel(analytics, grades);
}

/**
 * Fallback grade extraction
 */
function extractGradesManually(elements) {
    const grades = [];
    elements.forEach((el, index) => {
        const cijfer = el.querySelector('.cijfer');
        if (cijfer) {
            const value = parseFloat(cijfer.textContent.replace(',', '.'));
            if (!isNaN(value)) {
                const subject = el.querySelector('.titel, .vak')?.textContent || 'Unknown';
                grades.push({
                    value,
                    weight: 1,
                    subject,
                    description: '',
                    timestamp: Date.now() - index * 86400000,
                    is_passing: value >= 5.5
                });
            }
        }
    });
    return grades;
}

// ============================================================================
// Overview Panel
// ============================================================================

/**
 * Render the overview panel
 */
function renderOverviewPanel(analytics, grades) {
    const panel = id('mod-analytics-overview');
    if (!panel) return;
    
    if (!grades || grades.length === 0) {
        panel.innerHTML = `
            <div class="mod-analytics-empty">
                <p>No grades found. Navigate to your grades page to see analytics.</p>
            </div>
        `;
        return;
    }
    
    const avg = analytics?.weighted_average || calculateSimpleAverage(grades);
    const gpa = analytics?.gpa || (avg - 1) / 9 * 4;
    const passRate = analytics?.pass_rate || (grades.filter(g => g.value >= 5.5).length / grades.length * 100);
    const trend = analytics?.trend || { direction: 'stable', strength: 'none' };
    
    panel.innerHTML = `
        <div class="mod-analytics-grid">
            <div class="mod-stat-card mod-stat-primary">
                <div class="mod-stat-icon">📈</div>
                <div class="mod-stat-value">${avg.toFixed(2).replace('.', ',')}</div>
                <div class="mod-stat-label">Weighted Average</div>
            </div>
            <div class="mod-stat-card">
                <div class="mod-stat-icon">🎓</div>
                <div class="mod-stat-value">${gpa.toFixed(2)}</div>
                <div class="mod-stat-label">GPA (4.0 scale)</div>
            </div>
            <div class="mod-stat-card">
                <div class="mod-stat-icon">✅</div>
                <div class="mod-stat-value">${passRate.toFixed(1)}%</div>
                <div class="mod-stat-label">Pass Rate</div>
            </div>
            <div class="mod-stat-card">
                <div class="mod-stat-icon">${getTrendIcon(trend.direction)}</div>
                <div class="mod-stat-value">${capitalizeFirst(trend.direction)}</div>
                <div class="mod-stat-label">Trend (${trend.strength})</div>
            </div>
        </div>
        
        <div class="mod-analytics-section">
            <h3>Grade Distribution</h3>
            <div class="mod-grade-distribution">
                ${renderGradeDistribution(grades)}
            </div>
        </div>
        
        <div class="mod-analytics-section">
            <h3>Quick Summary</h3>
            <div class="mod-summary-list">
                <div class="mod-summary-item">
                    <span>Total Grades</span>
                    <strong>${grades.length}</strong>
                </div>
                <div class="mod-summary-item">
                    <span>Passing Grades</span>
                    <strong class="mod-positive">${grades.filter(g => g.value >= 5.5).length}</strong>
                </div>
                <div class="mod-summary-item">
                    <span>Failing Grades</span>
                    <strong class="mod-negative">${grades.filter(g => g.value < 5.5).length}</strong>
                </div>
                <div class="mod-summary-item">
                    <span>Highest Grade</span>
                    <strong>${Math.max(...grades.map(g => g.value)).toFixed(1).replace('.', ',')}</strong>
                </div>
                <div class="mod-summary-item">
                    <span>Lowest Grade</span>
                    <strong>${Math.min(...grades.map(g => g.value)).toFixed(1).replace('.', ',')}</strong>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render grade distribution bar chart
 */
function renderGradeDistribution(grades) {
    const distribution = {};
    for (let i = 1; i <= 10; i++) {
        distribution[i] = 0;
    }
    
    grades.forEach(g => {
        const bucket = Math.floor(g.value);
        const clampedBucket = Math.max(1, Math.min(10, bucket));
        distribution[clampedBucket]++;
    });
    
    const maxCount = Math.max(...Object.values(distribution), 1);
    
    let html = '<div class="mod-distribution-chart">';
    for (let i = 1; i <= 10; i++) {
        const count = distribution[i];
        const height = (count / maxCount) * 100;
        const colorClass = i < 6 ? 'mod-bar-failing' : i >= 8 ? 'mod-bar-excellent' : 'mod-bar-passing';
        html += `
            <div class="mod-bar-container">
                <div class="mod-bar ${colorClass}" style="height: ${height}%;" title="${count} grades">
                    <span class="mod-bar-value">${count}</span>
                </div>
                <div class="mod-bar-label">${i}</div>
            </div>
        `;
    }
    html += '</div>';
    return html;
}

// ============================================================================
// Subjects Panel
// ============================================================================

/**
 * Render the subjects panel
 */
function renderSubjectsPanel(analytics, grades) {
    const panel = id('mod-analytics-subjects');
    if (!panel) return;
    
    const subjects = analytics?.subjects || getSubjectSummaries(grades);
    
    if (!subjects || subjects.length === 0) {
        panel.innerHTML = '<div class="mod-analytics-empty"><p>No subjects found.</p></div>';
        return;
    }
    
    // Sort by weighted average
    subjects.sort((a, b) => b.weighted_average - a.weighted_average);
    
    panel.innerHTML = `
        <div class="mod-subject-list">
            ${subjects.map(s => renderSubjectCard(s)).join('')}
        </div>
    `;
}

/**
 * Render a single subject card
 */
function renderSubjectCard(subject) {
    const avg = subject.weighted_average || subject.average;
    const statusClass = avg < 5.5 ? 'mod-failing' : avg >= 8 ? 'mod-excellent' : 'mod-passing';
    const trendIcon = getTrendIcon(subject.trend > 0.01 ? 'improving' : subject.trend < -0.01 ? 'declining' : 'stable');
    
    return `
        <div class="mod-subject-card ${statusClass}">
            <div class="mod-subject-header">
                <h4>${escapeHtml(subject.subject)}</h4>
                <span class="mod-subject-avg">${avg.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="mod-subject-stats">
                <div class="mod-subject-stat">
                    <span>Grades</span>
                    <strong>${subject.grade_count}</strong>
                </div>
                <div class="mod-subject-stat">
                    <span>Highest</span>
                    <strong>${subject.highest?.toFixed(1).replace('.', ',') || '-'}</strong>
                </div>
                <div class="mod-subject-stat">
                    <span>Lowest</span>
                    <strong>${subject.lowest?.toFixed(1).replace('.', ',') || '-'}</strong>
                </div>
                <div class="mod-subject-stat">
                    <span>Trend</span>
                    <strong>${trendIcon}</strong>
                </div>
            </div>
            <div class="mod-subject-progress">
                <div class="mod-progress-bar">
                    <div class="mod-progress-fill" style="width: ${(avg / 10) * 100}%"></div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Get subject summaries (fallback)
 */
function getSubjectSummaries(grades) {
    const subjectMap = {};
    
    grades.forEach(g => {
        const key = g.subject.toLowerCase();
        if (!subjectMap[key]) {
            subjectMap[key] = {
                subject: g.subject,
                grades: []
            };
        }
        subjectMap[key].grades.push(g);
    });
    
    return Object.values(subjectMap).map(s => {
        const values = s.grades.map(g => g.value);
        return {
            subject: s.subject,
            average: values.reduce((a, b) => a + b, 0) / values.length,
            weighted_average: values.reduce((a, b) => a + b, 0) / values.length,
            grade_count: s.grades.length,
            highest: Math.max(...values),
            lowest: Math.min(...values),
            passing_count: values.filter(v => v >= 5.5).length,
            failing_count: values.filter(v => v < 5.5).length,
            trend: 0
        };
    });
}

// ============================================================================
// Predictions Panel
// ============================================================================

/**
 * Render the predictions panel
 */
function renderPredictionsPanel(analytics, grades) {
    const panel = id('mod-analytics-predictions');
    if (!panel) return;
    
    const subjects = analytics?.subjects || getSubjectSummaries(grades);
    
    panel.innerHTML = `
        <div class="mod-predictions-intro">
            <p>Based on your grade history, here are predictions for your next grades in each subject.</p>
        </div>
        
        <div class="mod-predictions-grid">
            ${subjects.map(s => renderPredictionCard(s, grades)).join('')}
        </div>
        
        <div class="mod-analytics-section">
            <h3>Overall Prediction</h3>
            ${renderOverallPrediction(grades)}
        </div>
    `;
}

/**
 * Render prediction card for a subject
 */
function renderPredictionCard(subject, grades) {
    const subjectGrades = grades.filter(g => g.subject.toLowerCase() === subject.subject.toLowerCase());
    
    let prediction;
    if (window.SomtodayAnalytics) {
        prediction = window.SomtodayAnalytics.predictNextGrade(subjectGrades);
    } else {
        const values = subjectGrades.map(g => g.value);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        prediction = {
            predicted_value: avg,
            confidence: 0.5,
            lower_bound: Math.max(1, avg - 1),
            upper_bound: Math.min(10, avg + 1)
        };
    }
    
    const confidencePercent = (prediction.confidence * 100).toFixed(0);
    const predictedClass = prediction.predicted_value < 5.5 ? 'mod-failing' : prediction.predicted_value >= 8 ? 'mod-excellent' : 'mod-passing';
    
    return `
        <div class="mod-prediction-card ${predictedClass}">
            <h4>${escapeHtml(subject.subject)}</h4>
            <div class="mod-prediction-value">
                ${prediction.predicted_value.toFixed(1).replace('.', ',')}
            </div>
            <div class="mod-prediction-range">
                Range: ${prediction.lower_bound.toFixed(1).replace('.', ',')} - ${prediction.upper_bound.toFixed(1).replace('.', ',')}
            </div>
            <div class="mod-prediction-confidence">
                <div class="mod-confidence-bar">
                    <div class="mod-confidence-fill" style="width: ${confidencePercent}%"></div>
                </div>
                <span>${confidencePercent}% confidence</span>
            </div>
        </div>
    `;
}

/**
 * Render overall prediction
 */
function renderOverallPrediction(grades) {
    if (grades.length < 3) {
        return '<p class="mod-prediction-note">Need at least 3 grades for overall prediction.</p>';
    }
    
    let prediction;
    if (window.SomtodayAnalytics) {
        prediction = window.SomtodayAnalytics.predictNextGrade(grades);
    } else {
        const values = grades.map(g => g.value);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        prediction = {
            predicted_value: avg,
            confidence: 0.5,
            method: 'average'
        };
    }
    
    return `
        <div class="mod-overall-prediction">
            <div class="mod-prediction-large">
                <span class="mod-prediction-label">Next Grade Prediction</span>
                <span class="mod-prediction-number">${prediction.predicted_value.toFixed(2).replace('.', ',')}</span>
            </div>
            <p class="mod-prediction-method">Method: ${prediction.method || 'ensemble'}</p>
        </div>
    `;
}

// ============================================================================
// What-If Panel
// ============================================================================

/**
 * Render the what-if panel
 */
function renderWhatIfPanel(grades) {
    const panel = id('mod-analytics-whatif');
    if (!panel) return;
    
    const subjects = getSubjectSummaries(grades);
    
    panel.innerHTML = `
        <div class="mod-whatif-intro">
            <h3>Grade Impact Calculator</h3>
            <p>See how a hypothetical grade would affect your average.</p>
        </div>
        
        <div class="mod-whatif-form">
            <div class="mod-form-group">
                <label for="mod-whatif-subject">Subject</label>
                <select id="mod-whatif-subject">
                    <option value="">All Subjects</option>
                    ${subjects.map(s => `<option value="${escapeHtml(s.subject)}">${escapeHtml(s.subject)}</option>`).join('')}
                </select>
            </div>
            
            <div class="mod-form-group">
                <label for="mod-whatif-grade">Hypothetical Grade</label>
                <input type="number" id="mod-whatif-grade" min="1" max="10" step="0.1" value="7.0">
                <input type="range" id="mod-whatif-grade-slider" min="1" max="10" step="0.1" value="7.0">
            </div>
            
            <div class="mod-form-group">
                <label for="mod-whatif-weight">Weight</label>
                <input type="number" id="mod-whatif-weight" min="0.1" max="10" step="0.1" value="1.0">
            </div>
            
            <button class="mod-btn mod-btn-primary" onclick="calculateWhatIfScenario()">Calculate</button>
        </div>
        
        <div id="mod-whatif-results" class="mod-whatif-results"></div>
        
        <div class="mod-analytics-section">
            <h3>Target Calculator</h3>
            <p>What grade do you need to reach a specific average?</p>
            <div id="mod-target-calculator">
                ${renderTargetCalculator(grades, subjects)}
            </div>
        </div>
    `;
    
    // Add event listeners
    const gradeInput = id('mod-whatif-grade');
    const gradeSlider = id('mod-whatif-grade-slider');
    
    if (gradeInput && gradeSlider) {
        gradeInput.addEventListener('input', () => {
            gradeSlider.value = gradeInput.value;
        });
        gradeSlider.addEventListener('input', () => {
            gradeInput.value = gradeSlider.value;
        });
    }
}

/**
 * Calculate what-if scenario
 */
function calculateWhatIfScenario() {
    const subject = id('mod-whatif-subject')?.value || '';
    const grade = parseFloat(id('mod-whatif-grade')?.value) || 7.0;
    const weight = parseFloat(id('mod-whatif-weight')?.value) || 1.0;
    
    const grades = window.analyticsGrades || [];
    const filteredGrades = subject 
        ? grades.filter(g => g.subject.toLowerCase() === subject.toLowerCase())
        : grades;
    
    const hypothetical = [{
        value: grade,
        weight: weight,
        subject: subject || 'Hypothetical',
        description: 'What-if grade',
        timestamp: Date.now(),
        is_passing: grade >= 5.5
    }];
    
    let result;
    if (window.SomtodayAnalytics) {
        result = window.SomtodayAnalytics.calculateWhatIf(filteredGrades, hypothetical);
    } else {
        const currentAvg = filteredGrades.reduce((a, g) => a + g.value, 0) / filteredGrades.length || 0;
        const currentWeight = filteredGrades.reduce((a, g) => a + (g.weight || 1), 0);
        const newWeight = currentWeight + weight;
        const newAvg = (currentAvg * currentWeight + grade * weight) / newWeight;
        
        result = {
            current_average: currentAvg,
            new_average: newAvg,
            change: newAvg - currentAvg,
            change_percent: currentAvg > 0 ? ((newAvg - currentAvg) / currentAvg) * 100 : 0
        };
    }
    
    renderWhatIfResults(result, grade);
}

/**
 * Render what-if results
 */
function renderWhatIfResults(result, hypotheticalGrade) {
    const resultsDiv = id('mod-whatif-results');
    if (!resultsDiv) return;
    
    const changeClass = result.change >= 0 ? 'mod-positive' : 'mod-negative';
    const changeIcon = result.change >= 0 ? '📈' : '📉';
    
    resultsDiv.innerHTML = `
        <div class="mod-whatif-result-grid">
            <div class="mod-result-card">
                <span class="mod-result-label">Current Average</span>
                <span class="mod-result-value">${result.current_average.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="mod-result-card mod-result-arrow">
                <span class="mod-result-icon">${changeIcon}</span>
                <span class="mod-result-change ${changeClass}">
                    ${result.change >= 0 ? '+' : ''}${result.change.toFixed(2).replace('.', ',')}
                </span>
            </div>
            <div class="mod-result-card mod-result-primary">
                <span class="mod-result-label">New Average</span>
                <span class="mod-result-value">${result.new_average.toFixed(2).replace('.', ',')}</span>
            </div>
        </div>
        
        ${result.grades_needed_for_target ? `
        <div class="mod-target-grades">
            <h4>Grades Needed for Targets</h4>
            <div class="mod-target-list">
                ${result.grades_needed_for_target.map(t => `
                    <div class="mod-target-item ${t.achievable ? '' : 'mod-unachievable'}">
                        <span>For ${t.target_average.toFixed(1).replace('.', ',')} average:</span>
                        <strong>${t.achievable ? t.grade_needed.toFixed(1).replace('.', ',') : 'Not possible'}</strong>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${renderImpactChart(result.impact_analysis, hypotheticalGrade)}
    `;
}

/**
 * Render impact analysis chart
 */
function renderImpactChart(impactAnalysis, selectedGrade) {
    if (!impactAnalysis || impactAnalysis.length === 0) return '';
    
    return `
        <div class="mod-impact-chart">
            <h4>Impact Analysis</h4>
            <div class="mod-impact-bars">
                ${impactAnalysis.filter((_, i) => i % 2 === 0).map(entry => {
                    const isSelected = Math.abs(entry.hypothetical_grade - selectedGrade) < 0.1;
                    const impactClass = entry.impact >= 0 ? 'mod-impact-positive' : 'mod-impact-negative';
                    return `
                        <div class="mod-impact-bar ${impactClass} ${isSelected ? 'mod-selected' : ''}">
                            <div class="mod-impact-grade">${entry.hypothetical_grade.toFixed(1)}</div>
                            <div class="mod-impact-result">${entry.resulting_average.toFixed(2)}</div>
                            <div class="mod-impact-delta">${entry.impact >= 0 ? '+' : ''}${entry.impact.toFixed(2)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

/**
 * Render target calculator
 */
function renderTargetCalculator(grades, subjects) {
    return `
        <div class="mod-target-form">
            <div class="mod-form-row">
                <div class="mod-form-group">
                    <label>Subject</label>
                    <select id="mod-target-subject">
                        ${subjects.map(s => `<option value="${escapeHtml(s.subject)}">${escapeHtml(s.subject)}</option>`).join('')}
                    </select>
                </div>
                <div class="mod-form-group">
                    <label>Target Average</label>
                    <input type="number" id="mod-target-avg" min="1" max="10" step="0.1" value="7.0">
                </div>
                <div class="mod-form-group">
                    <label>Next Grade Weight</label>
                    <input type="number" id="mod-target-weight" min="0.1" max="10" step="0.1" value="1.0">
                </div>
            </div>
            <button class="mod-btn mod-btn-secondary" onclick="calculateTargetGrade()">Calculate Needed Grade</button>
        </div>
        <div id="mod-target-result" class="mod-target-result"></div>
    `;
}

/**
 * Calculate target grade
 */
function calculateTargetGrade() {
    const subject = id('mod-target-subject')?.value;
    const targetAvg = parseFloat(id('mod-target-avg')?.value) || 7.0;
    const weight = parseFloat(id('mod-target-weight')?.value) || 1.0;
    
    const grades = window.analyticsGrades || [];
    const subjectGrades = grades.filter(g => g.subject.toLowerCase() === subject.toLowerCase());
    
    const currentAvg = subjectGrades.reduce((a, g) => a + g.value, 0) / subjectGrades.length || 0;
    const currentWeight = subjectGrades.reduce((a, g) => a + (g.weight || 1), 0);
    
    let gradeNeeded;
    if (window.SomtodayAnalytics) {
        gradeNeeded = window.SomtodayAnalytics.predictGradeNeeded(currentAvg, currentWeight, targetAvg, weight);
    } else {
        const totalWeight = currentWeight + weight;
        gradeNeeded = (targetAvg * totalWeight - currentAvg * currentWeight) / weight;
    }
    
    const resultDiv = id('mod-target-result');
    if (resultDiv) {
        const achievable = gradeNeeded >= 1 && gradeNeeded <= 10;
        resultDiv.innerHTML = `
            <div class="mod-target-answer ${achievable ? 'mod-achievable' : 'mod-unachievable'}">
                ${achievable 
                    ? `<p>To reach a <strong>${targetAvg.toFixed(1).replace('.', ',')}</strong> average in ${escapeHtml(subject)}, you need a <strong>${gradeNeeded.toFixed(1).replace('.', ',')}</strong></p>`
                    : `<p>It's not possible to reach a ${targetAvg.toFixed(1).replace('.', ',')} average with a single grade.</p>`
                }
            </div>
        `;
    }
}

// ============================================================================
// Statistics Panel
// ============================================================================

/**
 * Render the statistics panel
 */
function renderStatisticsPanel(analytics, grades) {
    const panel = id('mod-analytics-statistics');
    if (!panel) return;
    
    const values = grades.map(g => g.value);
    const stats = analytics?.statistics || (window.SomtodayAnalytics 
        ? window.SomtodayAnalytics.calculateStatistics(values)
        : calculateBasicStats(values));
    
    panel.innerHTML = `
        <div class="mod-stats-grid">
            <div class="mod-stats-section">
                <h3>Central Tendency</h3>
                <div class="mod-stats-list">
                    <div class="mod-stats-item">
                        <span>Mean (Average)</span>
                        <strong>${stats.mean?.toFixed(3).replace('.', ',') || '-'}</strong>
                    </div>
                    <div class="mod-stats-item">
                        <span>Median</span>
                        <strong>${stats.median?.toFixed(3).replace('.', ',') || '-'}</strong>
                    </div>
                    <div class="mod-stats-item">
                        <span>Mode</span>
                        <strong>${stats.mode?.length > 0 ? stats.mode.map(m => m.toFixed(1).replace('.', ',')).join(', ') : 'None'}</strong>
                    </div>
                </div>
            </div>
            
            <div class="mod-stats-section">
                <h3>Spread</h3>
                <div class="mod-stats-list">
                    <div class="mod-stats-item">
                        <span>Standard Deviation</span>
                        <strong>${stats.std_deviation?.toFixed(3).replace('.', ',') || '-'}</strong>
                    </div>
                    <div class="mod-stats-item">
                        <span>Variance</span>
                        <strong>${stats.variance?.toFixed(3).replace('.', ',') || '-'}</strong>
                    </div>
                    <div class="mod-stats-item">
                        <span>Range</span>
                        <strong>${stats.range?.toFixed(1).replace('.', ',') || '-'}</strong>
                    </div>
                    <div class="mod-stats-item">
                        <span>IQR</span>
                        <strong>${stats.iqr?.toFixed(3).replace('.', ',') || '-'}</strong>
                    </div>
                </div>
            </div>
            
            <div class="mod-stats-section">
                <h3>Percentiles</h3>
                <div class="mod-stats-list">
                    <div class="mod-stats-item">
                        <span>25th Percentile (Q1)</span>
                        <strong>${stats.percentile_25?.toFixed(2).replace('.', ',') || '-'}</strong>
                    </div>
                    <div class="mod-stats-item">
                        <span>50th Percentile (Q2)</span>
                        <strong>${stats.percentile_50?.toFixed(2).replace('.', ',') || '-'}</strong>
                    </div>
                    <div class="mod-stats-item">
                        <span>75th Percentile (Q3)</span>
                        <strong>${stats.percentile_75?.toFixed(2).replace('.', ',') || '-'}</strong>
                    </div>
                    <div class="mod-stats-item">
                        <span>90th Percentile</span>
                        <strong>${stats.percentile_90?.toFixed(2).replace('.', ',') || '-'}</strong>
                    </div>
                </div>
            </div>
            
            <div class="mod-stats-section">
                <h3>Distribution Shape</h3>
                <div class="mod-stats-list">
                    <div class="mod-stats-item">
                        <span>Skewness</span>
                        <strong>${stats.skewness?.toFixed(3).replace('.', ',') || '-'}</strong>
                        <span class="mod-stats-hint">${getSkewnessInterpretation(stats.skewness)}</span>
                    </div>
                    <div class="mod-stats-item">
                        <span>Kurtosis</span>
                        <strong>${stats.kurtosis?.toFixed(3).replace('.', ',') || '-'}</strong>
                        <span class="mod-stats-hint">${getKurtosisInterpretation(stats.kurtosis)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mod-analytics-section">
            <h3>Box Plot Visualization</h3>
            ${renderBoxPlot(stats)}
        </div>
    `;
}

/**
 * Calculate basic statistics (fallback)
 */
function calculateBasicStats(values) {
    if (!values || values.length === 0) return {};
    
    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const median = n % 2 === 0 ? (sorted[n/2-1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)];
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1);
    
    return {
        count: n,
        sum,
        mean,
        median,
        mode: [],
        min: sorted[0],
        max: sorted[n-1],
        range: sorted[n-1] - sorted[0],
        variance,
        std_deviation: Math.sqrt(variance),
        percentile_25: sorted[Math.floor(n * 0.25)],
        percentile_50: median,
        percentile_75: sorted[Math.floor(n * 0.75)],
        percentile_90: sorted[Math.floor(n * 0.90)],
        iqr: sorted[Math.floor(n * 0.75)] - sorted[Math.floor(n * 0.25)],
        skewness: 0,
        kurtosis: 0
    };
}

/**
 * Render box plot
 */
function renderBoxPlot(stats) {
    if (!stats.min || !stats.max) return '<p>Not enough data for box plot.</p>';
    
    const scale = (val) => ((val - 1) / 9) * 100;
    
    return `
        <div class="mod-boxplot">
            <div class="mod-boxplot-axis">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
            </div>
            <div class="mod-boxplot-container">
                <div class="mod-boxplot-whisker-left" style="left: ${scale(stats.min)}%; width: ${scale(stats.percentile_25) - scale(stats.min)}%;"></div>
                <div class="mod-boxplot-box" style="left: ${scale(stats.percentile_25)}%; width: ${scale(stats.percentile_75) - scale(stats.percentile_25)}%;">
                    <div class="mod-boxplot-median" style="left: ${((stats.median - stats.percentile_25) / (stats.percentile_75 - stats.percentile_25)) * 100}%;"></div>
                </div>
                <div class="mod-boxplot-whisker-right" style="left: ${scale(stats.percentile_75)}%; width: ${scale(stats.max) - scale(stats.percentile_75)}%;"></div>
                <div class="mod-boxplot-point mod-boxplot-min" style="left: ${scale(stats.min)}%;" title="Min: ${stats.min.toFixed(1)}"></div>
                <div class="mod-boxplot-point mod-boxplot-max" style="left: ${scale(stats.max)}%;" title="Max: ${stats.max.toFixed(1)}"></div>
            </div>
        </div>
    `;
}

/**
 * Get skewness interpretation
 */
function getSkewnessInterpretation(skewness) {
    if (!skewness || Math.abs(skewness) < 0.5) return '(Symmetric)';
    if (skewness > 0) return '(Right-skewed)';
    return '(Left-skewed)';
}

/**
 * Get kurtosis interpretation
 */
function getKurtosisInterpretation(kurtosis) {
    if (!kurtosis) return '';
    if (kurtosis > 0) return '(Heavy tails)';
    if (kurtosis < 0) return '(Light tails)';
    return '(Normal)';
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate simple average
 */
function calculateSimpleAverage(grades) {
    if (!grades || grades.length === 0) return 0;
    return grades.reduce((a, g) => a + g.value, 0) / grades.length;
}

/**
 * Get trend icon
 */
function getTrendIcon(direction) {
    switch (direction) {
        case 'improving': return '📈';
        case 'declining': return '📉';
        default: return '➡️';
    }
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Escape HTML
 */
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

// ============================================================================
// Quick Analytics Widget
// ============================================================================

/**
 * Create a compact analytics widget for the grades page
 */
function createQuickAnalyticsWidget() {
    if (id('mod-quick-analytics')) return;
    
    const widget = document.createElement('div');
    widget.id = 'mod-quick-analytics';
    widget.className = 'mod-quick-analytics';
    widget.innerHTML = `
        <div class="mod-quick-header">
            <span>📊 Quick Stats</span>
            <button onclick="createAnalyticsDashboard()" title="Open full dashboard">↗️</button>
        </div>
        <div class="mod-quick-content" id="mod-quick-content">
            <div class="mod-quick-loading">Loading...</div>
        </div>
    `;
    
    // Insert after header or at top of grades content
    const target = document.querySelector('sl-cijfers, sl-vakgemiddelden, .grades-container');
    if (target) {
        target.insertBefore(widget, target.firstChild);
    } else {
        const header = document.querySelector('sl-header');
        if (header) {
            header.insertAdjacentElement('afterend', widget);
        }
    }
    
    // Load quick stats
    loadQuickStats();
}

/**
 * Load quick statistics
 */
async function loadQuickStats() {
    const content = id('mod-quick-content');
    if (!content) return;
    
    if (window.SomtodayAnalytics) {
        await window.SomtodayAnalytics.init();
    }
    
    const gradeElements = document.querySelectorAll('sl-resultaat-item, sl-vakgemiddelde-item, .cijfer');
    const grades = window.SomtodayAnalytics 
        ? window.SomtodayAnalytics.extractGradesFromDOM(gradeElements)
        : extractGradesManually(Array.from(gradeElements).map(el => el.closest('sl-resultaat-item, sl-vakgemiddelde-item') || el.parentElement));
    
    if (grades.length === 0) {
        content.innerHTML = '<div class="mod-quick-empty">No grades found</div>';
        return;
    }
    
    const avg = window.SomtodayAnalytics 
        ? window.SomtodayAnalytics.calculateWeightedAverage(grades)
        : calculateSimpleAverage(grades);
    
    const passing = grades.filter(g => g.value >= 5.5).length;
    const trend = window.SomtodayAnalytics 
        ? window.SomtodayAnalytics.calculateTrend(grades.map(g => [g.timestamp, g.value]))
        : { direction: 'stable' };
    
    content.innerHTML = `
        <div class="mod-quick-stat">
            <span class="mod-quick-value">${avg.toFixed(2).replace('.', ',')}</span>
            <span class="mod-quick-label">Average</span>
        </div>
        <div class="mod-quick-stat">
            <span class="mod-quick-value">${grades.length}</span>
            <span class="mod-quick-label">Grades</span>
        </div>
        <div class="mod-quick-stat">
            <span class="mod-quick-value">${((passing / grades.length) * 100).toFixed(0)}%</span>
            <span class="mod-quick-label">Pass Rate</span>
        </div>
        <div class="mod-quick-stat">
            <span class="mod-quick-value">${getTrendIcon(trend.direction)}</span>
            <span class="mod-quick-label">Trend</span>
        </div>
    `;
}

// ============================================================================
// Initialize
// ============================================================================

/**
 * Initialize analytics UI when on grades page
 */
function initAnalyticsUI() {
    // Quick Stats widget disabled - stats now shown in Profiel page
}

// Add to execution queue
if (typeof execute === 'function') {
    execute([initAnalyticsUI]);
}

// Export for use
window.AnalyticsUI = {
    createDashboard: createAnalyticsDashboard,
    closeDashboard: closeAnalyticsDashboard,
    createWidget: createQuickAnalyticsWidget,
    loadStats: loadQuickStats,
    calculateWhatIf: calculateWhatIfScenario,
    calculateTarget: calculateTargetGrade
};
