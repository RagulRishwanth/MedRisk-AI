# MedRisk AI: Data Quality & Integrity Report

## 1. Overview & Verification
- **Total Input Rows**: 101,766
- **Total Unique Columns**: 50
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
