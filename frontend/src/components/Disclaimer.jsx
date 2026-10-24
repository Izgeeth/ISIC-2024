import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md text-amber-900 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-amber-950">Educational & Research Disclaimer</p>
          <p className="mt-0.5 text-amber-800">
            This application is an educational prototype developed for technical demonstration and research analysis
            (ISIC 2024 Challenge benchmark). It is <strong>not a medical diagnostic tool</strong>, does not provide medical
            advice, and must never be used for clinical patient diagnosis or treatment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
