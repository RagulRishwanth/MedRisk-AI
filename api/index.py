import os
import json
import io
import csv
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Determine paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Check if artifacts are in BASE_DIR/artifacts or BASE_DIR/../artifacts
if os.path.exists(os.path.join(BASE_DIR, 'artifacts')):
    ARTIFACTS_DIR = os.path.join(BASE_DIR, 'artifacts')
elif os.path.exists(os.path.join(os.path.dirname(BASE_DIR), 'artifacts')):
    ARTIFACTS_DIR = os.path.join(os.path.dirname(BASE_DIR), 'artifacts')
else:
    ARTIFACTS_DIR = os.path.abspath('artifacts')

# Import Inference Engine
try:
    from backend.ml.inference import ClinicalInferenceEngine
    engine = ClinicalInferenceEngine(artifacts_dir=ARTIFACTS_DIR)
except Exception as e:
    # Fallback to local import if backend is on path
    import sys
    sys.path.append(os.path.dirname(BASE_DIR))
    from backend.ml.inference import ClinicalInferenceEngine
    engine = ClinicalInferenceEngine(artifacts_dir=ARTIFACTS_DIR)

app = FastAPI(
    title="MedRisk AI API",
    description="Explainable Clinical Intelligence for 30-Day Hospital Readmission Risk Prediction",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Enable CORS for local development and same-origin Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models for Input Validation
class PatientEncounterInput(BaseModel):
    encounter_id: Optional[Any] = "DEMO-001"
    patient_nbr: Optional[Any] = "PT-001"
    age: str = Field(default="[60-70)", description="Age bracket e.g. [60-70)")
    gender: str = Field(default="Female", description="Male or Female")
    race: str = Field(default="Caucasian", description="Race / Ethnicity")
    admission_type: str = Field(default="Emergency", description="Emergency, Urgent, Elective, Other")
    discharge_disposition: str = Field(default="Home", description="Home, Skilled Nursing Facility, Home Health Service, etc.")
    admission_source: str = Field(default="Emergency Room", description="Emergency Room, Physician Referral, Clinic Referral, etc.")
    time_in_hospital: int = Field(default=3, ge=1, le=14, description="Length of stay in days (1-14)")
    medical_specialty: str = Field(default="InternalMedicine", description="Admitting medical specialty")
    num_lab_procedures: int = Field(default=40, ge=0, le=150, description="Number of lab tests (0-150)")
    num_procedures: int = Field(default=1, ge=0, le=10, description="Number of non-lab procedures (0-10)")
    num_medications: int = Field(default=12, ge=0, le=100, description="Distinct medications administered (0-100)")
    number_outpatient: int = Field(default=0, ge=0, le=100, description="Outpatient visits in prior year")
    number_emergency: int = Field(default=0, ge=0, le=100, description="Emergency visits in prior year")
    number_inpatient: int = Field(default=0, ge=0, le=50, description="Inpatient hospital admissions in prior year")
    number_diagnoses: int = Field(default=7, ge=1, le=20, description="Number of diagnoses recorded")
    diag_1_group: str = Field(default="Circulatory", description="Primary diagnosis category")
    diag_2_group: str = Field(default="Circulatory", description="Secondary diagnosis category")
    diag_3_group: str = Field(default="Diabetes", description="Tertiary diagnosis category")
    max_glu_serum: str = Field(default="None", description="Blood glucose test: None, Norm, >200, >300")
    A1Cresult: str = Field(default="None", description="HbA1c test: None, Norm, >7, >8")
    metformin: str = Field(default="No", description="metformin status: No, Steady, Up, Down")
    glipizide: str = Field(default="No", description="glipizide status: No, Steady, Up, Down")
    glyburide: str = Field(default="No", description="glyburide status: No, Steady, Up, Down")
    insulin: str = Field(default="No", description="insulin status: No, Steady, Up, Down")
    change: str = Field(default="No", description="Diabetic med change: Ch or No")
    diabetesMed: str = Field(default="Yes", description="Diabetic med prescribed: Yes or No")

class BatchPredictionRequest(BaseModel):
    encounters: List[Dict[str, Any]]

# Endpoints

@app.get("/api/health")
def get_health():
    """Health check endpoint confirming model and artifact status."""
    return {
        "status": "healthy",
        "service": "MedRisk AI Clinical Intelligence API",
        "model_loaded": engine.booster is not None,
        "features_loaded": len(engine.feature_cols),
        "artifacts_directory": ARTIFACTS_DIR
    }

@app.get("/api/overview")
def get_overview():
    """Returns population-level clinical analytics and metadata."""
    overview_path = os.path.join(ARTIFACTS_DIR, 'dashboard_overview.json')
    meta_path = os.path.join(ARTIFACTS_DIR, 'model_metadata.json')
    
    if not os.path.exists(overview_path):
        raise HTTPException(status_code=404, detail="Dashboard overview artifact not found")
        
    with open(overview_path, 'r', encoding='utf-8') as f:
        overview_data = json.load(f)
        
    metadata = {}
    if os.path.exists(meta_path):
        with open(meta_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
            
    return {
        "overview": overview_data,
        "model_metadata": metadata
    }

@app.get("/api/encounters")
def get_sample_encounters():
    """Returns representative historical patient encounters for interactive assessment."""
    samples_path = os.path.join(ARTIFACTS_DIR, 'sample_encounters.json')
    if not os.path.exists(samples_path):
        raise HTTPException(status_code=404, detail="Sample encounters artifact not found")
        
    with open(samples_path, 'r', encoding='utf-8') as f:
        samples = json.load(f)
    return {"encounters": samples}

@app.get("/api/explain")
def get_global_explanations():
    """Returns precomputed global SHAP feature importance and baseline statistics."""
    shap_path = os.path.join(ARTIFACTS_DIR, 'global_shap.json')
    if not os.path.exists(shap_path):
        raise HTTPException(status_code=404, detail="Global SHAP artifact not found")
        
    with open(shap_path, 'r', encoding='utf-8') as f:
        shap_data = json.load(f)
    return shap_data

@app.get("/api/models")
def get_model_evaluations():
    """Returns model benchmark comparisons, ROC curves, PR curves, and calibration curves."""
    eval_path = os.path.join(ARTIFACTS_DIR, 'model_evaluation.json')
    curves_path = os.path.join(ARTIFACTS_DIR, 'evaluation_curves.json')
    meta_path = os.path.join(ARTIFACTS_DIR, 'model_metadata.json')
    
    if not os.path.exists(eval_path) or not os.path.exists(curves_path):
        raise HTTPException(status_code=404, detail="Model evaluation artifacts not found")
        
    with open(eval_path, 'r', encoding='utf-8') as f:
        evaluation = json.load(f)
    with open(curves_path, 'r', encoding='utf-8') as f:
        curves = json.load(f)
        
    metadata = {}
    if os.path.exists(meta_path):
        with open(meta_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
            
    return {
        "models": evaluation,
        "curves": curves,
        "metadata": metadata
    }

@app.post("/api/predict")
def predict_patient_risk(input_data: PatientEncounterInput):
    """
    Predicts 30-day readmission risk probability, clinical tier, and exact SHAP feature attributions.
    """
    try:
        record = input_data.model_dump()
        prediction = engine.predict_encounter(record)
        return {
            "encounter_id": record.get("encounter_id", "MANUAL-ASSESSMENT"),
            "patient_nbr": record.get("patient_nbr", "PT-ANONYMOUS"),
            **prediction
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.post("/api/batch-predict")
def predict_batch_json(request: BatchPredictionRequest):
    """
    Performs fast batch inference on a list of patient encounter records.
    """
    if len(request.encounters) > 1000:
        raise HTTPException(status_code=400, detail="Batch size limit is 1,000 records per request")
    try:
        results = engine.predict_batch(request.encounters)
        high_risk_count = sum(1 for r in results if r['risk_tier'] == 'High')
        mod_risk_count = sum(1 for r in results if r['risk_tier'] == 'Moderate')
        low_risk_count = sum(1 for r in results if r['risk_tier'] == 'Low')
        
        return {
            "total_processed": len(results),
            "summary": {
                "high_risk": high_risk_count,
                "moderate_risk": mod_risk_count,
                "low_risk": low_risk_count,
                "average_risk_percentage": round(sum(r['risk_percentage'] for r in results) / len(results), 1) if results else 0.0
            },
            "predictions": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch inference error: {str(e)}")

@app.post("/api/batch-predict-csv")
async def predict_batch_csv(file: UploadFile = File(...)):
    """
    Accepts a CSV upload, parses clinical rows, validates columns, and generates batch predictions.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Uploaded file must be a CSV file")
        
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024: # 5MB limit
        raise HTTPException(status_code=400, detail="CSV file size exceeds 5MB limit")
        
    try:
        text = contents.decode('utf-8', errors='replace')
        reader = csv.DictReader(io.StringIO(text))
        records = [row for row in reader]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
        
    if not records:
        raise HTTPException(status_code=400, detail="CSV file contains no data rows")
        
    if len(records) > 1000:
        records = records[:1000] # Cap to 1000 for serverless memory
        
    results = engine.predict_batch(records)
    high_risk_count = sum(1 for r in results if r['risk_tier'] == 'High')
    mod_risk_count = sum(1 for r in results if r['risk_tier'] == 'Moderate')
    low_risk_count = sum(1 for r in results if r['risk_tier'] == 'Low')
    
    return {
        "filename": file.filename,
        "total_processed": len(results),
        "summary": {
            "high_risk": high_risk_count,
            "moderate_risk": mod_risk_count,
            "low_risk": low_risk_count,
            "average_risk_percentage": round(sum(r['risk_percentage'] for r in results) / len(results), 1) if results else 0.0
        },
        "predictions": results
    }
