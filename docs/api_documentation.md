# MedRisk AI: API Documentation

Base Path: `/api`  
Interactive OpenAPI UI: `/api/docs` (when server running)

---

## Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health probe confirming engine and artifact status |
| `GET` | `/api/overview` | Population analytics, rates, and model metadata |
| `GET` | `/api/encounters` | Representative historical encounter records |
| `GET` | `/api/explain` | Global SHAP feature importance rankings |
| `GET` | `/api/models` | Model benchmark comparisons, ROC, PR, and calibration curves |
| `POST` | `/api/predict` | Single-encounter risk prediction with exact Tree SHAP attributions |
| `POST` | `/api/batch-predict` | Batch prediction for JSON encounter arrays |
| `POST` | `/api/batch-predict-csv` | CSV upload for multi-encounter batch prediction |

---

## 1. Health Probe
**`GET /api/health`**

Response:
```json
{
  "status": "healthy",
  "service": "MedRisk AI Clinical Intelligence API",
  "model_loaded": true,
  "features_loaded": 29,
  "artifacts_directory": "/path/to/artifacts"
}
```

---

## 2. Predict Encounter Risk
**`POST /api/predict`**

Request Body:
```json
{
  "encounter_id": "DEMO-101",
  "patient_nbr": "PT-500",
  "age": "[60-70)",
  "gender": "Female",
  "race": "Caucasian",
  "admission_type": "Emergency",
  "discharge_disposition": "Home",
  "admission_source": "Emergency Room",
  "time_in_hospital": 4,
  "medical_specialty": "InternalMedicine",
  "num_lab_procedures": 42,
  "num_procedures": 1,
  "num_medications": 14,
  "number_outpatient": 0,
  "number_emergency": 0,
  "number_inpatient": 2,
  "number_diagnoses": 8,
  "diag_1_group": "Circulatory",
  "diag_2_group": "Diabetes",
  "diag_3_group": "Respiratory",
  "max_glu_serum": "None",
  "A1Cresult": ">8",
  "metformin": "Steady",
  "glipizide": "No",
  "glyburide": "No",
  "insulin": "Up",
  "change": "Ch",
  "diabetesMed": "Yes"
}
```

Response:
```json
{
  "encounter_id": "DEMO-101",
  "patient_nbr": "PT-500",
  "probability": 0.652,
  "risk_percentage": 65.2,
  "risk_tier": "High",
  "risk_color": "rose",
  "binary_prediction": 1,
  "decision_threshold": 0.55,
  "base_probability": 0.114,
  "clinical_guidance": "Intensive care-coordination priority. Consider early home-health consultation, expedited primary care follow-up within 7 days, and targeted diabetic education.",
  "top_risk_drivers": [
    {
      "feature": "number_inpatient",
      "shap_value": 0.4568,
      "abs_shap": 0.4568,
      "raw_value": 2,
      "direction": "increases_risk",
      "explanation": "Prior inpatient hospital stays (2 in past year) increased predicted readmission risk, reflecting baseline chronic illness acuity and frequent acute decompensations."
    }
  ],
  "top_protective_factors": [
    {
      "feature": "discharge_disposition",
      "shap_value": -0.1624,
      "abs_shap": 0.1624,
      "raw_value": "Home",
      "direction": "decreases_risk",
      "explanation": "Discharge disposition ('Home') reduced risk; post-acute transition pathway is a critical determinant of 30-day stability."
    }
  ],
  "all_contributions": [...]
}
```

---

## 3. CSV Batch Prediction
**`POST /api/batch-predict-csv`**

Request: Multipart Form (`file: data.csv`)  
Response:
```json
{
  "filename": "encounters.csv",
  "total_processed": 50,
  "summary": {
    "high_risk": 12,
    "moderate_risk": 18,
    "low_risk": 20,
    "average_risk_percentage": 24.3
  },
  "predictions": [
    {
      "row_index": 1,
      "encounter_id": "E101",
      "patient_nbr": "P901",
      "age": "[60-70)",
      "gender": "Female",
      "probability": 0.652,
      "risk_percentage": 65.2,
      "risk_tier": "High",
      "prediction_binary": 1,
      "primary_risk_driver": "number_inpatient (2) [+0.457]"
    }
  ]
}
```
