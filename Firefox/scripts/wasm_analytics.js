// WASM ANALYTICS ENGINE
// High-performance grade calculations, statistics, and predictions
// Provides a JavaScript bridge to the WebAssembly analytics module

// ============================================================================
// Module State
// ============================================================================

let wasmModule = null;
let wasmExports = null;
let wasmInitialized = false;
let wasmInitPromise = null;
let analyticsCache = new Map();
const CACHE_TTL = 60000; // 1 minute cache

// WASM memory helpers
let cachedDataViewMemory0 = null;
let cachedUint8ArrayMemory0 = null;
let WASM_VECTOR_LEN = 0;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || 
        (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasmExports.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasmExports.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasmExports.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const cachedTextEncoder = new TextEncoder();

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;
    const mem = getUint8ArrayMemory0();
    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);
        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }
    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasmExports.__wbindgen_externrefs.get(idx);
    wasmExports.__externref_table_dealloc(idx);
    return value;
}

// ============================================================================
// WASM Module Loader
// ============================================================================

/**
 * Initialize the WASM module
 * @returns {Promise<boolean>} True if WASM loaded successfully
 */
async function initWasmAnalytics() {
    if (wasmInitialized) {
        return true;
    }
    
    if (wasmInitPromise) {
        return wasmInitPromise;
    }
    
    wasmInitPromise = (async () => {
        try {
            // Check if chrome.runtime is available
            if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.getURL) {
                wasmInitialized = false;
                return false;
            }
            
            // Try to load WASM module
            const wasmUrl = chrome.runtime.getURL('wasm/pkg/somtoday_analytics_bg.wasm');
            
            const response = await fetch(wasmUrl);
            
            if (!response.ok) {
                wasmInitialized = false;
                return false;
            }
            
            const wasmBytes = await response.arrayBuffer();
            const imports = getWasmImports();
            const { instance } = await WebAssembly.instantiate(wasmBytes, imports);
            
            wasmExports = instance.exports;
            wasmModule = createWasmInterface();
            
            // Initialize the externref table
            if (wasmExports.__wbindgen_start) {
                wasmExports.__wbindgen_start();
            }
            
            wasmInitialized = true;
            console.log('Somtoday Mod: WASM Analytics loaded');
            return true;
        } catch (error) {
            wasmInitialized = false;
            return false;
        }
    })();
    
    return wasmInitPromise;
}

/**
 * Get WASM imports object (matches wasm-bindgen output)
 */
