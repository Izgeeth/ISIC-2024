import React from 'react';
import { History as HistoryIcon, Database, ArrowRight } from 'lucide-react';

export default function History({ onNavigateToDashboard }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">
          Patient Diagnostic History
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Historical log of analyzed dermoscopy images, recorded patient metadata, and model outputs.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <HistoryIcon className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">
          No Past Analyses Recorded
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
          Predictions are not currently persisted. In upcoming phases, this view will query
          PostgreSQL via SQLAlchemy to display timestamped patient assessments and model logs.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <span className="inline-flex items-center text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
            <Database className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Persistence: PostgreSQL (Phase 3)
          </span>
          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="inline-flex items-center text-xs font-medium text-sky-600 hover:text-sky-700 underline"
            >
              Return to Dashboard
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
