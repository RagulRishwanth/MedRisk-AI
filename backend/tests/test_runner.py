import unittest
import os
import json
import numpy as np
from backend.ml.inference import ClinicalInferenceEngine

class TestMedRiskPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = ClinicalInferenceEngine(artifacts_dir='artifacts')
        with open('artifacts/sample_encounters.json', 'r', encoding='utf-8') as f:
            cls.samples = json.load(f)

    def test_engine_initialization(self):
        self.assertIsNotNone(self.engine.booster)
        self.assertEqual(len(self.engine.feature_cols), 29)
        self.assertEqual(len(self.engine.numeric_features), 11)
        self.assertEqual(len(self.engine.categorical_features), 18)

    def test_single_prediction_and_shap_consistency(self):
        sample = self.samples[0]
        result = self.engine.predict_encounter(sample)
        
        self.assertTrue(0.0 <= result['probability'] <= 1.0)
        self.assertIn(result['risk_tier'], ['Low', 'Moderate', 'High'])
        self.assertIn(result['binary_prediction'], [0, 1])
        self.assertGreater(len(result['top_risk_drivers']), 0)
        self.assertGreater(len(result['all_contributions']), 0)
        
        # Verify mathematical consistency
        vec = self.engine.preprocess_record(sample)
        raw_contribs = self.engine.booster.predict(vec.reshape(1, -1), pred_contrib=True)[0]
        total_log_odds = np.sum(raw_contribs)
        expected_prob = 1.0 / (1.0 + np.exp(-total_log_odds))
        self.assertAlmostEqual(result['probability'], expected_prob, places=4)

    def test_missing_and_corrupt_input(self):
        # Empty record
        res_empty = self.engine.predict_encounter({})
        self.assertTrue(0.0 <= res_empty['probability'] <= 1.0)
        self.assertIn(res_empty['risk_tier'], ['Low', 'Moderate', 'High'])
        
        # Corrupt fields
        res_corrupt = self.engine.predict_encounter({
            'time_in_hospital': 'bad_val',
            'num_medications': None,
            'age': 'invalid_age'
        })
        self.assertTrue(0.0 <= res_corrupt['probability'] <= 1.0)

    def test_batch_prediction(self):
        batch = self.engine.predict_batch(self.samples[:5])
        self.assertEqual(len(batch), 5)
        for item in batch:
            self.assertTrue(0.0 <= item['probability'] <= 1.0)
            self.assertIn(item['risk_tier'], ['Low', 'Moderate', 'High'])
            self.assertIn('primary_risk_driver', item)

    def test_metadata_and_zero_leakage(self):
        with open('artifacts/model_metadata.json', 'r', encoding='utf-8') as f:
            meta = json.load(f)
        self.assertGreater(meta['train_patients'], 0)
        self.assertGreater(meta['test_patients'], 0)
        self.assertGreater(meta['best_roc_auc'], 0.60)

if __name__ == '__main__':
    unittest.main()
