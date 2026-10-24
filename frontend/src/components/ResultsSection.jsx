
import React from 'react';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ResultsSection({ result }) {
  if (!result) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">
          Analysis Results
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Submit metadata using Run Metadata Analysis to display the
          CatBoost API response here.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <Activity size={18} />
          Waiting for prediction
        </div>
      </section>
    );
  }

  const score = Number(result.risk_score_percent);
  const validScore = Number.isFinite(score);

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="text-green-600" size={22} />
        <h3 className="text-lg font-semibold text-slate-800">
          Analysis Results
        </h3>
      </div>

      <div className="rounded-lg bg-slate-50 p-4">
        <p className="text-sm text-slate-500">
          CatBoost returned score
        </p>

        <p className="mt-1 text-3xl font-bold text-slate-800">
          {validScore ? `${score.toFixed(2)}%` : 'Unavailable'}
        </p>

        <p className="mt-2 text-sm text-slate-600">
          Model: {result.model || 'CatBoost'}
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle
          className="mt-0.5 shrink-0 text-amber-700"
          size={20}
        />
        <div>
          <h4 className="font-semibold text-amber-900">
            Research use only
          </h4>
          <p className="mt-1 text-sm text-amber-800">
            {result.disclaimer ||
              'This experimental score is not a medical diagnosis.'}
          </p>
          <p className="mt-2 text-sm text-amber-800">
            This is an experimental model output for research purposes only.
            It is not a medical diagnosis or a validated estimate of
            individual cancer risk.
          </p>
        </div>
      </div>
    </section>
  );
}
