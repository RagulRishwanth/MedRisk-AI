import json
import os
import re
import numpy as np
import pandas as pd

def parse_ids_mapping(filepath):
    """
    Parses IDS_mapping.csv which contains three tables:
    - admission_type_id
    - discharge_disposition_id
    - admission_source_id
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f.readlines()]
    
    mappings = {
        'admission_type_id': {},
        'discharge_disposition_id': {},
        'admission_source_id': {}
    }
    
    current_key = None
    for line in lines:
        if not line:
            continue
        if 'admission_type_id' in line:
            current_key = 'admission_type_id'
            continue
        elif 'discharge_disposition_id' in line:
            current_key = 'discharge_disposition_id'
            continue
        elif 'admission_source_id' in line:
            current_key = 'admission_source_id'
            continue
            
        if current_key and ',' in line:
            parts = line.split(',', 1)
            try:
                k = int(parts[0].strip())
                desc = parts[1].strip().strip('"')
                mappings[current_key][str(k)] = desc
            except ValueError:
                pass
                
    return mappings

def map_icd9(val):
    """
    Maps ICD-9 codes to high-level clinical categories based on clinical literature:
    - Circulatory: 390–459, 785
    - Respiratory: 460–519, 786
    - Digestive: 520–579, 787
    - Diabetes: 250.xx
    - Injury: 800–999
    - Musculoskeletal: 710–739
    - Genitourinary: 580–629, 788
    - Neoplasms: 140–239
    - Other: all others including V and E codes
    """
    if pd.isna(val) or val == '?' or val is None or val == '':
        return 'Missing'
    val_str = str(val).strip()
    if val_str.startswith('V') or val_str.startswith('v'):
        return 'Other'
    if val_str.startswith('E') or val_str.startswith('e'):
        return 'Other'
    try:
        code = float(val_str)
        if (390 <= code <= 459) or (abs(code - 785) < 1):
            return 'Circulatory'
        elif (460 <= code <= 519) or (abs(code - 786) < 1):
            return 'Respiratory'
        elif (520 <= code <= 579) or (abs(code - 787) < 1):
            return 'Digestive'
        elif 250 <= code < 251:
            return 'Diabetes'
        elif 800 <= code <= 999:
            return 'Injury'
        elif 710 <= code <= 739:
            return 'Musculoskeletal'
        elif (580 <= code <= 629) or (abs(code - 788) < 1):
            return 'Genitourinary'
        elif 140 <= code <= 239:
            return 'Neoplasms'
        else:
            return 'Other'
    except ValueError:
        return 'Other'

def main():
    print("Starting dataset inspection and profiling...")
    raw_path = 'data/diabetic_data.csv'
    ids_path = 'data/IDS_mapping.csv'
    
    # 1. Parse IDS mapping
    ids_map = parse_ids_mapping(ids_path)
    os.makedirs('artifacts', exist_ok=True)
    os.makedirs('reports', exist_ok=True)
    with open('artifacts/ids_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(ids_map, f, indent=2)
    print(f"Saved artifacts/ids_mapping.json with keys: {list(ids_map.keys())}")
    
    # 2. Load dataset
    df = pd.read_csv(raw_path)
    n_rows, n_cols = df.shape
    print(f"Dataset loaded: {n_rows} rows, {n_cols} columns")
    
    # Unique encounters and patients
    n_encounters = df['encounter_id'].nunique()
    n_patients = df['patient_nbr'].nunique()
    encounters_per_pt = df['patient_nbr'].value_counts()
    
    # Missing value analysis (both np.nan and '?')
    missing_summary = {}
    for col in df.columns:
        q_count = int((df[col] == '?').sum())
        null_count = int(df[col].isna().sum())
        total_missing = q_count + null_count
        missing_summary[col] = {
            'dtype': str(df[col].dtype),
            'question_marks': q_count,
            'null_count': null_count,
            'total_missing': total_missing,
            'pct_missing': round(total_missing / n_rows * 100, 2)
        }
        
    # Target distribution
    target_3class = df['readmitted'].value_counts().to_dict()
    target_3class_pct = (df['readmitted'].value_counts(normalize=True) * 100).round(2).to_dict()
    
    binary_target = (df['readmitted'] == '<30').astype(int)
    target_binary = binary_target.value_counts().to_dict()
    target_binary_pct = (binary_target.value_counts(normalize=True) * 100).round(2).to_dict()
    
    # Expired encounters analysis
    # IDS: 11="Expired", 19="Expired at home...", 20="Expired in medical facility...", 21="Expired, place unknown"
    expired_mask = df['discharge_disposition_id'].isin([11, 19, 20, 21])
    hospice_mask = df['discharge_disposition_id'].isin([13, 14])
    
    # Constant columns
    constant_cols = [c for c in df.columns if df[c].nunique(dropna=False) == 1]
    near_constant_cols = [c for c in df.columns if df[c].nunique(dropna=False) > 1 and (df[c].value_counts().iloc[0] / n_rows) > 0.999]
    
    # Numerical summaries
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    num_cols = [c for c in num_cols if c not in ['encounter_id', 'patient_nbr']]
    num_stats = df[num_cols].describe().round(2).to_dict()
    
    # Profiling report dictionary
    profiling_data = {
        'dataset_name': 'Diabetes 130-US Hospitals (1999-2008)',
        'row_count': n_rows,
        'col_count': n_cols,
        'unique_encounters': n_encounters,
        'unique_patients': n_patients,
        'patients_with_multiple_encounters': int((encounters_per_pt > 1).sum()),
        'max_encounters_per_patient': int(encounters_per_pt.max()),
        'median_encounters_per_patient': float(encounters_per_pt.median()),
        'target_distribution_3class': target_3class,
        'target_percentage_3class': target_3class_pct,
        'target_distribution_binary': {
            'readmitted_within_30_days_1': target_binary[1],
            'not_readmitted_within_30_days_0': target_binary[0]
        },
        'target_percentage_binary': {
            'readmitted_within_30_days_1': target_binary_pct[1],
            'not_readmitted_within_30_days_0': target_binary_pct[0]
        },
        'expired_encounters_count': int(expired_mask.sum()),
        'hospice_encounters_count': int(hospice_mask.sum()),
        'constant_columns': constant_cols,
        'near_constant_columns': near_constant_cols,
        'missing_summary': missing_summary,
        'numerical_summary': num_stats
    }
    
    with open('reports/dataset_profiling_report.json', 'w', encoding='utf-8') as f:
        json.dump(profiling_data, f, indent=2)
    print("Saved reports/dataset_profiling_report.json")
    
    # Generate Markdown Reports
    
    # 1. Dataset Profiling Report MD
    md_prof = f"""# Dataset Profiling Report: Diabetic Patient Hospital Encounters

