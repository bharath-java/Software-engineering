// Simulation global state variables
let state = {
    dataset: [],
    trainSet: [],
    testSet: [],
    baselineModel: null,
    activeModel: null,
    metrics: {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1: 0,
        diRatio: 0,
        spd: 0,
        eod: 0,
        srMale: 0,
        srFemale: 0
    },
    baselineMetrics: null, // to keep for comparison in charts
    charts: {
        metrics: null,
        selection: null
    }
};

// ---------------------------------------------------------
// Tab Navigation Logic
// ---------------------------------------------------------
function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    if (tabId === 'simulation') document.getElementById('nav-btn-sim').classList.add('active');
    if (tabId === 'ethics') document.getElementById('nav-btn-ethics').classList.add('active');
    if (tabId === 'downloads') document.getElementById('nav-btn-docs').classList.add('active');
}

function switchEthicsSubTab(subTabId) {
    document.querySelectorAll('.ethics-sub-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.ethics-tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`ethics-sub-${subTabId}`).classList.add('active');
    event.currentTarget.classList.add('active');
}

function updateRangeLabel(inputId) {
    const val = document.getElementById(inputId).value;
    document.getElementById(`${inputId}-val`).textContent = val;
}

// ---------------------------------------------------------
// 1. Synthetic Data Generation in JavaScript
// ---------------------------------------------------------
function generateData(numSamples, biasRate) {
    const dataset = [];
    
    for (let i = 1; i <= numSamples; i++) {
        // Gender: 50% Male (0), 50% Female (1)
        const genderVal = Math.random() < 0.5 ? 0 : 1;
        const gender = genderVal === 0 ? 'Male' : 'Female';
        
        // Experience: 1 to 15 years
        const experience = Math.floor(Math.random() * 15) + 1;
        
        // Test Score: Normal distribution approximation around 70, sd 15
        let u1 = Math.random();
        let u2 = Math.random();
        let randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        let testScore = Math.round(70 + randStdNormal * 15);
        testScore = Math.max(30, Math.min(100, testScore));
        
        // Education level: Bachelor (0), Master (1), PhD (2)
        const eduRand = Math.random();
        let educationVal = 0;
        if (eduRand > 0.5 && eduRand <= 0.8) educationVal = 1;
        else if (eduRand > 0.8) educationVal = 2;
        const education = educationVal === 0 ? 'Bachelor' : (educationVal === 1 ? 'Master' : 'PhD');
        
        // Latent qualification score (fully fair, qualifications-based)
        const q = 0.25 * experience + 0.04 * testScore + 0.8 * educationVal;
        
        // Historical bias simulation
        // Male logit: q - 3.5
        // Female logit: q - 3.5 - biasRate
        let logit = q - 3.5;
        if (genderVal === 1) {
            logit -= biasRate;
        }
        
        const probHired = 1 / (1 + Math.exp(-logit));
        const hired = Math.random() < probHired ? 1 : 0;
        
        dataset.push({
            id: `CAN_${String(i).padStart(4, '0')}`,
            gender,
            genderVal,
            experience,
            testScore,
            education,
            educationVal,
            hired
        });
    }
    return dataset;
}

// ---------------------------------------------------------
// 2. Custom Logistic Regression Trainer via Gradient Descent
// ---------------------------------------------------------
// Normalizes features to [0, 1] range to ensure GD convergence
function preprocessFeatures(candidates) {
    return candidates.map(c => {
        const x1 = (c.experience - 1) / 14;          // exp min 1 max 15
        const x2 = (c.testScore - 30) / 70;          // test score min 30 max 100
        const x3 = c.educationVal / 2;               // edu code min 0 max 2
        return [x1, x2, x3];
    });
}

function trainLogisticRegression(X, y, weights, epochs = 180, lr = 0.4) {
    let w = [0.0, 0.0, 0.0];
    let b = 0.0;
    const m = X.length;
    
    // Default weights to 1.0 if not provided
    const sampleWeights = weights || Array(m).fill(1.0);
    
    for (let epoch = 0; epoch < epochs; epoch++) {
        let dw = [0.0, 0.0, 0.0];
        let db = 0.0;
        let weightSum = 0.0;
        
        for (let i = 0; i < m; i++) {
            const x_i = X[i];
            const y_i = y[i];
            const w_i = sampleWeights[i];
            weightSum += w_i;
            
            // Logit prediction
            const z = w[0] * x_i[0] + w[1] * x_i[1] + w[2] * x_i[2] + b;
            const pred = 1 / (1 + Math.exp(-z));
            
            // Gradient with sample weight applied
            const diff = (pred - y_i) * w_i;
            dw[0] += diff * x_i[0];
            dw[1] += diff * x_i[1];
            dw[2] += diff * x_i[2];
            db += diff;
        }
        
        // Update parameters
        w[0] -= lr * (dw[0] / weightSum);
        w[1] -= lr * (dw[1] / weightSum);
        w[2] -= lr * (dw[2] / weightSum);
        b -= lr * (db / weightSum);
    }
    
    return { w, b };
}

// Predict probability
function predictProbability(x, model) {
    const z = model.w[0] * x[0] + model.w[1] * x[1] + model.w[2] * x[2] + model.b;
    return 1 / (1 + Math.exp(-z));
}

// ---------------------------------------------------------
// 3. Pre-processing Reweighing Math
// ---------------------------------------------------------
function calculateReweighingWeights(trainData) {
    const n = trainData.length;
    const n_m = trainData.filter(c => c.gender === 'Male').length;
    const n_f = trainData.filter(c => c.gender === 'Female').length;
    const n_h = trainData.filter(c => c.hired === 1).length;
    const n_r = trainData.filter(c => c.hired === 0).length;
    
    const n_mh = trainData.filter(c => c.gender === 'Male' && c.hired === 1).length;
    const n_mr = trainData.filter(c => c.gender === 'Male' && c.hired === 0).length;
    const n_fh = trainData.filter(c => c.gender === 'Female' && c.hired === 1).length;
    const n_fr = trainData.filter(c => c.gender === 'Female' && c.hired === 0).length;
    
    // Compute weights
    const w_mh = n_mh > 0 ? (n_m * n_h) / (n * n_mh) : 1.0;
    const w_mr = n_mr > 0 ? (n_m * n_r) / (n * n_mr) : 1.0;
    const w_fh = n_fh > 0 ? (n_f * n_h) / (n * n_fh) : 1.0;
    const w_fr = n_fr > 0 ? (n_f * n_r) / (n * n_fr) : 1.0;
    
    return trainData.map(c => {
        if (c.gender === 'Male' && c.hired === 1) return w_mh;
        if (c.gender === 'Male' && c.hired === 0) return w_mr;
        if (c.gender === 'Female' && c.hired === 1) return w_fh;
        if (c.gender === 'Female' && c.hired === 0) return w_fr;
        return 1.0;
    });
}

// ---------------------------------------------------------
// 4. Evaluation Engine (Accuracy & Fairness)
// ---------------------------------------------------------
function evaluateModel(model, testSet, thresholdMale, thresholdFemale) {
    const X_test = preprocessFeatures(testSet);
    
    let tp = 0, tn = 0, fp = 0, fn = 0;
    
    // Group variables
    let maleHired = 0, maleCount = 0, maleActualPos = 0, maleTruePos = 0;
    let femaleHired = 0, femaleCount = 0, femaleActualPos = 0, femaleTruePos = 0;
    
    const predictions = [];
    const probabilities = [];
    
    for (let i = 0; i < testSet.length; i++) {
        const c = testSet[i];
        const p = predictProbability(X_test[i], model);
        probabilities.push(p);
        
        // Group decision threshold
        const thresh = c.gender === 'Male' ? thresholdMale : thresholdFemale;
        const pred = p >= thresh ? 1 : 0;
        predictions.push(pred);
        
        // Overall accuracy metrics
        if (pred === 1 && c.hired === 1) { tp++; }
        else if (pred === 0 && c.hired === 0) { tn++; }
        else if (pred === 1 && c.hired === 0) { fp++; }
        else if (pred === 0 && c.hired === 1) { fn++; }
        
        // Group metrics
        if (c.gender === 'Male') {
            maleCount++;
            if (pred === 1) maleHired++;
            if (c.hired === 1) {
                maleActualPos++;
                if (pred === 1) maleTruePos++;
            }
        } else {
            femaleCount++;
            if (pred === 1) femaleHired++;
            if (c.hired === 1) {
                femaleActualPos++;
                if (pred === 1) femaleTruePos++;
            }
        }
    }
    
    const total = testSet.length;
    const accuracy = (tp + tn) / total;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    
    // Selection Rates
    const srMale = maleCount > 0 ? maleHired / maleCount : 0;
    const srFemale = femaleCount > 0 ? femaleHired / femaleCount : 0;
    
    // Disparate Impact Ratio
    const diRatio = srMale > 0 ? srFemale / srMale : 0;
    
    // Statistical Parity Difference
    const spd = srFemale - srMale;
    
    // Equal Opportunity Difference (TPR Female - TPR Male)
    const tprMale = maleActualPos > 0 ? maleTruePos / maleActualPos : 0;
    const tprFemale = femaleActualPos > 0 ? femaleTruePos / femaleActualPos : 0;
    const eod = tprFemale - tprMale;
    
    return {
        accuracy, precision, recall, f1,
        diRatio, spd, eod,
        srMale, srFemale,
        predictions, probabilities
    };
}

// ---------------------------------------------------------
// 5. Threshold Optimization Algorithm (Post-processing)
// ---------------------------------------------------------
function autoOptimizeThresholds() {
    if (!state.activeModel) return;
    
    let bestAcc = 0;
    let bestThMale = 0.5;
    let bestThFemale = 0.5;
    let bestFairMetrics = null;
    
    // Grid search for thresholds that maximize accuracy while satisfying DI >= 0.8
    for (let thM = 0.3; thM <= 0.75; thM += 0.02) {
        for (let thF = 0.3; thF <= 0.75; thF += 0.02) {
            const tempEval = evaluateModel(state.activeModel, state.testSet, thM, thF);
            
            // Enforce DI constraint (between 0.8 and 1.25)
            if (tempEval.diRatio >= 0.80 && tempEval.diRatio <= 1.25) {
                // Optimize for F1/Accuracy
                if (tempEval.accuracy > bestAcc) {
                    bestAcc = tempEval.accuracy;
                    bestThMale = thM;
                    bestThFemale = thF;
                    bestFairMetrics = tempEval;
                }
            }
        }
    }
    
    // Apply best thresholds found (if any satisfy constraints, otherwise fall back)
    if (bestAcc > 0) {
        document.getElementById('threshold-male').value = bestThMale.toFixed(2);
        document.getElementById('threshold-female').value = bestThFemale.toFixed(2);
        
        updateRangeLabel('threshold-male');
        updateRangeLabel('threshold-female');
        
        recalculateFairness();
    } else {
        alert("No threshold pair could be found that perfectly satisfies the 80% Disparate Impact constraint due to severe base data bias. Try applying 'Pre-processing Reweighing' first.");
    }
}

// ---------------------------------------------------------
// 6. UI Rendering & Chart updating
// ---------------------------------------------------------
function renderTable(testSet, predictions) {
    const tbody = document.querySelector('#candidates-table tbody');
    tbody.innerHTML = '';
    
    // Show a sample of the test set (first 10 rows)
    const sampleSize = Math.min(10, testSet.length);
    for (let i = 0; i < sampleSize; i++) {
        const c = testSet[i];
        const pred = predictions[i];
        const rowClass = pred === 1 ? 'row-hired' : 'row-rejected';
        
        const tr = document.createElement('tr');
        tr.className = rowClass;
        
        tr.innerHTML = `
            <td><code>${c.id}</code></td>
            <td><i class="fa-solid ${c.gender === 'Male' ? 'fa-mars text-blue' : 'fa-venus text-pink'}"></i> ${c.gender}</td>
            <td>${c.experience}</td>
            <td>${c.testScore}</td>
            <td>${c.education}</td>
            <td><span class="badge ${c.hired === 1 ? 'badge-success' : 'badge-error'}">${c.hired === 1 ? 'Hired' : 'Rejected'}</span></td>
            <td><span class="badge ${pred === 1 ? 'badge-success' : 'badge-error'}">${pred === 1 ? 'Hired' : 'Rejected'}</span></td>
        `;
        tbody.appendChild(tr);
    }
}

function updateStatsCards(metrics) {
    // 1. Disparate Impact Ratio
    const diVal = metrics.diRatio.toFixed(3);
    document.getElementById('metric-di').textContent = diVal;
    
    const diStatus = document.getElementById('status-di');
    if (metrics.diRatio >= 0.8 && metrics.diRatio <= 1.25) {
        diStatus.innerHTML = '<span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> Compliant (80% Rule)</span>';
    } else {
        diStatus.innerHTML = '<span class="badge badge-error"><i class="fa-solid fa-triangle-exclamation"></i> Non-Compliant</span>';
    }
    
    // 2. Accuracy
    document.getElementById('metric-acc').textContent = `${(metrics.accuracy * 100).toFixed(1)}%`;
    
    // 3. Statistical Parity Difference
    const spdVal = metrics.spd.toFixed(3);
    document.getElementById('metric-spd').textContent = spdVal;
    const spdStatus = document.getElementById('status-spd');
    if (Math.abs(metrics.spd) <= 0.1) {
        spdStatus.innerHTML = '<span class="text-emerald font-semibold">Near Statistical Parity</span>';
    } else {
        spdStatus.innerHTML = `<span class="text-rose font-semibold">Disparity: ${metrics.spd < 0 ? 'Favors Men' : 'Favors Women'}</span>`;
    }
}

function drawCharts(baselineMetrics, currentMetrics) {
    // 1. Performance and Fairness comparison chart
    const ctxMetrics = document.getElementById('metricsChart').getContext('2d');
    
    const labels = ['Accuracy', 'F1-Score', 'Disparate Impact', 'Equal Opportunity Diff'];
    const baselineData = [
        baselineMetrics.accuracy,
        baselineMetrics.f1,
        baselineMetrics.diRatio,
        baselineMetrics.eod
    ];
    const currentData = [
        currentMetrics.accuracy,
        currentMetrics.f1,
        currentMetrics.diRatio,
        currentMetrics.eod
    ];
    
    if (state.charts.metrics) {
        state.charts.metrics.destroy();
    }
    
    state.charts.metrics = new Chart(ctxMetrics, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Baseline Model',
                    data: baselineData,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1
                },
                {
                    label: 'Active Model (Mitigated)',
                    data: currentData,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: -0.6,
                    max: 1.2,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#9ca3af' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af' }
                }
            },
            plugins: {
                legend: { labels: { color: '#f9fafb' } }
            }
        }
    });

    // 2. Selection Rates Comparison Chart
    const ctxSelection = document.getElementById('selectionChart').getContext('2d');
    
    if (state.charts.selection) {
        state.charts.selection.destroy();
    }
    
    state.charts.selection = new Chart(ctxSelection, {
        type: 'bar',
        data: {
            labels: ['Male Selection Rate', 'Female Selection Rate'],
            datasets: [
                {
                    label: 'Baseline Model',
                    data: [baselineMetrics.srMale, baselineMetrics.srFemale],
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1
                },
                {
                    label: 'Active Model (Mitigated)',
                    data: [currentMetrics.srMale, currentMetrics.srFemale],
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 1.0,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#9ca3af', callback: val => `${(val * 100).toFixed(0)}%` }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af' }
                }
            },
            plugins: {
                legend: { labels: { color: '#f9fafb' } }
            }
        }
    });
}