function getWasmImports() {
    const import0 = {
        __wbg_error_7534b8e9a36f1ab4: function(arg0, arg1) {
            let deferred0_0 = arg0;
            let deferred0_1 = arg1;
            try {
                console.error(getStringFromWasm0(arg0, arg1));
            } finally {
                wasmExports.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        },
        __wbg_new_8a6f238a6ece86ea: function() {
            return new Error();
        },
        __wbg_stack_0ed75d68575b0f3c: function(arg0, arg1) {
            const ret = arg1.stack;
            const ptr1 = passStringToWasm0(ret, wasmExports.__wbindgen_malloc, wasmExports.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            return getStringFromWasm0(arg0, arg1);
        },
        __wbindgen_init_externref_table: function() {
            const table = wasmExports.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        "./somtoday_analytics_bg.js": import0,
    };
}

/**
 * Create high-level interface to WASM functions
 */
function createWasmInterface() {
    // Helper for string return with cleanup
    const callStringReturn = (fn, ...args) => {
        let deferred0 = 0, deferred1 = 0;
        try {
            const ret = fn(...args);
            deferred0 = ret[0];
            deferred1 = ret[1];
            if (ret[3]) {
                deferred0 = 0; deferred1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            if (deferred0) wasmExports.__wbindgen_free(deferred0, deferred1, 1);
        }
    };

    // Helper to pass a string argument
    const passStr = (str) => {
        const ptr = passStringToWasm0(str, wasmExports.__wbindgen_malloc, wasmExports.__wbindgen_realloc);
        return [ptr, WASM_VECTOR_LEN];
    };

    return {
        health_check: () => {
            try { return wasmExports.health_check() !== 0; } catch { return false; }
        },
        get_version: () => {
            try {
                let d0 = 0, d1 = 0;
                try {
                    const ret = wasmExports.get_version();
                    d0 = ret[0]; d1 = ret[1];
                    return getStringFromWasm0(ret[0], ret[1]);
                } finally {
                    if (d0) wasmExports.__wbindgen_free(d0, d1, 1);
                }
            } catch { return '1.0.0'; }
        },
        calculate_weighted_average: (gradesJson) => {
            const [ptr, len] = passStr(gradesJson);
            const ret = wasmExports.calculate_weighted_average(ptr, len);
            if (ret[2]) throw takeFromExternrefTable0(ret[1]);
            return ret[0];
        },
        calculate_average: (gradesJson) => {
            const [ptr, len] = passStr(gradesJson);
            const ret = wasmExports.calculate_average(ptr, len);
            if (ret[2]) throw takeFromExternrefTable0(ret[1]);
            return ret[0];
        },
        calculate_gpa: (gradesJson, scaleJson) => {
            const [ptr0, len0] = passStr(gradesJson);
            const [ptr1, len1] = passStr(scaleJson);
            const ret = wasmExports.calculate_gpa(ptr0, len0, ptr1, len1);
            if (ret[2]) throw takeFromExternrefTable0(ret[1]);
            return ret[0];
        },
        calculate_subject_average: (gradesJson, subject) => {
            const [ptr0, len0] = passStr(gradesJson);
            const [ptr1, len1] = passStr(subject);
            const ret = wasmExports.calculate_subject_average(ptr0, len0, ptr1, len1);
            if (ret[2]) throw takeFromExternrefTable0(ret[1]);
            return ret[0];
        },
        calculate_statistics: (dataJson) => {
            const [ptr, len] = passStr(dataJson);
            return callStringReturn((p, l) => wasmExports.calculate_statistics(p, l), ptr, len);
        },
        calculate_percentile: (dataJson, percentile) => {
            const [ptr, len] = passStr(dataJson);
            const ret = wasmExports.calculate_percentile(ptr, len, percentile);
            if (ret[2]) throw takeFromExternrefTable0(ret[1]);
            return ret[0];
        },
        calculate_correlation: (data1Json, data2Json) => {
            const [ptr0, len0] = passStr(data1Json);
            const [ptr1, len1] = passStr(data2Json);
            const ret = wasmExports.calculate_correlation(ptr0, len0, ptr1, len1);
            if (ret[2]) throw takeFromExternrefTable0(ret[1]);
            return ret[0];
        },
        calculate_trend: (dataJson) => {
            const [ptr, len] = passStr(dataJson);
            return callStringReturn((p, l) => wasmExports.calculate_trend(p, l), ptr, len);
        },
        calculate_pass_fail_stats: (gradesJson) => {
            const [ptr, len] = passStr(gradesJson);
            return callStringReturn((p, l) => wasmExports.calculate_pass_fail_stats(p, l), ptr, len);
        },
        analyze_all_grades: (gradesJson) => {
            const [ptr, len] = passStr(gradesJson);
            return callStringReturn((p, l) => wasmExports.analyze_all_grades(p, l), ptr, len);
        },
        get_all_subjects: (gradesJson) => {
            const [ptr, len] = passStr(gradesJson);
            return callStringReturn((p, l) => wasmExports.get_all_subjects(p, l), ptr, len);
        },
        get_subject_summary: (gradesJson, subject) => {
            const [ptr0, len0] = passStr(gradesJson);
            const [ptr1, len1] = passStr(subject);
            let d0 = 0, d1 = 0;
            try {
                const ret = wasmExports.get_subject_summary(ptr0, len0, ptr1, len1);
                d0 = ret[0]; d1 = ret[1];
                if (ret[3]) { d0 = 0; d1 = 0; throw takeFromExternrefTable0(ret[2]); }
                return getStringFromWasm0(ret[0], ret[1]);
            } finally {
                if (d0) wasmExports.__wbindgen_free(d0, d1, 1);
            }
        },
        predict_grade_needed: (currentAvg, totalWeight, targetAvg, newWeight) => {
            const ret = wasmExports.predict_grade_needed(currentAvg, totalWeight, targetAvg, newWeight);
            if (ret[2]) throw takeFromExternrefTable0(ret[1]);
            return ret[0];
        },
        predict_next_grade: (gradesJson) => {
            const [ptr, len] = passStr(gradesJson);
            return callStringReturn((p, l) => wasmExports.predict_next_grade(p, l), ptr, len);
        },
        calculate_whatif: (gradesJson, hypotheticalJson) => {
            const [ptr0, len0] = passStr(gradesJson);
            const [ptr1, len1] = passStr(hypotheticalJson);
            let d0 = 0, d1 = 0;
            try {
                const ret = wasmExports.calculate_whatif(ptr0, len0, ptr1, len1);
                d0 = ret[0]; d1 = ret[1];
                if (ret[3]) { d0 = 0; d1 = 0; throw takeFromExternrefTable0(ret[2]); }
                return getStringFromWasm0(ret[0], ret[1]);
            } finally {
                if (d0) wasmExports.__wbindgen_free(d0, d1, 1);
            }
        },
        generate_impact_analysis: (gradesJson, subject, weight) => {
            const [ptr0, len0] = passStr(gradesJson);
            const [ptr1, len1] = passStr(subject);
            let d0 = 0, d1 = 0;
            try {
                const ret = wasmExports.generate_impact_analysis(ptr0, len0, ptr1, len1, weight);
                d0 = ret[0]; d1 = ret[1];
                if (ret[3]) { d0 = 0; d1 = 0; throw takeFromExternrefTable0(ret[2]); }
                return getStringFromWasm0(ret[0], ret[1]);
            } finally {
                if (d0) wasmExports.__wbindgen_free(d0, d1, 1);
            }
        },
        calculate_grades_for_targets: (gradesJson, subject, weight, targetsJson) => {
            const [ptr0, len0] = passStr(gradesJson);
            const [ptr1, len1] = passStr(subject);
            const [ptr2, len2] = passStr(targetsJson);
            let d0 = 0, d1 = 0;
            try {
                const ret = wasmExports.calculate_grades_for_targets(ptr0, len0, ptr1, len1, weight, ptr2, len2);
                d0 = ret[0]; d1 = ret[1];
                if (ret[3]) { d0 = 0; d1 = 0; throw takeFromExternrefTable0(ret[2]); }
                return getStringFromWasm0(ret[0], ret[1]);
            } finally {
                if (d0) wasmExports.__wbindgen_free(d0, d1, 1);
            }
        },
        parse_grade: (gradeStr) => {
            const [ptr, len] = passStr(gradeStr);
            const ret = wasmExports.parse_grade(ptr, len);
            if (ret[2]) throw takeFromExternrefTable0(ret[1]);
            return ret[0];
        },
        validate_grade: (value) => {
            return wasmExports.validate_grade(value) !== 0;
        },
        format_grade: (value, decimals) => {
            let d0 = 0, d1 = 0;
            try {
                const ret = wasmExports.format_grade(value, decimals);
                d0 = ret[0]; d1 = ret[1];
                return getStringFromWasm0(ret[0], ret[1]);
            } finally {
                if (d0) wasmExports.__wbindgen_free(d0, d1, 1);
            }
        },
    };
}

/**
 * Get WASM module version
 */
function getWasmVersion() {
    if (!wasmInitialized || !wasmModule) return 'N/A';
    try {
        return wasmModule.get_version();
    } catch {
        return '1.0.0';
    }
}

/**
 * Check if WASM is available
 */
function isWasmAvailable() {
    return wasmInitialized && wasmModule !== null;
}

// ============================================================================
// Caching Layer
// ============================================================================

/**
 * Get cached result or compute new one
 */
function getCached(key, computeFn) {
    const cached = analyticsCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.value;
    }
    
    const value = computeFn();
    analyticsCache.set(key, { value, timestamp: Date.now() });
    return value;
}

/**
 * Clear analytics cache
 */
function clearAnalyticsCache() {
    analyticsCache.clear();
}

/**
 * Generate cache key from arguments
 */
function cacheKey(...args) {
    return JSON.stringify(args);
}

// ============================================================================
// Grade Data Transformation
// ============================================================================

/**
 * Transform DOM grade elements to Grade objects
 * @param {NodeList|Array} elements - Grade DOM elements
 * @returns {Array} Array of Grade objects
 */
function extractGradesFromDOM(elements) {
    const grades = [];
    
    if (!elements || elements.length === 0) {
        return grades;
    }
    
    for (const element of elements) {
        try {
            const gradeData = parseGradeElement(element);
            if (gradeData) {
                grades.push(gradeData);
            }
        } catch (error) {
            console.warn('Failed to parse grade element:', error);
        }
    }
    
    return grades;
}

/**
 * Parse a single grade element
 */
function parseGradeElement(element) {
    // Try to find the grade value
    const cijferElement = element.querySelector('.cijfer') || element.getElementsByClassName('cijfer')[0];
    if (!cijferElement) return null;
    
    const valueText = cijferElement.textContent || cijferElement.innerText;
    const value = parseGradeValue(valueText);
    
    if (isNaN(value)) return null;
    
    // Extract subject
    const subjectElement = element.querySelector('.titel, .vak, .subject');
    const subject = subjectElement ? subjectElement.textContent.trim() : 'Unknown';
    
    // Extract description
    const descElement = element.querySelector('.subtitel, .omschrijving, .description');
    const description = descElement ? descElement.textContent.trim() : '';
    
    // Extract weight (default to 1)
    const weightElement = element.querySelector('.weging, .weight');
    const weight = weightElement ? parseFloat(weightElement.textContent) || 1.0 : 1.0;
    
    // Extract or estimate timestamp
    const dateElement = element.querySelector('.datum, .date');
    const timestamp = dateElement ? new Date(dateElement.textContent).getTime() : Date.now();
    
    return {
        value,
        weight,
        subject,
        description,
        timestamp,
        is_passing: value >= 5.5
    };
}

/**
 * Parse a grade value from string
 * Handles Dutch format (comma) and international format (dot)
 */
function parseGradeValue(str) {
    if (!str) return NaN;
    const normalized = str.toString().trim().replace(',', '.');
    return parseFloat(normalized);
}

/**
 * Format a grade value for display
 * @param {number} value - Grade value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted grade string
 */
function formatGrade(value, decimals = 1) {
    if (isNaN(value)) return '-';
    return value.toFixed(decimals).replace('.', ',');
}

/**
 * Validate a grade value
 */
function validateGrade(value) {
    const num = parseGradeValue(value);
    return !isNaN(num) && num >= 1.0 && num <= 10.0;
}

// ============================================================================
// Analytics Functions - Grade Calculations
// ============================================================================

/**
 * Calculate simple average of grades
 * @param {Array} grades - Array of grade objects
 * @returns {number} Simple average
 */
function calculateAverage(grades) {
    if (!grades || grades.length === 0) return 0;
    
    const key = cacheKey('avg', grades);
    return getCached(key, () => {
        if (isWasmAvailable()) {
            try {
                return wasmModule.calculate_average(JSON.stringify(grades));
            } catch (e) {
                console.warn('WASM calculate_average failed:', e);
            }
        }
        
        // JavaScript fallback
        const sum = grades.reduce((acc, g) => acc + g.value, 0);
        return sum / grades.length;
    });
}

/**
 * Calculate weighted average of grades
 * @param {Array} grades - Array of grade objects with weights
 * @returns {number} Weighted average
 */
function calculateWeightedAverage(grades) {
    if (!grades || grades.length === 0) return 0;
    
    const key = cacheKey('wavg', grades);
    return getCached(key, () => {
        if (isWasmAvailable()) {
            try {
                return wasmModule.calculate_weighted_average(JSON.stringify(grades));
            } catch (e) {
                console.warn('WASM calculate_weighted_average failed:', e);
            }
        }
        
        // JavaScript fallback
        const totalWeight = grades.reduce((acc, g) => acc + (g.weight || 1), 0);
        if (totalWeight === 0) return calculateAverage(grades);
        
        const weightedSum = grades.reduce((acc, g) => acc + g.value * (g.weight || 1), 0);
        return weightedSum / totalWeight;
    });
}

/**
 * Calculate GPA from grades
 * @param {Array} grades - Array of grade objects
 * @param {Object} scale - GPA scale configuration
 * @returns {number} GPA value
 */
function calculateGPA(grades, scale = {}) {
    if (!grades || grades.length === 0) return 0;
    
    const defaultScale = {
        max_grade: 10.0,
        passing_grade: 5.5,
        gpa_max: 4.0
    };
    
    const mergedScale = { ...defaultScale, ...scale };
    const key = cacheKey('gpa', grades, mergedScale);
    
    return getCached(key, () => {
        if (isWasmAvailable()) {
            try {
                return wasmModule.calculate_gpa(JSON.stringify(grades), JSON.stringify(mergedScale));
            } catch (e) {
                console.warn('WASM calculate_gpa failed:', e);
            }
        }
        
        // JavaScript fallback
        const weightedAvg = calculateWeightedAverage(grades);
        const normalized = (weightedAvg - 1) / (mergedScale.max_grade - 1);
        return Math.max(0, Math.min(mergedScale.gpa_max, normalized * mergedScale.gpa_max));
    });
}

/**
 * Calculate average for a specific subject
 * @param {Array} grades - All grades
 * @param {string} subject - Subject name
 * @returns {number} Subject average
 */
function calculateSubjectAverage(grades, subject) {
    if (!grades || grades.length === 0 || !subject) return 0;
    
    const key = cacheKey('subavg', grades, subject.toLowerCase());
    return getCached(key, () => {
        if (isWasmAvailable()) {
            try {
                return wasmModule.calculate_subject_average(JSON.stringify(grades), subject);
            } catch (e) {
                console.warn('WASM calculate_subject_average failed:', e);
            }
        }
        
        // JavaScript fallback
        const subjectGrades = grades.filter(g => 
            g.subject.toLowerCase() === subject.toLowerCase()
        );
        return calculateWeightedAverage(subjectGrades);
    });
}

/**
 * Get all unique subjects from grades
 */
function getSubjects(grades) {
    if (!grades || grades.length === 0) return [];
    
    const subjects = new Set();
    for (const grade of grades) {
        if (grade.subject) {
            subjects.add(grade.subject);
        }
    }
    return Array.from(subjects).sort();
}

/**
 * Get subject summary with all statistics
 */
function getSubjectSummary(grades, subject) {
    if (!grades || grades.length === 0 || !subject) return null;
    
    const key = cacheKey('subsummary', grades, subject.toLowerCase());
    return getCached(key, () => {
        if (isWasmAvailable()) {
            try {
                const result = wasmModule.get_subject_summary(JSON.stringify(grades), subject);
                return JSON.parse(result);
            } catch (e) {
                console.warn('WASM get_subject_summary failed:', e);
            }
        }
        
        // JavaScript fallback
        const subjectGrades = grades.filter(g => 
            g.subject.toLowerCase() === subject.toLowerCase()
        );
        
        if (subjectGrades.length === 0) {
            return {
                subject,
                average: 0,
                weighted_average: 0,
                grade_count: 0,
                total_weight: 0,
                highest: 0,
                lowest: 0,
                passing_count: 0,
                failing_count: 0,
                trend: 0,
                predicted_next: 0
            };
        }
        
        const values = subjectGrades.map(g => g.value);
        const weights = subjectGrades.map(g => g.weight || 1);
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        
        return {
            subject,
            average: values.reduce((a, b) => a + b, 0) / values.length,
            weighted_average: calculateWeightedAverage(subjectGrades),
            grade_count: subjectGrades.length,
            total_weight: totalWeight,
            highest: Math.max(...values),
            lowest: Math.min(...values),
            passing_count: subjectGrades.filter(g => g.value >= 5.5).length,
            failing_count: subjectGrades.filter(g => g.value < 5.5).length,
            trend: calculateTrendSlope(subjectGrades),
            predicted_next: predictNextGrade(subjectGrades).predicted_value
        };
    });
}

/**
 * Get all subjects with their summaries
 */
function getAllSubjectSummaries(grades) {
    if (!grades || grades.length === 0) return [];
    
    const key = cacheKey('allsummaries', grades);
    return getCached(key, () => {
        if (isWasmAvailable()) {
            try {
                const result = wasmModule.get_all_subjects(JSON.stringify(grades));
                return JSON.parse(result);
            } catch (e) {
                console.warn('WASM get_all_subjects failed:', e);
            }
        }
        
        // JavaScript fallback
        const subjects = getSubjects(grades);
        return subjects.map(s => getSubjectSummary(grades, s));
    });
}

// ============================================================================
// Analytics Functions - Statistics
// ============================================================================

/**
 * Calculate comprehensive statistics
 * @param {Array} data - Array of numeric values
 * @returns {Object} Statistics object
 */
function calculateStatistics(data) {
    if (!data || data.length === 0) {
        return {
            count: 0, sum: 0, mean: 0, median: 0, mode: [],
            min: 0, max: 0, range: 0, variance: 0, std_deviation: 0,
            percentile_25: 0, percentile_50: 0, percentile_75: 0, percentile_90: 0,
            iqr: 0, skewness: 0, kurtosis: 0
        };
    }
    
    const key = cacheKey('stats', data);
    return getCached(key, () => {
        if (isWasmAvailable()) {
            try {
                const result = wasmModule.calculate_statistics(JSON.stringify(data));
                return JSON.parse(result);
            } catch (e) {
                console.warn('WASM calculate_statistics failed:', e);
            }
        }
        
        // JavaScript fallback
        return calculateStatisticsJS(data);
    });
}

/**
 * JavaScript fallback for statistics calculation
 */
function calculateStatisticsJS(data) {
    const sorted = [...data].sort((a, b) => a - b);
    const n = data.length;
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    
    // Median
    const median = n % 2 === 0 
        ? (sorted[n/2 - 1] + sorted[n/2]) / 2 
        : sorted[Math.floor(n/2)];
    
    // Mode
    const frequency = {};
    data.forEach(v => frequency[v] = (frequency[v] || 0) + 1);
    const maxFreq = Math.max(...Object.values(frequency));
    const mode = maxFreq > 1 
        ? Object.entries(frequency).filter(([_, f]) => f === maxFreq).map(([v]) => parseFloat(v))
        : [];
    
    // Variance and std deviation
    const variance = n > 1 
        ? data.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1)
        : 0;
    const std_deviation = Math.sqrt(variance);
    
    // Percentiles
    const percentile = (p) => {
        const index = (p / 100) * (n - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    };
    
    const p25 = percentile(25);
    const p50 = percentile(50);
    const p75 = percentile(75);
    const p90 = percentile(90);
    
    // Skewness
    const skewness = n >= 3 && std_deviation > 0
        ? (n / ((n-1) * (n-2))) * data.reduce((acc, v) => acc + Math.pow((v - mean) / std_deviation, 3), 0)
        : 0;
    
    // Kurtosis
    const kurtosis = n >= 4 && std_deviation > 0
        ? (n * (n+1) / ((n-1) * (n-2) * (n-3))) * 
          data.reduce((acc, v) => acc + Math.pow((v - mean) / std_deviation, 4), 0) -
          (3 * Math.pow(n-1, 2)) / ((n-2) * (n-3))
        : 0;
    
    return {
        count: n,
        sum,
        mean,
        median,
        mode,
        min: sorted[0],
        max: sorted[n-1],
        range: sorted[n-1] - sorted[0],
        variance,
        std_deviation,
        percentile_25: p25,
        percentile_50: p50,
        percentile_75: p75,
        percentile_90: p90,
        iqr: p75 - p25,
        skewness,
        kurtosis
    };
}

/**
 * Calculate percentile of a value in a dataset
 */
function calculatePercentile(data, percentile) {
    if (!data || data.length === 0) return 0;
    
    if (isWasmAvailable()) {
        try {
            return wasmModule.calculate_percentile(JSON.stringify(data), percentile);
        } catch (e) {
            console.warn('WASM calculate_percentile failed:', e);
        }
    }
    
    // JavaScript fallback
    const sorted = [...data].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Calculate trend from time series data
 */
function calculateTrend(timeSeries) {
    if (!timeSeries || timeSeries.length < 2) {
        return {
            slope: 0, intercept: 0, r_squared: 0,
            direction: 'stable', strength: 'none',
            predicted_values: []
        };
    }
    
    const key = cacheKey('trend', timeSeries);
    return getCached(key, () => {
        if (isWasmAvailable()) {
            try {
                const result = wasmModule.calculate_trend(JSON.stringify(timeSeries));
                return JSON.parse(result);
            } catch (e) {
                console.warn('WASM calculate_trend failed:', e);
            }
        }
        
        // JavaScript fallback
        return calculateTrendJS(timeSeries);
    });
}

/**
 * JavaScript fallback for trend calculation
 */
function calculateTrendJS(timeSeries) {
    const n = timeSeries.length;
    const minTime = Math.min(...timeSeries.map(([t]) => t));
    const normalized = timeSeries.map(([t, v]) => [t - minTime, v]);
    
    const sumX = normalized.reduce((acc, [x]) => acc + x, 0);
    const sumY = normalized.reduce((acc, [_, y]) => acc + y, 0);
    const sumXY = normalized.reduce((acc, [x, y]) => acc + x * y, 0);
    const sumX2 = normalized.reduce((acc, [x]) => acc + x * x, 0);
    const sumY2 = normalized.reduce((acc, [_, y]) => acc + y * y, 0);
    
    const denominator = n * sumX2 - sumX * sumX;
    if (Math.abs(denominator) < 1e-10) {
        return {
            slope: 0, intercept: sumY / n, r_squared: 0,
            direction: 'stable', strength: 'none',
            predicted_values: normalized.map(() => sumY / n)
        };
    }
    
    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    
    const meanY = sumY / n;
    const ssTot = normalized.reduce((acc, [_, y]) => acc + Math.pow(y - meanY, 2), 0);
    const ssRes = normalized.reduce((acc, [x, y]) => acc + Math.pow(y - (slope * x + intercept), 2), 0);
    const r_squared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;
    
    const direction = Math.abs(slope) < 0.001 ? 'stable' : slope > 0 ? 'improving' : 'declining';
    const strength = r_squared < 0.1 ? 'none' : r_squared < 0.3 ? 'weak' : r_squared < 0.6 ? 'moderate' : 'strong';
    
    return {
        slope,
        intercept,
        r_squared,
        direction,
        strength,
        predicted_values: normalized.map(([x]) => slope * x + intercept)
    };
}

/**
 * Helper to calculate just the trend slope from grades
 */
function calculateTrendSlope(grades) {
    if (!grades || grades.length < 2) return 0;
    
    const timeSeries = grades
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(g => [g.timestamp, g.value]);
    
    return calculateTrend(timeSeries).slope;
}

// ============================================================================
// Analytics Functions - Predictions
// ============================================================================

/**
 * Predict grade needed to achieve target average
 */
function predictGradeNeeded(currentAverage, currentTotalWeight, targetAverage, newGradeWeight) {
    if (isWasmAvailable()) {
        try {
            return wasmModule.predict_grade_needed(currentAverage, currentTotalWeight, targetAverage, newGradeWeight);
        } catch (e) {
            console.warn('WASM predict_grade_needed failed:', e);
        }
    }
    
    // JavaScript fallback
    const totalWeight = currentTotalWeight + newGradeWeight;
    return (targetAverage * totalWeight - currentAverage * currentTotalWeight) / newGradeWeight;
}

/**
 * Predict next grade based on history
 */
function predictNextGrade(grades) {
    if (!grades || grades.length === 0) {
        return {
            predicted_value: 0,
            confidence: 0,
            lower_bound: 0,
            upper_bound: 0,
            method: 'none'
        };
    }
    
    const key = cacheKey('predict', grades);
    return getCached(key, () => {
        if (isWasmAvailable()) {
            try {
                const result = wasmModule.predict_next_grade(JSON.stringify(grades));
                return JSON.parse(result);
            } catch (e) {
                console.warn('WASM predict_next_grade failed:', e);
            }
        }
        
        // JavaScript fallback - simple weighted average of recent grades
        const sorted = [...grades].sort((a, b) => a.timestamp - b.timestamp);
        let weightedSum = 0;
        let totalWeight = 0;
        
        for (let i = 0; i < sorted.length; i++) {
            const weight = Math.pow(i + 1, 2); // Quadratic weighting
            weightedSum += sorted[i].value * weight;
            totalWeight += weight;
        }
        
        const predicted = weightedSum / totalWeight;
        const values = sorted.map(g => g.value);
        const stats = calculateStatisticsJS(values);
        
        return {
            predicted_value: Math.max(1, Math.min(10, predicted)),
            confidence: Math.max(0.1, Math.min(0.9, 1 - stats.std_deviation / 5)),
            lower_bound: Math.max(1, predicted - 2 * stats.std_deviation),
            upper_bound: Math.min(10, predicted + 2 * stats.std_deviation),
            method: 'weighted_average'
        };
    });
}

/**
 * Calculate what-if scenario
 */
function calculateWhatIf(grades, hypotheticalGrades) {
    if (!grades && !hypotheticalGrades) {
        return {
            current_average: 0,
            new_average: 0,
            change: 0,
            change_percent: 0,
            grades_needed_for_target: [],
            impact_analysis: []
        };
    }
    
    const key = cacheKey('whatif', grades, hypotheticalGrades);
    return getCached(key, () => {
        if (isWasmAvailable()) {
            try {
                const result = wasmModule.calculate_whatif(
                    JSON.stringify(grades || []),
                    JSON.stringify(hypotheticalGrades || [])
                );
                return JSON.parse(result);
            } catch (e) {
                console.warn('WASM calculate_whatif failed:', e);
            }
        }
        
        // JavaScript fallback
        return calculateWhatIfJS(grades || [], hypotheticalGrades || []);
    });
}

/**
 * JavaScript fallback for what-if calculation
 */
function calculateWhatIfJS(grades, hypothetical) {
    const currentAvg = calculateWeightedAverage(grades);
    const currentWeight = grades.reduce((acc, g) => acc + (g.weight || 1), 0);
    
    const allGrades = [...grades, ...hypothetical];
    const newAvg = calculateWeightedAverage(allGrades);
    const newWeight = allGrades.reduce((acc, g) => acc + (g.weight || 1), 0);
    
    const change = newAvg - currentAvg;
    const changePercent = currentAvg > 0 ? (change / currentAvg) * 100 : 0;
    
    const defaultWeight = hypothetical.length > 0 ? (hypothetical[0].weight || 1) : 1;
    const targets = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0];
    
    const gradesNeeded = targets.map(target => {
        const gradeNeeded = predictGradeNeeded(newAvg, newWeight, target, defaultWeight);
        return {
            target_average: target,
            grade_needed: gradeNeeded,
            weight: defaultWeight,
            achievable: gradeNeeded >= 1 && gradeNeeded <= 10
        };
    });
    
    const impactAnalysis = [];
    for (let g = 1; g <= 10; g += 0.5) {
        const resultingAvg = (newAvg * newWeight + g * defaultWeight) / (newWeight + defaultWeight);
        impactAnalysis.push({
            hypothetical_grade: g,
            resulting_average: resultingAvg,
            impact: resultingAvg - newAvg
        });
    }
    
    return {
        current_average: currentAvg,
        new_average: newAvg,
        change,
        change_percent: changePercent,
        grades_needed_for_target: gradesNeeded,
        impact_analysis: impactAnalysis
    };
}

/**
 * Generate impact analysis
 */
function generateImpactAnalysis(grades, subject, weight) {
    if (isWasmAvailable()) {
        try {
            const result = wasmModule.generate_impact_analysis(JSON.stringify(grades), subject, weight);
            return JSON.parse(result);
        } catch (e) {
            console.warn('WASM generate_impact_analysis failed:', e);
        }
    }
    
    // JavaScript fallback
    const subjectGrades = grades.filter(g => g.subject.toLowerCase() === subject.toLowerCase());
    const currentAvg = calculateWeightedAverage(subjectGrades);
    const currentWeight = subjectGrades.reduce((acc, g) => acc + (g.weight || 1), 0);
    
    const analysis = [];
    for (let g = 1; g <= 10; g += 0.5) {
        const resultingAvg = (currentAvg * currentWeight + g * weight) / (currentWeight + weight);
        analysis.push({
            hypothetical_grade: g,
            resulting_average: resultingAvg,
            impact: resultingAvg - currentAvg
        });
    }
    
    return analysis;
}

/**
 * Calculate grades needed for various targets
 */
function calculateGradesForTargets(grades, subject, weight, targets) {
    if (isWasmAvailable()) {
        try {
            const result = wasmModule.calculate_grades_for_targets(
                JSON.stringify(grades),
                subject,
                weight,
                JSON.stringify(targets)
            );
            return JSON.parse(result);
        } catch (e) {
            console.warn('WASM calculate_grades_for_targets failed:', e);
        }
    }
    
    // JavaScript fallback
    const subjectGrades = grades.filter(g => g.subject.toLowerCase() === subject.toLowerCase());
    const currentAvg = calculateWeightedAverage(subjectGrades);
    const currentWeight = subjectGrades.reduce((acc, g) => acc + (g.weight || 1), 0);
    
    return targets.map(target => {
        const gradeNeeded = predictGradeNeeded(currentAvg, currentWeight, target, weight);
        return {
            target_average: target,
            grade_needed: gradeNeeded,
            weight,
            achievable: gradeNeeded >= 1 && gradeNeeded <= 10
        };
    });
}

// ============================================================================
// Full Analytics
// ============================================================================

/**
 * Perform complete analytics on all grades
 */
function analyzeAllGrades(grades) {
    if (!grades || grades.length === 0) {
        return {
            overall_average: 0,
            weighted_average: 0,
            gpa: 0,
            total_grades: 0,
            passing_grades: 0,
            failing_grades: 0,
            pass_rate: 0,
            subjects: [],
            statistics: calculateStatistics([]),
            trend: { slope: 0, intercept: 0, r_squared: 0, direction: 'stable', strength: 'none', predicted_values: [] },
            predictions: []
        };
    }
    
    const key = cacheKey('analyzeAll', grades);
    return getCached(key, () => {
        if (isWasmAvailable()) {
            try {
                const result = wasmModule.analyze_all_grades(JSON.stringify(grades));
                return JSON.parse(result);
            } catch (e) {
                console.warn('WASM analyze_all_grades failed:', e);
            }
        }
        
        // JavaScript fallback
        const values = grades.map(g => g.value);
        const passingGrades = grades.filter(g => g.value >= 5.5);
        const subjects = getAllSubjectSummaries(grades);
        
        const timeSeries = grades
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(g => [g.timestamp, g.value]);
        
        return {
            overall_average: calculateAverage(grades),
            weighted_average: calculateWeightedAverage(grades),
            gpa: calculateGPA(grades),
            total_grades: grades.length,
            passing_grades: passingGrades.length,
            failing_grades: grades.length - passingGrades.length,
            pass_rate: (passingGrades.length / grades.length) * 100,
            subjects,
            statistics: calculateStatistics(values),
            trend: calculateTrend(timeSeries),
            predictions: subjects.map(s => predictNextGrade(grades.filter(g => g.subject === s.subject)))
        };
    });
}

// ============================================================================
// Export
// ============================================================================

// Initialize WASM on load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        initWasmAnalytics().catch(console.error);
    });
}

// Export functions for use in other scripts
window.SomtodayAnalytics = {
    // Initialization
    init: initWasmAnalytics,
    isReady: () => wasmInitialized,
    isWasmAvailable,
    getVersion: getWasmVersion,
    clearCache: clearAnalyticsCache,
    
    // Data transformation
    extractGradesFromDOM,
    parseGradeValue,
    formatGrade,
    validateGrade,
    
    // Grade calculations
    calculateAverage,
    calculateWeightedAverage,
    calculateGPA,
    calculateSubjectAverage,
    getSubjects,
    getSubjectSummary,
    getAllSubjectSummaries,
    
    // Statistics
    calculateStatistics,
    calculatePercentile,
    calculateTrend,
    
    // Predictions
    predictGradeNeeded,
    predictNextGrade,
    calculateWhatIf,
    generateImpactAnalysis,
    calculateGradesForTargets,
    
    // Full analytics
    analyzeAllGrades
};
