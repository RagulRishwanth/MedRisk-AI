# Dataset Profiling Report: Diabetic Patient Hospital Encounters

## 1. Executive Summary
- **Source**: 10 years (1999–2008) of clinical care at 130 US hospitals and integrated delivery networks.
- **Encounter Count**: 101,766 hospital encounters.
- **Unique Patients**: 71,518 unique individuals.
- **Patient Clustering**: 16,773 patients (23.5%) have multiple hospital visits (up to 40 encounters for a single patient).
- **Target Distribution (<30 days)**: 11,357 readmitted (11.16%), 90,409 not readmitted (88.84%). Class imbalance ratio ~1:8.

---

## 2. Target Variable Analysis
The original target feature `readmitted` contains 3 distinct categories:
- `<30`: Patient readmitted to hospital in less than 30 days (11,357 records, 11.16%).
- `>30`: Patient readmitted to hospital after 30 days (35,545 records, 34.93%).
- `NO`: No historical readmission recorded (54,864 records, 53.91%).

**Binary Target Formulation**:
In accordance with CMS (Centers for Medicare & Medicaid Services) Hospital Readmissions Reduction Program (HRRP) benchmarks:
- **Positive Class (`1`)**: `<30` days (11,357 encounters, **11.16%**).
- **Negative Class (`0`)**: `>30` days or `NO` (90,409 encounters, **88.84%**).

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
   - 1,652 patients have discharge disposition codes 11, 19, 20, or 21 (Patient Expired).
   - Because deceased patients cannot be readmitted within 30 days, 100% of these records have `readmitted == 'NO'`.
   - In clinical benchmarking (Strack et al. 2014), expired encounters must be filtered out because predicting 30-day readmission risk for deceased patients is clinically impossible and introduces an artificial shortcut.
2. **Patient Clustered Encounters**:
   - Random train/test split would cause the same patient to appear in both training and test sets, resulting in optimistic data leakage.
   - **Must use Group-Aware Splitting (GroupKFold / GroupShuffleSplit) grouped strictly by `patient_nbr`**.
