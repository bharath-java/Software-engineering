# ÆGIS: Algorithmic Fairness & Bias Mitigation Hub

**Problem 5: Ethical Evaluation and Auditing of an AI Hiring System**

This repository contains an interactive static web application and automated evaluation pipeline designed to audit, evaluate, and mitigate algorithmic bias in automated recruiting systems. The system simulates historical hiring biases, calculates legal and standard fairness metrics (such as the EEOC's 80% rule), and implements both pre-processing (Reweighing) and post-processing (Decision Threshold Optimization) mitigation strategies.

---

## 🚀 Key Features

1. **Interactive Bias Simulator**: Slide to configure sample size and adjust historical bias penalty rates.
2. **Client-Side ML Pipeline**: Implements candidate generation and Logistic Regression training via Gradient Descent directly in the browser using client-side JavaScript.
3. **Double-Ended Fairness Intervention**:
   - **Pre-processing Reweighing**: Balance sample weights prior to model training to decorrelate protected attributes (gender) and historical outcomes.
   - **Post-processing Thresholding**: Independently tune classification thresholds for Male and Female cohorts to achieve demographic parity or equal opportunity. Includes an auto-optimization heuristic.
4. **Interactive Ethical Evaluation Dashboard**: Explore detailed, tabbed analysis covering Ethical Issue Identification, Data Ethics Frameworks, Privacy Risks (e.g., membership inference, proxy leakage), and Secure Design Recommendations.
5. **Print-Ready compliance PDF Reports**: Links to download official, professionally styled compliance reports generated programmatically via python.

---

## 📂 Repository Layout

```text
/
├── index.html                    # Main HTML5 page with SEO meta tags
├── style.css                     # Custom Vanilla CSS dark theme (glassmorphism & animations)
├── app.js                        # Client-side ML logic, simulation, and Chart.js rendering
├── generate_pdf_reports.py       # Python ReportLab compiler generating official PDFs
├── requirements.txt              # Python dependencies for PDF generation and tests
├── tests/
│   └── test_model.py             # Python unit test suite verifying pipeline mathematics
└── docs/                         # Contains pre-compiled reports and dataset (ideal for GitHub Pages)
    ├── data/
    │   └── synthetic_candidates.csv
    ├── reports/
    │   ├── ethical_evaluation.pdf
    │   └── testing_and_results_report.pdf
    └── bias_mitigation_results.png
```

---

## 🛠️ Getting Started

### 1. Run the Web Application Locally
Since the website is built entirely on static, client-side web technologies (HTML, CSS, JS), it does not require a complex backend to run.

You can launch it by double-clicking `index.html` in your file explorer, or serve it locally using a simple HTTP server:

```bash
# Option A: Python's built-in server
python -m http.server 8000

# Option B: Node.js http-server
npx http-server -p 8000
```
Open `http://localhost:8000` in your web browser.

---

### 2. Setup the Python Environment & Run Audits
To run the offline evaluation pipeline, compile the official PDF reports, or execute the test suite, configure Python (3.8+):

```bash
# Install dependencies
pip install -r requirements.txt

# Run the pipeline & compile the compliance PDFs
python generate_pdf_reports.py
```
This script will:
- Re-run the data simulator and model trainer in Python.
- Save a comparison plot at `docs/bias_mitigation_results.png`.
- Compile `docs/reports/ethical_evaluation.pdf` and `docs/reports/testing_and_results_report.pdf`.

---

### 3. Run Automated Tests
Verify that the underlying mathematical evaluations (disparate impact, selection rates, and sample weight calculations) are functioning correctly:

```bash
python -m unittest discover -s tests -p "*.py"
```

---

## 🌐 Deploying to GitHub Pages

To make the interactive dashboard public and shareable, you can publish it directly to GitHub Pages. Follow these steps:

1. **Create a GitHub Repository**: Create a new repository on your GitHub account (e.g., `ai-hiring-ethics-audit`).
2. **Push the Files**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of ethical hiring auditor"
   git remote add origin https://github.com/yourusername/ai-hiring-ethics-audit.git
   git branch -M main
   git push -u origin main
   ```
3. **Configure Pages**:
   - Go to your repository settings on GitHub.
   - In the sidebar, select **Pages**.
   - Under **Build and deployment**, select **Deploy from a branch**.
   - Under **Branch**, select `main` (or `master`) and select `/ (root)` as the folder.
   - Click **Save**.
4. **Access the Website**: Within a few minutes, your site will be live at:
   `https://yourusername.github.io/ai-hiring-ethics-audit/`

---

## ⚖️ Algorithmic Fairness Metrics Implemented

- **Disparate Impact (DI) Ratio**: 
  $$\text{DI} = \frac{P(\text{hired} \mid \text{Female})}{P(\text{hired} \mid \text{Male})}$$
  *Rule of Thumb*: The US Equal Employment Opportunity Commission (EEOC) enforces the 4/5ths rule, requiring this ratio to be $\ge 0.80$.
- **Statistical Parity Difference (SPD)**: 
  $$\text{SPD} = P(\text{hired} \mid \text{Female}) - P(\text{hired} \mid \text{Male})$$
- **Equal Opportunity Difference (EOD)**: 
  $$\text{EOD} = TPR_{\text{Female}} - TPR_{\text{Male}}$$
  Where True Positive Rate (TPR) is the ratio of qualified candidates successfully selected.
