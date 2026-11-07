'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, HeartPulse, ExternalLink } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <span>Explainable Clinical Intelligence System</span>
        </h1>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          Diabetic Inpatient Cohort
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* API Status Pill */}
        <div className="flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Vercel Serverless Ready</span>
        </div>

        <Link
          href="/predict"
          className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>New Assessment</span>
        </Link>
      </div>
    </header>
  );
};
