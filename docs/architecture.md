# MedRisk AI: Architecture Documentation

## 1. System Overview
MedRisk AI is an AI-powered clinical intelligence platform designed to estimate 30-day unplanned readmission probability for diabetic inpatients and provide real-time, exact Tree SHAP explainability.

The application is architected from the ground up for **single-project Vercel deployment**, containing both the Next.js modern web application and the Python serverless inference engine in a single repository and single deployment.

---

## 2. Monorepo & Deployment Layout

```text
MedRisk-AI/
├── app/                         # Next.js 14 App Router
│   ├── page.tsx                 # Executive Clinical Dashboard
│   ├── layout.tsx               # App layout with Sidebar & Navbar
│   ├── globals.css              # Tailwind styling & themes
│   ├── predict/page.tsx         # Patient Risk Assessment (Interactive & Manual)
│   ├── population/page.tsx      # Population Analytics & Epidemiological Trends
│   ├── models/page.tsx          # Model Laboratory & Discrimination Curves
│   ├── explain/page.tsx         # Explainability Centre & Global SHAP
│   └── batch/page.tsx           # CSV Batch Inpatient Prediction
│
├── components/                  # Reusable UI Components
│   ├── Sidebar.tsx              # Clean Clinical Navigation
│   ├── Navbar.tsx               # Top Bar with Live Serverless Indicator
│   ├── RiskGauge.tsx            # SVG Semicircular Probability Gauge
│   ├── ShapWaterfall.tsx        # Interactive Recharts Tree SHAP Waterfall
│   └── DisclaimerBanner.tsx     # Prominent Non-Diagnostic Research Notice
│
├── api/                         # Vercel-Compatible Python Serverless
│   └── index.py                 # FastAPI Application Handlers
│
├── backend/                     # Machine Learning Core & Testing
│   ├── ml/
│   │   ├── dataset_profiler.py  # Stage 1 Dataset Profiling & Verification
│   │   ├── train_models.py      # Stage 3 Group-Aware ML Training Pipeline
│   │   └── inference.py         # Production Clinical Inference Engine
│   └── tests/
│       ├── test_runner.py       # Core Pipeline & SHAP Consistency Tests
│       ├── test_api.py          # FastAPI Endpoint Integration Tests
│       └── test_pipeline.py     # Edge Case & Preprocessing Validation
│
├── artifacts/                   # Lightweight Production Model Artifacts (<600 KB total)
│   ├── lightgbm_model.txt       # Compiled LightGBM Booster (511 KB)
│   ├── preprocessing_config.json# Fixed Categorical Mappings & Imputations
│   ├── dashboard_overview.json  # Precomputed Population Analytics
│   ├── global_shap.json         # Lundberg TreeExplainer Global Importance
│   ├── model_evaluation.json    # 5-Model Benchmark Comparison Table
│   ├── evaluation_curves.json   # ROC, PR, and Calibration Points
│   ├── sample_encounters.json   # 20 Representative Patient Clinical Samples
│   ├── ids_mapping.json         # Coded EHR Encounter Descriptions
│   └── model_metadata.json      # Optimal Cutoffs, Risk Tiers & Dates
│
├── data/                        # Datasets (Excluded from Public Git)
│   ├── diabetic_data.csv        # 101,766 Raw Encounters
│   └── IDS_mapping.csv          # Coded Hospital ID Descriptions
│
├── reports/                     # Data Science & Audit Reports
│   ├── dataset_profiling_report.md
│   ├── feature_inclusion_exclusion_report.md
│   ├── data_dictionary.md
│   ├── data_quality_report.md
│   └── model_comparison_report.md
│
├── docs/                        # Engineering & Clinical Documentation
│   ├── architecture.md
│   ├── api_documentation.md
│   ├── explainability_methodology.md
│   └── responsible_ai_and_limitations.md
│
├── package.json                 # Next.js Dependencies & NPM Scripts
├── requirements.txt             # Lightweight Vercel Serverless Dependencies
├── vercel.json                  # Serverless Route Rewrites (/api/* -> api/index.py)
├── next.config.js               # Next.js Configuration
└── README.md                    # Complete System Documentation
```

---

## 3. High-Performance Serverless Strategy

1. **Lightweight Production Artifacts**:
   - The entire production bundle of model weights and metadata is **under 600 KB**.
   - No multi-gigabyte models or heavy training data are deployed to the serverless runtime.
2. **Native C++ Tree SHAP in LightGBM**:
   - Standard SHAP explanations often require `numba` and `llvmlite`, which are heavy (>150 MB) and prone to cold-start delays.
   - LightGBM natively implements Tree SHAP in compiled C++ via `predict(..., pred_contrib=True)`.
   - On Vercel, predictions and exact SHAP feature attributions execute in **under 5 milliseconds**.
3. **Cold Start & Memory Efficiency**:
   - Production inference dependencies are restricted to `lightgbm`, `numpy`, `fastapi`, and `pydantic`.
   - Total unzipped dependency footprint is ~55 MB, well below Vercel's 250 MB ceiling.
   - Memory consumption per invocation is ~50 MB RAM, easily fitting in standard Vercel serverless configurations (1024 MB).
