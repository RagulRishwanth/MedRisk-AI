# MedRisk AI: Responsible AI, Privacy & Clinical Limitations

## 1. Intended Use & Regulatory Boundaries
- **Research & Decision-Support**: MedRisk AI is developed strictly for research, quality improvement analytics, and clinical educational purposes.
- **Non-Diagnostic Device**: It is **not** an FDA-cleared Software as a Medical Device (SaMD) and must never be used as a standalone diagnostic tool or to restrict patient access to care.
- **Physician Oversight**: All discharge and follow-up clinical decisions must remain under the direct authority of licensed clinicians.

---

## 2. Privacy & Data Minimization
- **Zero Permanent Storage**: CSV batch uploads and manual patient assessments are processed purely in ephemeral serverless RAM. No patient inputs are written to disk or persistent databases.
- **De-Identification**: Raw identifiers (`encounter_id`, `patient_nbr`) are stripped from feature vectors before model scoring to prevent memorization or patient re-identification.
- **No Third-Party Transmission**: Inference runs entirely within the deployed Vercel serverless environment; no patient data is transmitted to third-party commercial LLM or analytics APIs.

---

## 3. Dataset & Algorithmic Limitations
1. **Historical EHR Nature**: The dataset reflects inpatient care across 130 US hospitals between 1999 and 2008. Clinical treatment paradigms (such as SGLT2 inhibitors and GLP-1 receptor agonists) have evolved since this data was collected.
2. **Missing Social Determinants of Health (SDOH)**: Crucial predictors of 30-day readmission—including food security, transportation availability, health literacy, and family caregiver support—are not captured in billing claims.
3. **Outpatient Medication Adherence**: Inpatient EHR data captures medications ordered and modified in hospital, but does not capture post-discharge prescription fulfillment or outpatient adherence.
4. **Class Imbalance**: Ground truth 30-day readmission occurs in approximately 11.4% of encounters. While balanced class weights and threshold calibration are applied, positive predictive value (precision) is constrained by disease prevalence.
