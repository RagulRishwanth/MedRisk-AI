MedRisk AI

Explainable Clinical Intelligence for 30-Day Hospital Readmission Risk

<p align="center">
  <img src="https://img.shields.io/badge/AI-Healthcare%20Analytics-0D9488?style=for-the-badge" />
  <img src="https://img.shields.io/badge/ML-LightGBM-2E7D32?style=for-the-badge" />
  <img src="https://img.shields.io/badge/XAI-TreeSHAP-7C3AED?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Deployment-Vercel-000000?style=for-the-badge&logo=vercel" />
  <img src="https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Backend-Python%20Serverless-3776AB?style=for-the-badge&logo=python" />
</p>MedRisk AI is an interactive healthcare analytics platform that estimates the probability of 30-day hospital readmission for diabetic inpatient encounters. It combines patient-aware machine learning, LightGBM, and explainable AI to make model predictions more transparent and interpretable.

Built using real-world hospital encounter data, the application provides patient-level risk assessment, population analytics, model evaluation, and feature-level explanations through an interactive web interface.

Live Application: "Open MedRisk AI" (https://med-risk-ai-nine.vercel.app/)

---

Overview

Hospital readmissions are an important indicator of healthcare quality and continuity of care. Identifying encounters associated with a higher likelihood of readmission can help researchers investigate patient characteristics, treatment patterns, and potential risk factors.

MedRisk AI explores this problem through a machine learning pipeline trained on historical diabetic inpatient encounters.

The application brings together:

- Patient-level readmission risk estimation.
- Patient-group-aware model evaluation.
- Explainable predictions using Tree SHAP.
- Interactive population-level analytics.
- Model performance comparison.
- CSV-based batch prediction.
- Serverless deployment through a single Vercel project.

Key Features

1. Patient-Level Risk Assessment

- Generate 30-day readmission risk estimates for individual encounters.
- Explore representative historical patient encounters.
- Enter custom clinical parameters through an interactive assessment form.
- View estimated probabilities through an interactive risk gauge.
- Explore feature contributions behind individual predictions.

Risk categories used by the application:

Category| Estimated probability
Low| Below 15%
Moderate| 15–30%
High| Above 30%

These are application-defined presentation thresholds, not clinically validated decision thresholds.

2. Explainable AI with Tree SHAP

Interpretability is a core component of MedRisk AI.

The application uses LightGBM's native Tree SHAP implementation to calculate feature contributions for individual predictions.

Capabilities include:

- Individual prediction explanations.
- Positive and negative feature contributions.
- Global feature importance.
- Interactive SHAP waterfall visualisation.
- Plain-language interpretation of influential features.

The deployed implementation uses LightGBM's compiled C++ prediction functionality rather than requiring heavyweight JIT dependencies.

3. Population Analytics

Explore patterns across historical hospital encounters through interactive visualisations.

Analytics include:

- Readmission trends across age groups.
- Gender-based comparisons.
- Admission and discharge patterns.
- Length-of-stay analysis.
- HbA1c control patterns.
- Insulin adjustment patterns.
- Diagnosis-related trends.

4. Model Laboratory

Compare multiple machine learning algorithms using a consistent evaluation methodology.

Models evaluated:

- Logistic Regression
- Decision Tree
- Random Forest
- HistGradientBoosting
- LightGBM

Evaluation metrics include:

- Accuracy
- Precision
- Recall
- F1-score
- ROC-AUC
- PR-AUC
- Confusion matrix

The application emphasises recall, precision-recall trade-offs, and model behaviour rather than relying on accuracy alone.

5. CSV Batch Prediction

Upload a CSV containing compatible encounter features to:

- Validate input schemas.
- Preview uploaded records.
- Generate readmission-risk estimates.
- Explore risk distributions.
- Download prediction results.

Uploaded files are processed without requiring persistent patient-data storage.

---

Machine Learning Methodology

Dataset

MedRisk AI uses the diabetic hospital encounter dataset and its accompanying ID mapping file.

Dataset characteristic| Value
Active inpatient encounters| 99,343
Unique patients| 70,052
Prediction target| 30-day readmission
Target categories| Readmitted / Not readmitted

Target Engineering

The original "readmitted" variable is transformed into a binary classification target:

- "<30": Readmitted within 30 days.
- ">30" and "NO": Not readmitted within 30 days.

Patient identifiers and encounter identifiers are excluded from model predictors.

Leakage-Aware Evaluation

Repeated encounters belonging to the same patient introduce a risk of information leakage.

To address this, the evaluation methodology uses patient-group-aware splitting based on "patient_nbr", preventing encounters from the same patient from appearing across training and test partitions.

In-hospital expired encounters are excluded from the modelling cohort.

Preprocessing and model selection are performed within the training workflow.

Model Selection

LightGBM was selected as the final model after comparing five classification algorithms.

<details>
<summary><strong>Reported LightGBM evaluation results</strong></summary>Metric| Result
ROC-AUC| 0.6659
PR-AUC| 0.2193
Recall| 58.26%
Decision threshold| 0.55

These are the reported evaluation results for the selected model. They should be interpreted in the context of the dataset, evaluation methodology, and class distribution.

</details>---

System Architecture

MedRisk AI is designed as a single-project, serverless application.

The frontend and Python inference API are deployed through Vercel, without a separately hosted backend or external database.

flowchart TD
    U["User / Browser"]

    subgraph V["Single Vercel Project"]
        F["Next.js Frontend"]
        R["API Routing"]
        P["Python Serverless Functions"]
        I["ML Inference Engine"]
        M["LightGBM Model"]
        S["Tree SHAP"]
        J["Precomputed JSON Analytics"]
    end

    U --> F
    F --> R
    R --> P
    P --> I
    I --> M
    I --> S
    P --> J
    M --> P
    S --> P
    P --> F
    F --> U

Deployment Design

Component| Technology| Responsibility
Frontend| Next.js, React, Tailwind CSS| User interface and visualisations
API| Python serverless functions| Prediction and explanation endpoints
ML engine| LightGBM| Readmission-risk estimation
Explainability| Tree SHAP| Feature-level prediction explanations
Analytics| Precomputed JSON| Dashboard and population statistics
Hosting| Vercel| Frontend and API deployment

Local Training, Serverless Inference

Model training and production inference are deliberately separated.

Environment| Responsibilities
Local development| Dataset processing, model training, tuning and evaluation
Vercel deployment| Model inference, explanations and application delivery

The deployed application uses compact model and metadata artifacts instead of loading the original training dataset for every request.

Reported production artifacts include:

- "lightgbm_model.txt" — approximately 511 KB.
- Preprocessing configuration and category mappings.
- Dashboard population statistics.
- Global SHAP information.
- Model evaluation metadata and curves.

The reported combined model and metadata payload is under 1 MB.

---

Technology Stack

Category| Technologies
Programming| Python, TypeScript, JavaScript
Data processing| Pandas, NumPy
Machine learning| Scikit-learn, LightGBM
Explainable AI| Tree SHAP
Backend| FastAPI-compatible Python API, serverless functions
Frontend| Next.js 14, React 18
Styling| Tailwind CSS
Visualisation| Recharts, SVG
Deployment| Vercel
Version control| Git, GitHub

---

Local Development

Prerequisites

- Node.js 18 or newer
- Python 3.10 or 3.11
- npm
- Git

1. Clone the repository

git clone https://github.com/RagulRishwanth/MedRisk-AI.git
cd MedRisk-AI

2. Install frontend dependencies

npm install

3. Install Python dependencies

python -m pip install -r requirements.txt

4. Run automated tests

python -m unittest discover -s backend/tests -p "test_*.py"

5. Start the application

Start the backend in one terminal:

npm run dev:backend

Start the frontend in another terminal:

npm run dev

Open:

- Application: http://localhost:3000
- API documentation: http://127.0.0.1:8000/api/docs

The original datasets are intentionally excluded from the public repository. Follow the project documentation for local dataset setup and model training.

---

Vercel Deployment

MedRisk AI is designed to run through a single Vercel project.

No separate backend hosting service, external database, or paid inference API is required.

Deployment architecture

- Next.js frontend.
- Python serverless inference functions.
- Same-origin "/api/*" requests.
- Bundled model and preprocessing artifacts.
- Precomputed population analytics.

Deploy

1. Push the project to GitHub.
2. Import the repository into "Vercel" (https://vercel.com/dashboard).
3. Configure the project using the repository's deployment configuration.
4. Deploy.
5. Verify the application and API endpoints.

Raw training datasets are excluded from Git. The deployed application uses the exported model artifacts and precomputed analytics.

---

Project Documentation

Detailed technical documentation is available in the "docs/" and "reports/" directories.

Architecture and methodology

- "System Architecture" (docs/architecture.md)
- "API Documentation" (docs/api_documentation.md)
- "Explainability Methodology" (docs/explainability_methodology.md)
- "Responsible AI and Limitations" (docs/responsible_ai_and_limitations.md)

Dataset and modelling reports

- "Dataset Profiling Report" (reports/dataset_profiling_report.md)
- "Data Dictionary" (reports/data_dictionary.md)
- "Data Quality Report" (reports/data_quality_report.md)
- "Feature Inclusion and Exclusion Report" (reports/feature_inclusion_exclusion_report.md)
- "Model Comparison Report" (reports/model_comparison_report.md)

---

Responsible AI and Limitations

MedRisk AI is a research and educational application developed to explore machine learning approaches for hospital readmission-risk estimation.

Important limitations:

- Predictions are statistical estimates, not clinical diagnoses.
- The model is trained on a specific historical diabetic inpatient dataset.
- Performance may differ across hospitals and patient populations.
- Model explanations indicate feature contributions, not causation.
- Risk thresholds are application-defined and not clinically validated.
- The model has not undergone prospective clinical validation or medical-device approval.

MedRisk AI must not be used as a substitute for clinical judgment, medical advice, or standard patient-care protocols.

---

Author

Ragul Rishwanth P

AI Engineering | Generative AI | Machine Learning | Explainable AI

- "GitHub" (https://github.com/RagulRishwanth)
- "LinkedIn" (https://www.linkedin.com/in/ragul-rishwanth-5330ba210/)
- "Portfolio" (https://ragul-rishwanth-portfolio.vercel.app/)

---

<p align="center">
  <strong>MedRisk AI</strong><br/>
  Making healthcare machine learning more transparent, interpretable, and accessible.
</p>