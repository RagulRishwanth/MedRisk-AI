# Feature Inclusion and Exclusion Report

## 1. Clinical Context & Prediction Horizon
- **Prediction Point**: Patient discharge from inpatient hospital stay.
- **Objective**: Assess 30-day unplanned readmission probability to guide post-discharge transitional care.

## 2. Excluded Features (With Clinical & Technical Justifications)
| Feature Name | Reason for Exclusion |
|---|---|
| `encounter_id` | Arbitrary database primary key; unique per row; causes memorisation and data leakage. |
| `patient_nbr` | Patient identifier; excluded from feature matrix to prevent patient memorisation (used only for group-aware splitting). |
| `readmitted` | Ground truth target variable; must be excluded from predictor matrix. |
| `weight` | 96.86% missing data. Unreliable clinical capture in historical EHR. |
| `payer_code` | 39.56% missing data; administrative/insurance reimbursement code unrelated to patient physiology; introduces socioeconomic bias without clinical utility. |
| `examide` | Constant column (100% 'No'); zero variance. |
| `citoglipton` | Constant column (100% 'No'); zero variance. |
| `acetohexamide` | Only 1 positive instance across 101,766 records. |
| `glimepiride-pioglitazone` | Only 1 positive instance across 101,766 records. |
| `metformin-pioglitazone` | Only 1 positive instance across 101,766 records. |
| `metformin-rosiglitazone` | Only 2 positive instances across 101,766 records. |
| `troglitazone` | Only 3 positive instances across 101,766 records (withdrawn from market). |

## 3. Included Predictors (Available at Prediction Point)
### Demographics
- `race`: Caucasian, AfricanAmerican, Hispanic, Asian, Other, Missing.
- `gender`: Male, Female (3 unknown excluded/imputed).
- `age`: Grouped in 10-year age brackets ([0-10) through [90-100)).

### Encounter Characteristics
- `admission_type_id`: Emergency, Urgent, Elective, Newborn, Trauma Center, etc.
- `discharge_disposition_id`: Discharged to home, SNF, home health service, etc. (Deceased encounters excluded from training population).
- `admission_source_id`: Physician referral, Emergency room, Transfer, etc.
- `time_in_hospital`: Length of stay in days (integer 1-14).
- `medical_specialty`: Admitting/treating specialty (grouped to Top 10 + Other/Missing).

### Clinical Utilization & Prior History
- `num_lab_procedures`: Total number of lab tests performed during encounter (1-132).
- `num_procedures`: Total non-lab procedures during encounter (0-6).
- `num_medications`: Distinct medication orders (1-81).
- `number_outpatient`: Number of outpatient visits in prior year (0-42).
- `number_emergency`: Number of emergency visits in prior year (0-76).
- `number_inpatient`: Number of inpatient hospital stays in prior year (0-21). High clinical prognostic value.
- `number_diagnoses`: Total diagnosis codes recorded (1-16).

### Diagnostic Categorization (ICD-9 to Clinical Groups)
- `diag_1_group`: Primary diagnosis (Circulatory, Respiratory, Digestive, Diabetes, Injury, Musculoskeletal, Genitourinary, Neoplasms, Other).
- `diag_2_group`: Secondary diagnosis (Circulatory, Respiratory, Digestive, Diabetes, Injury, Musculoskeletal, Genitourinary, Neoplasms, Other).
- `diag_3_group`: Tertiary diagnosis (Circulatory, Respiratory, Digestive, Diabetes, Injury, Musculoskeletal, Genitourinary, Neoplasms, Other).

### Glycemic & Lab Biomarkers
- `max_glu_serum`: Blood glucose serum test result: None, Norm, >200, >300.
- `A1Cresult`: Glycated hemoglobin (HbA1c) test result: None, Norm, >7, >8.

### Diabetic Medications & Treatment Adjustments
- `metformin`, `repaglinide`, `nateglinide`, `chlorpropamide`, `glimepiride`, `glipizide`, `glyburide`, `tolbutamide`, `pioglitazone`, `rosiglitazone`, `acarbose`, `miglitol`, `tolazamide`, `insulin`, `glyburide-metformin`, `glipizide-metformin`: Medication dosage adjustment status (No, Steady, Up, Down).
- `change`: Any diabetic medication dosage modification during encounter (Ch / No).
- `diabetesMed`: Prescribed any anti-diabetic medication (Yes / No).
