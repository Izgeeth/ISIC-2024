import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Trash2,
  Eye,
  RefreshCw,
  Lock,
  ArrowRight,
  LoaderCircle,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function History({ onNavigateToDashboard, onOpenAuth }) {
  const { token, isAuthenticated } = useAuth();
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchHistory = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const data = await api.history.getHistory(token);
      setRecords(data.records || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    } else {
      setRecords([]);
      setTotal(0);
    }
  }, [isAuthenticated, token]);

  const handleDelete = async (recordId) => {
    if (!window.confirm(`Delete prediction record #${recordId}?`)) {
      return;
    }

    setDeletingId(recordId);
    try {
      await api.history.deleteHistoryRecord(token, recordId);
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
      setTotal((prev) => Math.max(0, prev - 1));
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(null);
      }
    } catch (err) {
      alert(err.message || 'Could not delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseSummary = (summaryStr) => {
    if (!summaryStr) return null;
    try {
      return JSON.parse(summaryStr);
    } catch {
      return { raw: summaryStr };
    }
  };

  // If user is not authenticated, show sign-in prompt
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Patient Diagnostic History
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Access your secure, user-isolated log of past skin lesion predictions.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 mx-auto mb-4 border border-sky-100">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            Sign In to Access Prediction History
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
            To ensure data privacy and patient confidentiality, prediction records
            are strictly linked to your authenticated researcher account.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-sm font-semibold shadow-sm transition-colors"
            >
              Sign In / Register
            </button>
            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 underline"
              >
                Return to Dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <HistoryIcon className="w-5 h-5 mr-2 text-sky-600" />
            Patient Diagnostic History
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Your personal record of {total} saved assessment{total !== 1 ? 's' : ''}.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={fetchHistory}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table or Empty State */}
      {loading && records.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
          <LoaderCircle className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading your prediction records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            No Saved Predictions Yet
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
            Run an image or metadata prediction from the Dashboard to record diagnostic results.
          </p>
          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="mt-5 inline-flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-sm font-semibold shadow-sm transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Modality & Model</th>
                  <th className="px-5 py-3">Sample Reference</th>
                  <th className="px-5 py-3">Malignancy Risk</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => {
                  const scorePercent = rec.risk_score_percent;
                  const isImage = rec.prediction_type === 'image';
                  const isDeleting = deletingId === rec.id;

                  // Color coding for score
                  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (scorePercent >= 30) {
                    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                  } else if (scorePercent >= 10) {
                    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                  }

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500 font-mono">
                        {formatDate(rec.created_at)}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            isImage
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}
                        >
                          {isImage ? (
                            <ImageIcon className="w-3 h-3 mr-1" />
                          ) : (
                            <FileText className="w-3 h-3 mr-1" />
                          )}
                          {rec.model_name} ({rec.prediction_type})
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-xs font-medium text-slate-700">
                        {rec.isic_id || (isImage ? 'Uploaded Dermoscopy' : 'Manual Form')}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded font-bold font-mono text-xs border ${badgeColor}`}
                          >
                            {scorePercent.toFixed(2)}%
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(rec)}
                          className="inline-flex items-center px-2.5 py-1 text-slate-700 hover:text-sky-700 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                          title="View input parameters"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          Details
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDelete(rec.id)}
                          className="inline-flex items-center px-2.5 py-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded border border-rose-200 disabled:opacity-50 transition-colors"
                          title="Delete record"
                        >
                          {isDeleting ? (
                            <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-sky-600" />
                Prediction Record #{selectedRecord.id} Details
              </h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400">Timestamp</span>
                  <p className="font-medium text-slate-800">
                    {formatDate(selectedRecord.created_at)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Model & Modality</span>
                  <p className="font-medium text-slate-800">
                    {selectedRecord.model_name} ({selectedRecord.prediction_type})
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Calculated Risk Score</span>
                  <p className="font-bold text-sky-700 text-sm">
                    {selectedRecord.risk_score_percent.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">ISIC ID</span>
                  <p className="font-medium text-slate-800">
                    {selectedRecord.isic_id || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Input Parameters Summary
                </h4>
                {selectedRecord.input_summary ? (
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 font-mono text-xs text-slate-700 overflow-x-auto max-h-48">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(parseSummary(selectedRecord.input_summary), null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No parameter summary recorded.
                  </p>
                )}
              </div>

              <div className="bg-amber-50 p-3 rounded border border-amber-200 text-xs text-amber-800">
                <strong>Disclaimer:</strong> Experimental research estimate. Not a validated clinical diagnosis.
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