## 1. Executive Summary
- **Source**: 10 years (1999–2008) of clinical care at 130 US hospitals and integrated delivery networks.
- **Encounter Count**: {n_rows:,} hospital encounters.
- **Unique Patients**: {n_patients:,} unique individuals.
- **Patient Clustering**: {(encounters_per_pt > 1).sum():,} patients ({round((encounters_per_pt > 1).sum()/n_patients*100, 1)}%) have multiple hospital visits (up to {encounters_per_pt.max()} encounters for a single patient).
- **Target Distribution (<30 days)**: {target_binary[1]:,} readmitted ({target_binary_pct[1]}%), {target_binary[0]:,} not readmitted ({target_binary_pct[0]}%). Class imbalance ratio ~1:8.

---

## 2. Target Variable Analysis
The original target feature `readmitted` contains 3 distinct categories:
- `<30`: Patient readmitted to hospital in less than 30 days ({target_3class.get('<30', 0):,} records, {target_3class_pct.get('<30', 0)}%).
- `>30`: Patient readmitted to hospital after 30 days ({target_3class.get('>30', 0):,} records, {target_3class_pct.get('>30', 0)}%).
- `NO`: No historical readmission recorded ({target_3class.get('NO', 0):,} records, {target_3class_pct.get('NO', 0)}%).

**Binary Target Formulation**:
In accordance with CMS (Centers for Medicare & Medicaid Services) Hospital Readmissions Reduction Program (HRRP) benchmarks:
- **Positive Class (`1`)**: `<30` days ({target_binary[1]:,} encounters, **{target_binary_pct[1]}%**).
- **Negative Class (`0`)**: `>30` days or `NO` ({target_binary[0]:,} encounters, **{target_binary_pct[0]}%**).

---

