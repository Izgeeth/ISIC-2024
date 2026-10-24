import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              ISIC Skin Lesion Analysis
            </h1>
            <p className="text-xs text-slate-500">
              Multimodal Malignancy Risk Classification • PyTorch & Tabular Pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Metadata API: Connected
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-200">
            Image Inference: Not Connected
          </span>
        </div>
      </div>
    </header>
  );
}
