import os
import json
import numpy as np
import lightgbm as lgb
import pandas as pd

class ClinicalInferenceEngine:
    def __init__(self, artifacts_dir='artifacts'):
        self.artifacts_dir = artifacts_dir
        
        # Load preprocessing config
        config_path = os.path.join(artifacts_dir, 'preprocessing_config.json')
        with open(config_path, 'r', encoding='utf-8') as f:
            self.config = json.load(f)
            
        self.feature_cols = self.config['feature_cols']
        self.numeric_features = self.config['numeric_features']
        self.categorical_features = self.config['categorical_features']
        self.category_maps = self.config['category_maps']
        self.imputation_defaults = self.config['imputation_defaults']
        
        # Load LightGBM booster
        model_path = os.path.join(artifacts_dir, 'lightgbm_model.txt')
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
        self.booster = lgb.Booster(model_file=model_path)
        
        # Load Model Metadata
        meta_path = os.path.join(artifacts_dir, 'model_metadata.json')
        if os.path.exists(meta_path):
            with open(meta_path, 'r', encoding='utf-8') as f:
                self.metadata = json.load(f)
        else:
            self.metadata = {'default_threshold': 0.50, 'clinical_decision_threshold': 0.55}
            
        self.decision_threshold = self.metadata.get('clinical_decision_threshold', 0.50)

    def preprocess_record(self, record: dict) -> np.ndarray:
        """
        Preprocesses a single patient record into a model-ready numerical feature vector.
        """
        vector = []
        
        # Extract or derive numeric values
        num_vals = {}
        for feat in self.numeric_features:
            if feat in ['polypharmacy', 'prior_inpatient_flag', 'high_utilizer']:
                continue
            val = record.get(feat, 0)
            try:
                num_vals[feat] = float(val) if val is not None and val != '' else 0.0
            except (ValueError, TypeError):
                num_vals[feat] = 0.0
                
        # Derived features
        num_meds = num_vals.get('num_medications', 0.0)
        num_inpatient = num_vals.get('number_inpatient', 0.0)
        num_emergency = num_vals.get('number_emergency', 0.0)
        
        num_vals['polypharmacy'] = 1.0 if num_meds >= 10 else 0.0
        num_vals['prior_inpatient_flag'] = 1.0 if num_inpatient > 0 else 0.0
        num_vals['high_utilizer'] = 1.0 if (num_inpatient + num_emergency) >= 2 else 0.0
        
        # Build vector following self.feature_cols ordering
        for feat in self.feature_cols:
            if feat in self.numeric_features:
                vector.append(num_vals.get(feat, 0.0))
            elif feat in self.categorical_features:
                val = str(record.get(feat, self.imputation_defaults.get(feat, ''))).strip()
                mapping = self.category_maps.get(feat, {})
                encoded_val = mapping.get(val, 0)
                vector.append(float(encoded_val))
                
        return np.array(vector, dtype=np.float32)

    def generate_clinical_explanation(self, feature_name: str, shap_val: float, raw_val) -> str:
        """
        Provides plain-English, clinically grounded interpretations of feature impact.
        Distinguishes statistical model associations from clinical causation.
        """
        direction = "increased" if shap_val > 0 else "reduced"
        
        explanations = {
            'number_inpatient': f"Prior inpatient hospital stays ({raw_val} in past year) {direction} predicted readmission risk, reflecting baseline chronic illness acuity and frequent acute decompensations.",
            'number_emergency': f"Emergency department utilization ({raw_val} visits in past year) {direction} risk, serving as an indicator of ambulatory instability.",
            'time_in_hospital': f"Hospital length of stay ({raw_val} days) {direction} risk, associated with acute encounter complexity and prolonged recovery.",
            'num_medications': f"Medication regimen complexity ({raw_val} distinct medications) {direction} risk, indicating multi-morbidity and potential polypharmacy challenges.",
            'number_diagnoses': f"Number of comorbid diagnoses ({raw_val} codes) {direction} risk, indicating multi-organ disease burden.",
            'discharge_disposition': f"Discharge disposition ('{raw_val}') {direction} risk; post-acute transition pathway is a critical determinant of 30-day stability.",
            'admission_type': f"Admission route ('{raw_val}') {direction} risk, distinguishing unplanned acute emergencies from scheduled care.",
            'insulin': f"Insulin regimen status ('{raw_val}') {direction} risk; dosage adjustments or insulin requirement often reflect advanced beta-cell dysfunction or glycemic lability.",
            'A1Cresult': f"HbA1c biomarker result ('{raw_val}') {direction} risk, reflecting chronic glycemic control status.",
            'diag_1_group': f"Primary diagnosis category ('{raw_val}') {direction} risk relative to population baseline.",
            'medical_specialty': f"Admitting specialty ('{raw_val}') {direction} predicted risk.",
            'age': f"Patient age bracket ('{raw_val}') {direction} risk, representing demographic age-related vulnerability."
        }
        
        return explanations.get(
            feature_name,
            f"Feature '{feature_name}' (value: '{raw_val}') {direction} readmission log-odds by {abs(shap_val):.3f}."
        )

    def predict_encounter(self, record: dict) -> dict:
        """
        Performs full inference + exact Tree SHAP explainability on a single encounter.
        """
        vec = self.preprocess_record(record)
        vec_2d = vec.reshape(1, -1)
        
        # 1. Probability prediction
        prob = float(self.booster.predict(vec_2d)[0])
        
        # 2. Exact Tree SHAP values: shape (1, n_features + 1)
        shap_raw = self.booster.predict(vec_2d, pred_contrib=True)[0]
        feature_shaps = shap_raw[:-1]
        base_bias = float(shap_raw[-1])
        base_prob = float(1 / (1 + np.exp(-base_bias)))
        
        # 3. Categorize Risk Tier
        if prob < 0.15:
            risk_tier = "Low"
            risk_color = "emerald"
            clinical_guidance = "Routine post-discharge follow-up recommended. Baseline standard transitional care instructions."
        elif prob < 0.30:
            risk_tier = "Moderate"
            risk_color = "amber"
            clinical_guidance = "Enhanced transitional care advised. Consider telephone check-in within 48-72 hours and medication reconciliation."
        else:
            risk_tier = "High"
            risk_color = "rose"
            clinical_guidance = "Intensive care-coordination priority. Consider early home-health consultation, expedited primary care follow-up within 7 days, and targeted diabetic education."
            
        binary_prediction = int(prob >= self.decision_threshold)
        
        # 4. Feature Contributions
        contributions = []
        for i, feat in enumerate(self.feature_cols):
            s_val = float(feature_shaps[i])
            raw_v = record.get(feat, self.imputation_defaults.get(feat, ''))
            contributions.append({
                'feature': feat,
                'shap_value': round(s_val, 4),
                'abs_shap': round(abs(s_val), 4),
                'raw_value': raw_v,
                'direction': 'increases_risk' if s_val > 0 else 'decreases_risk',
                'explanation': self.generate_clinical_explanation(feat, s_val, raw_v)
            })
            
        # Sort contributions by absolute magnitude
        contributions.sort(key=lambda x: x['abs_shap'], reverse=True)
        top_positive = [c for c in contributions if c['shap_value'] > 0][:5]
        top_negative = [c for c in contributions if c['shap_value'] < 0][:5]
        
        return {
            'probability': round(prob, 4),
            'risk_percentage': round(prob * 100, 1),
            'risk_tier': risk_tier,
            'risk_color': risk_color,
            'binary_prediction': binary_prediction,
            'decision_threshold': round(self.decision_threshold, 4),
            'base_probability': round(base_prob, 4),
            'base_log_odds': round(base_bias, 4),
            'clinical_guidance': clinical_guidance,
            'top_risk_drivers': top_positive,
            'top_protective_factors': top_negative,
            'all_contributions': contributions[:12] # Top 12 for UI waterfall
        }

    def predict_batch(self, records: list) -> list:
        """
        Performs fast batch prediction for uploaded CSV records.
        """
        results = []
        vectors = [self.preprocess_record(r) for r in records]
        if not vectors:
            return []
            
        matrix = np.vstack(vectors)
        probs = self.booster.predict(matrix)
        shap_matrix = self.booster.predict(matrix, pred_contrib=True)[:, :-1]
        
        for idx, (rec, p, shaps) in enumerate(zip(records, probs, shap_matrix)):
            p_float = float(p)
            tier = "Low" if p_float < 0.15 else ("Moderate" if p_float < 0.30 else "High")
            
            # Find strongest single risk driver
            max_idx = int(np.argmax(shaps))
            driver_feat = self.feature_cols[max_idx]
            driver_val = rec.get(driver_feat, '')
            driver_impact = round(float(shaps[max_idx]), 3)
            
            results.append({
                'row_index': idx + 1,
                'encounter_id': rec.get('encounter_id', f'REC-{idx+1}'),
                'patient_nbr': rec.get('patient_nbr', 'N/A'),
                'age': rec.get('age', 'N/A'),
                'gender': rec.get('gender', 'N/A'),
                'probability': round(p_float, 4),
                'risk_percentage': round(p_float * 100, 1),
                'risk_tier': tier,
                'prediction_binary': int(p_float >= self.decision_threshold),
                'primary_risk_driver': f"{driver_feat} ({driver_val}) [+{driver_impact}]"
            })
            
        return results

if __name__ == '__main__':
    # Test inference engine with a sample encounter
    engine = ClinicalInferenceEngine()
    with open('artifacts/sample_encounters.json', 'r') as f:
        samples = json.load(f)
    print(f"Loaded {len(samples)} samples. Running test inference on sample 0...")
    result = engine.predict_encounter(samples[0])
    print(f"Prediction result: Prob={result['probability']}, Tier={result['risk_tier']}")
    print(f"Top Risk Driver: {result['top_risk_drivers'][0]['feature']} ({result['top_risk_drivers'][0]['raw_value']}) -> {result['top_risk_drivers'][0]['shap_value']}")
    print("Inference test passed!")
