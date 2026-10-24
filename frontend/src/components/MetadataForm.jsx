import React from 'react';
import { FileText, RotateCcw, Sparkles } from 'lucide-react';

export default function MetadataForm({ metadata, onChange, onReset, onFillSample }) {
  const handleChange = (field, value) => {
    onChange({
      ...metadata,
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-800 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-sky-600" />
            Patient & Lesion Metadata
          </h3>
          <p className="text-xs text-slate-500">ISIC 2024 tabular features for gradient boosted decision trees</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onFillSample}
            className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Sample Case
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            title="Reset form"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {/* Patient Age Approx */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Approximate Age (years)
          </label>
          <input
            type="number"
            min="1"
            max="110"
            value={metadata.age_approx}
            onChange={(e) => handleChange('age_approx', e.target.value)}
            placeholder="e.g. 55"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
          />
          <span className="text-[11px] text-slate-400">ISIC feature: age_approx</span>
        </div>

        {/* Biological Sex */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Biological Sex
          </label>
          <select
            value={metadata.sex}
            onChange={(e) => handleChange('sex', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm bg-white"
          >
            <option value="">Select sex...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unknown">Unknown / Not reported</option>
          </select>
          <span className="text-[11px] text-slate-400">ISIC feature: sex</span>
        </div>

        {/* Anatomical Site */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Anatomical Site
          </label>
          <select
            value={metadata.anatom_site_general}
            onChange={(e) => handleChange('anatom_site_general', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm bg-white"
          >
            <option value="">Select location...</option>
            <option value="torso">Torso (Chest / Back / Abdomen)</option>
            <option value="upper extremity">Upper Extremity (Arms / Shoulders)</option>
            <option value="lower extremity">Lower Extremity (Legs / Hips)</option>
            <option value="head/neck">Head / Neck</option>
            <option value="palms/soles">Palms / Soles</option>
            <option value="oral/genital">Oral / Genital</option>
          </select>
          <span className="text-[11px] text-slate-400">ISIC feature: anatom_site_general</span>
        </div>

        {/* Clinical Longest Diameter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Clinical Diameter (mm)
          </label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="100.0"
            value={metadata.clin_size_long_diam_mm}
            onChange={(e) => handleChange('clin_size_long_diam_mm', e.target.value)}
            placeholder="e.g. 6.5"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
          />
          <span className="text-[11px] text-slate-400">ISIC feature: clin_size_long_diam_mm</span>
        </div>

        {/* Melanin Symmetry */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Pigmentation Symmetry
          </label>
          <select
            value={metadata.color_symmetry}
            onChange={(e) => handleChange('color_symmetry', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm bg-white"
          >
            <option value="">Select symmetry...</option>
            <option value="symmetric">Symmetric</option>
            <option value="asymmetric">Asymmetric</option>
            <option value="unknown">Unknown</option>
          </select>
          <span className="text-[11px] text-slate-400">Clinical inspection feature</span>
        </div>

        {/* History of Melanoma */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Prior Skin Malignancy History
          </label>
          <select
            value={metadata.history_of_malignancy}
            onChange={(e) => handleChange('history_of_malignancy', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm bg-white"
          >
            <option value="">Select history...</option>
            <option value="no">No known history</option>
            <option value="yes">Positive history</option>
            <option value="unknown">Unknown</option>
          </select>
          <span className="text-[11px] text-slate-400">Patient-level risk feature</span>
        </div>
      </div>
    </div>
  );
}