// ---------------------------------------------------------
// 7. Orchestration & Event handlers
// ---------------------------------------------------------
function runSimulation() {
    const numSamples = parseInt(document.getElementById('n-samples').value);
    const biasRate = parseFloat(document.getElementById('bias-rate').value);
    const applyReweigh = document.getElementById('toggle-reweigh').checked;
    
    // Reset thresholds to default when generating a new model
    if (event && (event.target.id === 'btn-run' || event.target.id === 'bias-rate' || event.target.id === 'n-samples')) {
        document.getElementById('threshold-male').value = 0.50;
        document.getElementById('threshold-female').value = 0.50;
        updateRangeLabel('threshold-male');
        updateRangeLabel('threshold-female');
    }
    
    const thM = parseFloat(document.getElementById('threshold-male').value);
    const thF = parseFloat(document.getElementById('threshold-female').value);
    
    // 1. Generate new datasets
    state.dataset = generateData(numSamples, biasRate);
    
    // Train/Test Split (80% Train, 20% Test)
    const splitIndex = Math.floor(numSamples * 0.8);
    // Shuffle dataset
    const shuffled = [...state.dataset].sort(() => 0.5 - Math.random());
    state.trainSet = shuffled.slice(0, splitIndex);
    state.testSet = shuffled.slice(splitIndex);
    
    // 2. Train baseline model (never uses weights, threshold 0.5)
    const X_train = preprocessFeatures(state.trainSet);
    const y_train = state.trainSet.map(c => c.hired);
    
    state.baselineModel = trainLogisticRegression(X_train, y_train, null);
    state.baselineMetrics = evaluateModel(state.baselineModel, state.testSet, 0.5, 0.5);
    
    // 3. Train/Evaluate active model
    if (applyReweigh) {
        const weights = calculateReweighingWeights(state.trainSet);
        state.activeModel = trainLogisticRegression(X_train, y_train, weights);
    } else {
        state.activeModel = state.baselineModel; // point to baseline
    }
    
    state.metrics = evaluateModel(state.activeModel, state.testSet, thM, thF);
    
    // 4. Update UI
    updateStatsCards(state.metrics);
    renderTable(state.testSet, state.metrics.predictions);
    drawCharts(state.baselineMetrics, state.metrics);
}

function onThresholdChange(group) {
    updateRangeLabel(`threshold-${group}`);
    recalculateFairness();
}

function recalculateFairness() {
    if (!state.activeModel) return;
    
    const thM = parseFloat(document.getElementById('threshold-male').value);
    const thF = parseFloat(document.getElementById('threshold-female').value);
    
    state.metrics = evaluateModel(state.activeModel, state.testSet, thM, thF);
    
    updateStatsCards(state.metrics);
    renderTable(state.testSet, state.metrics.predictions);
    drawCharts(state.baselineMetrics, state.metrics);
}

// Initial trigger on load
window.addEventListener('DOMContentLoaded', () => {
    runSimulation();
});
