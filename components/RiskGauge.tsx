'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface RiskGaugeProps {
  probability: number; // 0.0 to 1.0
  riskTier: string;    // 'Low', 'Moderate', 'High'
  threshold?: number;  // e.g. 0.55
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  probability,
  riskTier,
  threshold = 0.55
}) => {
  const percentage = Math.round(probability * 100);
  
  // Calculate SVG arc coordinates for half circle (180 deg)
  // Radius = 80, Center = (100, 95)
  const radius = 75;
  const cx = 100;
  const cy = 90;
  
  // Arc length for 180 degrees is PI * radius
  const arcLength = Math.PI * radius;
  // Clamped percentage
  const clampedPct = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = arcLength - (clampedPct / 100) * arcLength;

  let tierColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  let badgeColor = 'bg-emerald-100 text-emerald-800';
  let barColor = '#10b981'; // emerald
  let Icon = CheckCircle2;

  if (riskTier === 'Moderate') {
    tierColor = 'text-amber-600 bg-amber-50 border-amber-200';
    badgeColor = 'bg-amber-100 text-amber-800';
    barColor = '#f59e0b'; // amber
    Icon = AlertTriangle;
  } else if (riskTier === 'High') {
    tierColor = 'text-rose-600 bg-rose-50 border-rose-200';
    badgeColor = 'bg-rose-100 text-rose-800';
    barColor = '#f43f5e'; // rose
    Icon = AlertCircle;
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="relative w-48 h-28 flex items-center justify-center">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Background Arc */}
          <path
            d="M 25,90 A 75,75 0 0,1 175,90"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Threshold marker (e.g. 55%) */}
          <line
            x1="100"
            y1="90"
            x2={100 + 75 * Math.cos(Math.PI - (threshold * Math.PI))}
            y2={90 - 75 * Math.sin(Math.PI - (threshold * Math.PI))}
            stroke="#64748b"
            strokeWidth="2"
            strokeDasharray="2,2"
          />

          {/* Active Progress Arc */}
          <path
            d="M 25,90 A 75,75 0 0,1 175,90"
            fill="none"
            stroke={barColor}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {percentage}%
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Readmission Risk</span>
        </div>
      </div>

      {/* Tier Badge & Clinical Guidance */}
      <div className="mt-4 flex flex-col items-center gap-2 text-center w-full">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${tierColor}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{riskTier} Risk Category</span>
        </div>
        
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          {riskTier === 'High' && "Probability exceeds high-risk intervention threshold. Prioritize post-discharge transitional care bundle."}
          {riskTier === 'Moderate' && "Elevated readmission probability. Recommend clinical follow-up within 7 to 10 days of discharge."}
          {riskTier === 'Low' && "Baseline readmission risk. Follow routine clinical post-discharge standard of care."}
        </p>

        <div className="w-full grid grid-cols-3 gap-1 pt-3 mt-2 border-t border-slate-100 text-[10px] text-slate-400">
          <div>Low: &lt;15%</div>
          <div>Mod: 15–30%</div>
          <div>High: &gt;30%</div>
        </div>
      </div>
    </div>
  );
};
