import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex items-center gap-2 text-xs text-amber-800">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          <strong>Research &amp; Educational Decision-Support Tool:</strong> Predictions represent statistical associations and must not replace professional clinical judgement or diagnostic protocols.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-900 shadow-sm">
      <div className="p-2 bg-amber-100 rounded-lg text-amber-700 flex-shrink-0 mt-0.5">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 font-semibold text-amber-900">
          <span>Clinical Decision-Support &amp; Research Disclaimer</span>
          <span className="text-[11px] font-medium bg-amber-200/70 text-amber-800 px-2 py-0.5 rounded-full">
            Non-Diagnostic Device
          </span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          MedRisk AI is designed for epidemiological research, quality improvement analytics, and clinical risk stratification. It is not an FDA-cleared diagnostic medical device. Never use model outputs as definitive diagnostic decisions or to withhold necessary patient care. All clinical discharge decisions must be validated by licensed physicians.
        </p>
      </div>
    </div>
  );
};