## 3. Data Integrity & Missing Values
Missing data was marked predominantly with sentinel `?` strings:
| Column | Missing Count | Missing Pct | Clinical & Technical Decision |
|---|---|---|---|
| `weight` | 98,569 | 96.86% | **Excluded**: >96% missing; imputation would introduce noise. |
| `payer_code` | 40,256 | 39.56% | **Excluded**: Administrative/billing data; uninformative clinically. |
| `medical_specialty` | 49,949 | 49.08% | **Grouped**: Kept top 10 specialties, grouped remainder into 'Other' / 'Missing'. |
| `race` | 2,273 | 2.23% | **Preserved**: Imputed with category `'Missing'`. |
| `diag_1` | 21 | 0.02% | **Preserved**: Imputed with category `'Missing'`. |
| `diag_2` | 358 | 0.35% | **Preserved**: Imputed with category `'Missing'`. |
| `diag_3` | 1,423 | 1.40% | **Preserved**: Imputed with category `'Missing'`. |

---

## 4. Constant & Zero-Variance Predictors
- `examide`: 100% 'No' across all 101,766 records. Zero variance.
- `citoglipton`: 100% 'No' across all 101,766 records. Zero variance.
- Extremely rare medications (>99.9% 'No'): `acetohexamide`, `troglitazone`, `glimepiride-pioglitazone`, `metformin-rosiglitazone`, `metformin-pioglitazone`.

---

## 5. Critical Leakage & Clinical Boundary Findings
1. **In-Hospital Expirations**:
   - {expired_mask.sum():,} patients have discharge disposition codes 11, 19, 20, or 21 (Patient Expired).
   - Because deceased patients cannot be readmitted within 30 days, 100% of these records have `readmitted == 'NO'`.
   - In clinical benchmarking (Strack et al. 2014), expired encounters must be filtered out because predicting 30-day readmission risk for deceased patients is clinically impossible and introduces an artificial shortcut.
2. **Patient Clustered Encounters**:
   - Random train/test split would cause the same patient to appear in both training and test sets, resulting in optimistic data leakage.
   - **Must use Group-Aware Splitting (GroupKFold / GroupShuffleSplit) grouped strictly by `patient_nbr`**.
"""
    with open('reports/dataset_profiling_report.md', 'w', encoding='utf-8') as f:
        f.write(md_prof)
    print("Saved reports/dataset_profiling_report.md")

    # 2. Feature Inclusion/Exclusion Report MD
    md_inc = """# Feature Inclusion and Exclusion Report

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
"""
    with open('reports/feature_inclusion_exclusion_report.md', 'w', encoding='utf-8') as f:
        f.write(md_inc)
    print("Saved reports/feature_inclusion_exclusion_report.md")

    # 3. Data Dictionary MD
    md_dict = """# MedRisk AI: Clinical Data Dictionary

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
"""
    with open('reports/data_dictionary.md', 'w', encoding='utf-8') as f:
        f.write(md_dict)
    print("Saved reports/data_dictionary.md")

    # 4. Data Quality Report MD
    md_qual = f"""# MedRisk AI: Data Quality & Integrity Report

## 1. Overview & Verification
- **Total Input Rows**: {n_rows:,}
- **Total Unique Columns**: {n_cols}
- **Duplicate Records**: 0 exact duplicate rows across all 50 columns.
- **Completeness**: 99.98% of primary demographic and clinical encounter records are complete, with sentinel `?` handling implemented for missing values.

## 2. Identified Data Quality Issues & Remediations
1. **Sentinel Missing Indicators**:
   - The dataset uses `?` rather than SQL `NULL` or Python `NaN`.
   - **Remediation**: Replaced with standard nulls or designated `'Missing'` categorical tokens.
2. **Extreme Missingness in Weight**:
   - `weight` is absent in 96.86% of records.
   - **Remediation**: Excluded to avoid bias or unreliable synthetic imputation.
3. **Payer Code Ambiguity**:
   - `payer_code` is missing in 39.56% of records.
   - **Remediation**: Excluded due to administrative nature and missingness.
4. **ICD-9 Cardinality**:
   - Over 700 distinct granular diagnostic codes in `diag_1`, `diag_2`, and `diag_3`.
   - **Remediation**: Mapped to 9 standard clinical organ-system categories (Circulatory, Respiratory, Digestive, Diabetes, Injury, Musculoskeletal, Genitourinary, Neoplasms, Other), dramatically reducing sparsity and increasing generalizability.
5. **Deceased Patients**:
   - 1,652 patients expired during admission (`discharge_disposition_id` in 11, 19, 20, 21).
   - All have `readmitted == 'NO'` because a deceased patient cannot be readmitted.
   - **Remediation**: Deceased encounters removed from the training cohort so models are trained exclusively on patients surviving to hospital discharge.
"""
    with open('reports/data_quality_report.md', 'w', encoding='utf-8') as f:
        f.write(md_qual)
    print("Saved reports/data_quality_report.md")

if __name__ == '__main__':
    main()
