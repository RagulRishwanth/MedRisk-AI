import './globals.css';
import type { Metadata } from 'next';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'MedRisk AI — Explainable Clinical Intelligence for Readmission Risk',
  description: 'AI-powered clinical decision-support platform for 30-day hospital readmission risk prediction using LightGBM and Exact Tree SHAP.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <div className="flex">
          {/* Static Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 ml-64 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
