# MedRisk AI: Explainable AI Methodology

## 1. Mathematical Grounding: Exact Tree SHAP
MedRisk AI relies on **SHAP (SHapley Additive exPlanations)** based on cooperative game theory (Lundberg & Lee, 2017).

For tree ensembles, **Tree SHAP** computes the exact Shapley values in polynomial time:

$$\phi_i(x) = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!(|F| - |S| - 1)!}{|F|!} \left[ f(S \cup \{i\}) - f(S) \right]$$

### Additive Feature Attribution Property
For every patient encounter:

$$f(x) = \phi_0 + \sum_{i=1}^{M} \phi_i(x)$$

Where:
- $f(x)$ is the raw model output in log-odds space ($\text{logit}(p) = \ln \frac{p}{1-p}$).
- $\phi_0$ is the base expected value across the training population.
- $\phi_i(x)$ is the contribution of feature $i$ toward the predicted log-odds.
- $p = \sigma(f(x)) = \frac{1}{1 + e^{-f(x)}}$ is the readmission probability.

---

## 2. Serverless Optimization: Native LightGBM Tree SHAP
Traditional explainability pipelines require executing Python SHAP with Numba JIT compilation, introducing heavy cold starts (>30 seconds) and unzipped bundle sizes (>200 MB).

MedRisk AI solves this bottleneck by taking advantage of LightGBM's compiled C++ implementation of Tree SHAP:
```python
# Returns shape (n_samples, n_features + 1)
shap_contribs = booster.predict(X, pred_contrib=True)
```
- Execution time per patient: **< 1 millisecond**.
- Accuracy: **Exact mathematical Tree SHAP**.
- Dependencies: Zero additional libraries needed beyond LightGBM.

---

## 3. Association vs Clinical Causation
SHAP values communicate feature attribution within the predictive algorithm. Clinicians and researchers must observe the distinction between statistical association and clinical causation:

1. **Proxy Indicators**: A feature such as `time_in_hospital` (length of stay) acts as a surrogate for inpatient disease complexity and severity of acute decompensation. Artificially discharging a patient early will not reduce their physiological readmission risk.
2. **Post-Acute Placement**: Transfer to Skilled Nursing Facilities (`discharge_disposition`) increases predicted risk because patients referred to SNFs typically have higher functional decline and wound-care demands.
3. **Glycemic Instability**: Insulin dosage titration (`insulin: Up`) reflects active medical intervention to control hyperglycemia, identifying a cohort with unstable diabetes.
