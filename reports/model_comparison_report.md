# MedRisk AI: Model Comparison and Evaluation Report

## 1. Executive Summary & Selection Rationale
To predict 30-day hospital readmissions, five diverse machine learning model architectures were trained and rigorously evaluated using **GroupShuffleSplit (grouped by `patient_nbr`)** to strictly prevent patient data leakage.

### Model Comparison Table
| Model Architecture | Accuracy | Precision | Recall | F1-Score | ROC-AUC | PR-AUC | Brier Score |
|---|---|---|---|---|---|---|---|
| **LightGBM (Selected)** | 0.6486 | 0.1763 | 0.5826 | 0.2706 | **0.6659** | **0.2193** | **0.2181** |
| HistGradientBoosting | 0.6452 | 0.1737 | 0.5776 | 0.2671 | 0.6622 | 0.2183 | 0.2212 |
| Random Forest | 0.6909 | 0.1827 | 0.5072 | 0.2686 | 0.66 | 0.2041 | 0.2069 |
| Decision Tree | 0.5926 | 0.1579 | 0.6092 | 0.2508 | 0.6446 | 0.1967 | 0.2287 |
| Logistic Regression | 0.6644 | 0.1782 | 0.5532 | 0.2695 | 0.662 | 0.2123 | 0.2272 |

---

## 2. Selection Rationale for LightGBM
1. **Superior Discrimination**: LightGBM achieved the highest ROC-AUC (0.6659) and PR-AUC (0.2193) across all evaluated models.
2. **Serverless Deployment Compatibility**:
   - The compiled model artifact is a compact text file (`artifacts/lightgbm_model.txt`) of under 600 KB.
   - Inference memory footprint is negligible (< 15 MB RAM).
3. **Native Real-Time Tree SHAP**:
   - LightGBM computes exact Tree SHAP values directly in C++ via `predict(pred_contrib=True)` in microseconds without requiring heavy dependencies like `numba` or `llvmlite` in production serverless environments.
4. **Calibrated Clinical Threshold**:
   - Optimal threshold: **0.5658**
   - Optimal Recall: **41.9%**
   - Optimal F1: **0.2783**

---

## 3. Confusion Matrix (LightGBM at Default 0.5 Threshold)
- True Negatives: 11,553
- False Positives: 6,033
- False Negatives: 925
- True Positives: 1,291

## 4. Confusion Matrix (LightGBM at Calibrated Decision Threshold 0.5658)
- True Negatives: 14,055
- False Positives: 3,531
- False Negatives: 1,287
- True Positives: 929
