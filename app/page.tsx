'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  AlertTriangle,
  TrendingUp,
  Award,
  ArrowRight,
  Activity,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';

// Import local artifacts as instantaneous static fallback
import defaultOverview from '@/artifacts/dashboard_overview.json';
import defaultMetadata from '@/artifacts/model_metadata.json';

export default function ExecutiveDashboard() {
  const [overview, setOverview] = useState<any>(defaultOverview);
  const [metadata, setMetadata] = useState<any>(defaultMetadata);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchFreshData() {
      try {
        const res = await fetch('/api/overview');
        if (res.ok) {
          const data = await res.json();
          if (data.overview) setOverview(data.overview);
          if (data.model_metadata) setMetadata(data.model_metadata);
        }
      } catch (err) {
        // Retain default artifacts seamlessly
      }
    }
    fetchFreshData();
  }, []);

  const ageData = overview.age_analytics || [];
  const admissionData = overview.admission_analytics || [];

  return (
    <div className="space-y-6">
      {/* Prominent Clinical Disclaimer */}
      <DisclaimerBanner />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-8 text-white shadow-md border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-medium border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clinical Intelligence Platform</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hospital Readmission Risk Intelligence
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Estimates 30-day unplanned readmission probability for diabetic inpatient admissions using gradient-boosted trees and exact Tree SHAP attribution. Built strictly for single-project Vercel serverless deployment.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/predict"
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Assess Individual Patient</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/models"
              className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-700 transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-teal-400" />
              <span>Inspect Model Benchmarks</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Encounters
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {(overview.total_encounters || 99343).toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>{overview.unique_patients?.toLocaleString() || '70,052'} unique patients</span>
            </p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              30-Day Readmissions
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {overview.overall_readmission_rate || 11.39}%
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {(overview.high_risk_encounters || 11314).toLocaleString()} historical readmissions
            </p>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Model ROC-AUC
            </p>
            <h3 className="text-2xl font-extrabold text-teal-600 mt-1">
              {metadata.best_roc_auc || 0.6659}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              LightGBM GBDT (Zero-Leakage Split)
            </p>
          </div>
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Decision Threshold
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {(metadata.clinical_decision_threshold || 0.55) * 100}%
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Sensitivity-calibrated clinical cutoff
            </p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Two Column Visualisation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readmission by Age */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                30-Day Readmission Rate by Patient Age
              </h3>
              <p className="text-xs text-slate-500">
                Percentage of hospitalizations followed by &lt;30-day readmission across age brackets
              </p>
            </div>
            <Link href="/population" className="text-xs text-teal-600 hover:underline font-medium">
              View All
            </Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="age_group"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Readmission Rate']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="readmission_rate" fill="#0d9488" radius={[4, 4, 0, 0]}>
                  {ageData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.readmission_rate > 12 ? '#f43f5e' : '#0d9488'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Readmission by Admission Type */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Readmission Risk by Admission Urgency
              </h3>
              <p className="text-xs text-slate-500">
                Emergency vs Urgent vs Elective inpatient encounters
              </p>
            </div>
            <Link href="/population" className="text-xs text-teal-600 hover:underline font-medium">
              Deep Dive
            </Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={admissionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="admission_type" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Readmission Rate']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="readmission_rate" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {admissionData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.admission_type === 'Emergency' ? '#f59e0b' : '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Link
          href="/predict"
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-teal-500/60 hover:shadow-md transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <HeartPulse className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mt-3">Individual Risk Assessment</h4>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate a specific encounter, view calibrated risk probability, and inspect patient-specific SHAP feature contributions.
          </p>
        </Link>

        <Link
          href="/batch"
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-teal-500/60 hover:shadow-md transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mt-3">CSV Batch Inference</h4>
          <p className="text-xs text-slate-500 mt-1">
            Upload hospital encounter cohorts in CSV format, validate clinical columns, and download enriched risk predictions.
          </p>
        </Link>

        <Link
          href="/explain"
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-teal-500/60 hover:shadow-md transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mt-3">Explainability Centre</h4>
          <p className="text-xs text-slate-500 mt-1">
            Explore global Tree SHAP rankings, learn how prior inpatient stays drive readmission risk, and inspect clinical limitations.
          </p>
        </Link>
      </div>
    </div>
  );
}
