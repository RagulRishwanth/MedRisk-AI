'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldAlert,
  Sparkles,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';

import defaultShap from '@/artifacts/global_shap.json';

export default function ExplainabilityCentrePage() {
  const [shapData, setShapData] = useState<any>(defaultShap);

  useEffect(() => {
    async function loadFresh() {
      try {
        const res = await fetch('/api/explain');
        if (res.ok) {
          const json = await res.json();
          if (json.top_features) setShapData(json);
        }
      } catch (e) {
        // Fallback
      }
    }
    loadFresh();
  }, []);

  const features = shapData.top_features || [];

  const chartData = features.map((f: any) => ({
    name: f.feature.replace(/_/g, ' '),
    importance: f.importance,
    raw_feature: f.feature,
    min_shap: f.min_shap,
    max_shap: f.max_shap,
    mean_shap: f.mean_shap,
  }));

  return (
    <div className="space-y-6">
      <DisclaimerBanner compact />

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-teal-600" />
            <span>Explainability &amp; Clinical Interpretability Centre</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Global feature attribution, SHAP log-odds distributions, and clinical reasoning transparency.
          </p>
        </div>

        <div className="text-xs bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-slate-600">
          <span className="font-semibold text-slate-700">Baseline Expected Risk:</span>
          <span className="font-mono font-bold text-teal-600">
            {((shapData.base_risk_probability || 0.114) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Global SHAP Importance Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Global Mean |SHAP| Feature Importance Ranking</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
              Lundberg et al. TreeExplainer
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Average absolute impact on model log-odds across the representative inpatient cohort.
          </p>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 110, bottom: 5 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: 'Mean |SHAP Value| (Log-Odds Scale)', position: 'insideBottom', offset: -5, fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#334155' }}
                width={130}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1">
                        <div className="font-semibold text-sm capitalize">{data.name}</div>
                        <div>Mean Importance: <strong>{data.importance.toFixed(4)}</strong></div>
                        <div className="text-slate-300">SHAP Range: [{data.min_shap}, +{data.max_shap}]</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="importance" fill="#0d9488" radius={[0, 4, 4, 0]}>
                {chartData.map((_: any, idx: number) => (
                  <Cell key={idx} fill={idx < 3 ? '#0d9488' : '#2dd4bf'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clinical Feature Deep Dives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h4 className="font-bold text-slate-900 text-sm">Prior Acute Utilization Driving Risk</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The single strongest predictive feature across the diabetic cohort is <strong>Prior Inpatient Hospitalizations</strong> (`number_inpatient`). Patients with 2 or more prior hospital admissions in the preceding 12 months exhibit a dramatically higher baseline log-odds of early readmission. This aligns with clinical understanding of &ldquo;frequent-flier&rdquo; patterns driven by end-stage renal disease, severe glycemic instability, or congestive heart failure.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <h4 className="font-bold text-slate-900 text-sm">Post-Acute Disposition as a Transition Gate</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Discharge Disposition</strong> exerts significant influence. While discharge to home with self-care reduces predicted risk (as it implies clinical stability), transfer to Skilled Nursing Facilities (SNF) or Long Term Care elevates risk, representing frail patients with complex wound care or limited ambulatory resilience.
          </p>
        </div>
      </div>

      {/* Association vs Causation & Limitations Notice */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-teal-400">
          <AlertTriangle className="w-5 h-5" />
          <h4 className="font-bold text-sm">Clinical AI Ethics: Association vs Causality</h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          SHAP values isolate mathematical attributions within a predictive model. They do <strong>not</strong> prove that changing an input feature will directly alter the clinical outcome. For example, artificially reducing a patient&apos;s length of stay would not reduce their readmission risk; rather, length of stay serves as a proxy for disease severity during that hospital encounter.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px] text-slate-400 border-t border-slate-800">
          <div>
            <strong className="text-slate-200">Unmeasured Social Determinants:</strong> Food security, transportation, and health literacy are absent from EHR billing datasets.
          </div>
          <div>
            <strong className="text-slate-200">Post-Discharge Medication Adherence:</strong> Outpatient prescription fill rates cannot be observed in hospital inpatient claims.
          </div>
        </div>
      </div>
    </div>
  );
}
