# MedRisk AI: Clinical Data Dictionary

| Variable Name | Type | Storage Domain | Description & Clinical Meaning |
|---|---|---|---|
| `encounter_id` | Integer | Identifier | Unique numeric identifier of the hospital encounter. Excluded from features. |
| `patient_nbr` | Integer | Identifier | Unique numeric identifier for each patient. Used for grouping. |
| `race` | Categorical | Demographics | Patient self-reported race/ethnicity. |
| `gender` | Categorical | Demographics | Biological sex: Male, Female, Unknown. |
| `age` | Categorical | Demographics | 10-year age interval [0-10) to [90-100). |
| `admission_type_id` | Coded Categorical | Encounter | Admission route: Emergency (1), Urgent (2), Elective (3), etc. |
| `discharge_disposition_id` | Coded Categorical | Encounter | Discharge status: Home (1), SNF (3), Home Health (6), etc. |
| `admission_source_id` | Coded Categorical | Encounter | Source of referral: Physician (1), Clinic (2), ER (7), etc. |
| `time_in_hospital` | Integer (Days) | Utilization | Length of inpatient stay (1 to 14 days). |
| `medical_specialty` | Categorical | Clinical | Specialty of admitting or attending physician. |
| `num_lab_procedures` | Integer | Utilization | Number of laboratory tests performed during encounter. |
| `num_procedures` | Integer | Utilization | Number of operational and therapeutic procedures performed. |
| `num_medications` | Integer | Utilization | Distinct count of medications administered during hospital stay. |
| `number_outpatient` | Integer | History | Outpatient clinic encounters in the 12 months prior to admission. |
| `number_emergency` | Integer | History | Emergency room visits in the 12 months prior to admission. |
| `number_inpatient` | Integer | History | Inpatient admissions in the 12 months prior to admission. Strong readmission marker. |
| `number_diagnoses` | Integer | Clinical | Number of ICD-9 diagnosis codes recorded on the encounter claim. |
| `diag_1_group` | Categorical | Diagnosis | Primary ICD-9 diagnosis mapped to clinical disease cluster. |
| `diag_2_group` | Categorical | Diagnosis | Secondary ICD-9 diagnosis mapped to clinical disease cluster. |
| `diag_3_group` | Categorical | Diagnosis | Tertiary ICD-9 diagnosis mapped to clinical disease cluster. |
| `max_glu_serum` | Categorical | Biomarker | Serum glucose lab result: None, Norm, >200, >300 mg/dL. |
| `A1Cresult` | Categorical | Biomarker | Glycated hemoglobin test: None, Norm, >7%, >8%. |
| `insulin` | Categorical | Medication | Insulin regimen status: No, Steady, Up (dose increased), Down (decreased). |
| `change` | Binary Categorical | Medication | Whether diabetic medication dosage was modified during admission (Ch vs No). |
| `diabetesMed` | Binary Categorical | Medication | Whether diabetic medication was prescribed at discharge (Yes vs No). |
| `readmitted` | Binary / Categorical | Ground Truth | Original: `<30`, `>30`, `NO`. Binary Target: `1` if readmitted `<30` days, `0` otherwise. |
