'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

interface ContributionItem {
  feature: string;
  shap_value: number;
  abs_shap: number;
  raw_value: any;
  direction: string;
  explanation: string;
}

interface ShapWaterfallProps {
  contributions: ContributionItem[];
  baseProbability?: number;
}

export const ShapWaterfall: React.FC<ShapWaterfallProps> = ({
  contributions,
  baseProbability
}) => {
  if (!contributions || contributions.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
        No feature explanation data available for this encounter.
      </div>
    );
  }

  // Format features for Recharts display
  const chartData = contributions.map((c) => ({
    name: c.feature.replace(/_/g, ' '),
    raw_feature: c.feature,
    value: c.shap_value,
    raw_val: String(c.raw_value),
    direction: c.direction,
    explanation: c.explanation
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span>SHAP Feature Contribution Waterfall</span>
            <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-mono">
              Exact Tree SHAP
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual patient log-odds feature attributions relative to population baseline.
          </p>
        </div>
        {baseProbability !== undefined && (
          <div className="text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-700">Baseline Cohort Risk:</span>
            <span className="font-mono font-bold text-teal-600">
              {(baseProbability * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Waterfall Bar Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(val) => val.toFixed(2)}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: '#334155' }}
              width={110}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const isPositive = data.value > 0;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs max-w-xs space-y-1">
                      <div className="font-semibold text-sm capitalize">{data.name}</div>
                      <div className="text-slate-300">
                        Patient Value: <strong className="text-white">{data.raw_val}</strong>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <span>SHAP Log-Odds:</span>
                        <span className={isPositive ? 'text-rose-400 font-bold' : 'text-teal-400 font-bold'}>
                          {isPositive ? `+${data.value.toFixed(4)}` : data.value.toFixed(4)}
                        </span>
                      </div>
                      <div className="text-slate-300 text-[11px] pt-1 border-t border-slate-700">
                        {data.explanation}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
            <Bar dataKey="value" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value > 0 ? '#f43f5e' : '#0d9488'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Plain English Insight Cards */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
              <span>Increases Readmission Risk (+)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-teal-600 inline-block"></span>
              <span>Protective / Lowers Risk (-)</span>
            </span>
          </div>
          <span className="text-[11px] italic">Values shown in log-odds impact</span>
        </div>

        {/* Top 3 Clinical Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {contributions.slice(0, 4).map((c, i) => {
            const isPos = c.shap_value > 0;
            return (
              <div
                key={i}
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  isPos
                    ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                    : 'bg-teal-50/50 border-teal-200 text-teal-950'
                }`}
              >
                <div
                  className={`p-1 rounded mt-0.5 ${
                    isPos ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-700'
                  }`}
                >
                  {isPos ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="font-semibold flex items-center gap-1.5 capitalize">
                    <span>{c.feature.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-[10px] opacity-75">
                      ({String(c.raw_value)})
                    </span>
                  </div>
                  <p className="text-slate-600 leading-snug">{c.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
          <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span>
            <strong>Association vs Causation:</strong> SHAP values explain feature contributions within this predictive model. They reflect statistical correlation and disease severity patterns rather than direct physiological causation.
          </span>
        </div>
      </div>
    </div>
  );
};
