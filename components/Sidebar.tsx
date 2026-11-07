'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserCheck,
  BarChart3,
  FlaskConical,
  HelpCircle,
  FileSpreadsheet,
  Activity,
  HeartPulse,
  ShieldCheck
} from 'lucide-react';

const navItems = [
  {
    name: 'Executive Dashboard',
    href: '/',
    icon: LayoutDashboard,
    badge: 'Overview'
  },
  {
    name: 'Patient Assessment',
    href: '/predict',
    icon: UserCheck,
    badge: 'Core'
  },
  {
    name: 'Population Analytics',
    href: '/population',
    icon: BarChart3,
  },
  {
    name: 'Model Laboratory',
    href: '/models',
    icon: FlaskConical,
  },
  {
    name: 'Explainability Centre',
    href: '/explain',
    icon: HelpCircle,
  },
  {
    name: 'Batch Prediction',
    href: '/batch',
    icon: FileSpreadsheet,
    badge: 'CSV'
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col fixed inset-y-0 z-40">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
          <HeartPulse className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base text-white tracking-tight">MedRisk AI</span>
            <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.2 rounded font-mono">
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Clinical Readmission Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Clinical Analytics
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? 'bg-teal-700/60 text-teal-100'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/30 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium text-[11px]">Model Engine Active</span>
          </div>
          <span className="text-[10px] text-teal-400 font-mono">LightGBM</span>
        </div>
        <div className="text-[11px] text-slate-400 leading-tight">
          Single-Project Vercel Serverless Architecture with Exact Tree SHAP
        </div>
      </div>
    </aside>
  );
};
