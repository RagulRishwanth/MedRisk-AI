import unittest
import json
import io
from fastapi.testclient import TestClient
from api.index import app

class TestMedRiskAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_endpoint(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["model_loaded"])
        self.assertEqual(data["features_loaded"], 29)

    def test_overview_endpoint(self):
        response = self.client.get("/api/overview")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("overview", data)
        self.assertIn("total_encounters", data["overview"])
        self.assertIn("overall_readmission_rate", data["overview"])
        self.assertIn("model_metadata", data)

    def test_encounters_endpoint(self):
        response = self.client.get("/api/encounters")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("encounters", data)
        self.assertGreaterEqual(len(data["encounters"]), 1)

    def test_explain_endpoint(self):
        response = self.client.get("/api/explain")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("top_features", data)
        self.assertIn("expected_value", data)

    def test_models_endpoint(self):
        response = self.client.get("/api/models")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("models", data)
        self.assertIn("curves", data)
        self.assertIn("LightGBM", data["models"])

    def test_predict_endpoint(self):
        payload = {
            "encounter_id": "TEST-101",
            "patient_nbr": "PT-999",
            "age": "[70-80)",
            "gender": "Female",
            "race": "Caucasian",
            "admission_type": "Emergency",
            "discharge_disposition": "Home",
            "admission_source": "Emergency Room",
            "time_in_hospital": 4,
            "medical_specialty": "InternalMedicine",
            "num_lab_procedures": 45,
            "num_procedures": 1,
            "num_medications": 14,
            "number_outpatient": 0,
            "number_emergency": 1,
            "number_inpatient": 2,
            "number_diagnoses": 9,
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
        response = self.client.post("/api/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("probability", data)
        self.assertIn("risk_tier", data)
        self.assertIn("top_risk_drivers", data)
        self.assertIn("all_contributions", data)
        self.assertTrue(0.0 <= data["probability"] <= 1.0)

    def test_batch_predict_json(self):
        payload = {
            "encounters": [
                {"encounter_id": "BATCH-1", "age": "[50-60)", "number_inpatient": 0},
                {"encounter_id": "BATCH-2", "age": "[80-90)", "number_inpatient": 3}
            ]
        }
        response = self.client.post("/api/batch-predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_processed"], 2)
        self.assertIn("summary", data)
        self.assertEqual(len(data["predictions"]), 2)

    def test_batch_predict_csv_upload(self):
        csv_content = """encounter_id,age,gender,time_in_hospital,number_inpatient,insulin\nE101,[60-70),Female,4,1,Steady\nE102,[70-80),Male,2,0,No\n"""
        files = {
            "file": ("test_encounters.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
        }
        response = self.client.post("/api/batch-predict-csv", files=files)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_processed"], 2)
        self.assertIn("summary", data)
        self.assertEqual(len(data["predictions"]), 2)

if __name__ == '__main__':
    unittest.main()
