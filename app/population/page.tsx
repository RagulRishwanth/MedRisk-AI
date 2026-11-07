'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import {
  BarChart3,
  Calendar,
  Layers,
  HeartPulse,
  Pill,
  Stethoscope,
  TrendingUp,
  Info
} from 'lucide-react';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';

import defaultOverview from '@/artifacts/dashboard_overview.json';

export default function PopulationAnalyticsPage() {
  const [data, setData] = useState<any>(defaultOverview);
  const [selectedMetric, setSelectedMetric] = useState<'age' | 'los' | 'diagnosis' | 'discharge' | 'meds'>('los');

  useEffect(() => {
    async function loadFresh() {
      try {
        const res = await fetch('/api/overview');
        if (res.ok) {
          const json = await res.json();
          if (json.overview) setData(json.overview);
        }
      } catch (e) {
        // Retain default artifacts
      }
    }
    loadFresh();
  }, []);

  const ageData = data.age_analytics || [];
  const losData = data.los_analytics || [];
  const diagnosisData = data.diagnosis_analytics || [];
  const dischargeData = data.discharge_analytics || [];
  const medChangeData = data.med_change_analytics || [];
  const insulinData = data.insulin_analytics || [];

  return (
    <div className="space-y-6">
      <DisclaimerBanner compact />

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-600" />
            <span>Population Clinical Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Epidemiological readmission patterns across {data.total_encounters?.toLocaleString() || '99,343'} diabetic inpatient encounters.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
          <button
            onClick={() => setSelectedMetric('los')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedMetric === 'los' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Length of Stay
          </button>
          <button
            onClick={() => setSelectedMetric('age')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedMetric === 'age' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Age Demographics
          </button>
          <button
            onClick={() => setSelectedMetric('diagnosis')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedMetric === 'diagnosis' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Diagnoses
          </button>
          <button
            onClick={() => setSelectedMetric('discharge')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedMetric === 'discharge' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Discharge Status
          </button>
          <button
            onClick={() => setSelectedMetric('meds')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedMetric === 'meds' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Medications
          </button>
        </div>
      </div>

      {/* Main Focus Chart Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        {selectedMetric === 'los' && (
          <>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hospital Length of Stay vs 30-Day Readmission Risk
              </h3>
              <p className="text-xs text-slate-500">
                Relationship between inpatient duration (1 to 14 days) and subsequent readmission rate.
              </p>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={losData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="days"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    label={{ value: 'Length of Stay (Days)', position: 'insideBottom', offset: -5, fontSize: 11 }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Readmission Rate']}
                    labelFormatter={(day) => `Length of Stay: ${day} Days`}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="readmission_rate"
                    stroke="#0d9488"
                    strokeWidth={3}
                    dot={{ fill: '#0d9488', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>
                <strong>Clinical Pattern:</strong> Patients with prolonged inpatient stays (7+ days) show significantly elevated readmission rates (up to 15.6%), reflecting systemic complications and severe acute illness.
              </span>
            </div>
          </>
        )}

        {selectedMetric === 'age' && (
          <>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                30-Day Readmission Rate by Patient Age Bracket
              </h3>
              <p className="text-xs text-slate-500">
                Higher readmission vulnerability is observed in patients aged 70 and older.
              </p>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <XAxis dataKey="age_group" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Readmission Rate']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="readmission_rate" fill="#0d9488" radius={[4, 4, 0, 0]}>
                    {ageData.map((e: any, idx: number) => (
                      <Cell key={idx} fill={e.readmission_rate >= 12 ? '#f43f5e' : '#0d9488'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {selectedMetric === 'diagnosis' && (
          <>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Readmission Risk by Primary Clinical Diagnosis Category
              </h3>
              <p className="text-xs text-slate-500">
                ICD-9 codes categorized into 9 high-level clinical disease organ systems.
              </p>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diagnosisData} layout="vertical" margin={{ top: 5, right: 20, left: 90, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="diagnosis_category" tick={{ fontSize: 11, fill: '#334155' }} width={100} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Readmission Rate']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="readmission_rate" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    {diagnosisData.map((e: any, idx: number) => (
                      <Cell key={idx} fill={e.readmission_rate > 11.5 ? '#f43f5e' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {selectedMetric === 'discharge' && (
          <>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Readmission Rates by Post-Acute Discharge Disposition
              </h3>
              <p className="text-xs text-slate-500">
                Patients discharged to post-acute nursing or specialized facilities face the highest 30-day readmission risk.
              </p>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dischargeData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <XAxis dataKey="discharge_disposition" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Readmission Rate']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="readmission_rate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {selectedMetric === 'meds' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase">Impact of Diabetic Medication Change</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={medChangeData}>
                    <XAxis dataKey="medication_changed" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(val: any) => [`${val}%`, 'Readmission Rate']} />
                    <Bar dataKey="readmission_rate" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase">Impact of Insulin Regimen Adjustment</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insulinData}>
                    <XAxis dataKey="insulin_status" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(val: any) => [`${val}%`, 'Readmission Rate']} />
                    <Bar dataKey="readmission_rate" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Key Epidemiological Findings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-2 w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Post-Acute Vulnerability</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Patients transferred to Skilled Nursing Facilities (SNF) have readmission rates exceeding 15.2%, versus 9.8% for routine home discharges.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-2 w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Glycemic Medication Lability</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inpatient titration or dosage adjustments in insulin regimens correlate with a ~3.2 percentage point higher readmission risk compared to stable regimens.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-2 w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Stethoscope className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Circulatory Multimorbidity</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Over 30% of diabetic patients present with primary circulatory conditions (congestive heart failure, CAD), which represent the largest volume of early readmissions.
          </p>
        </div>
      </div>
    </div>
  );
}
