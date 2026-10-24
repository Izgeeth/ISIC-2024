
import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import MetadataForm from '../components/MetadataForm';
import ResultsSection from '../components/ResultsSection';
import { Play, LoaderCircle } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api/v1/predictions/metadata';

const INITIAL_METADATA = {
  age_approx: '',
  sex: '',
  anatom_site_general: '',
  clin_size_long_diam_mm: '',
  color_symmetry: '',
  history_of_malignancy: '',
};

const SAMPLE_CASE = {
  age_approx: '55',
  sex: 'male',
  anatom_site_general: 'torso',
  clin_size_long_diam_mm: '5.0',
  color_symmetry: 'asymmetric',
  history_of_malignancy: 'no',
};

export default function Dashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [metadata, setMetadata] = useState(INITIAL_METADATA);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isicId, setIsicId] = useState('ISIC_0015670');
  const [loadingRow, setLoadingRow] = useState(false);
  const [rowMessage, setRowMessage] = useState('');
  const [imageResult, setImageResult] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');

  const handleImageChange = (file, previewUrl) => {
    setImageFile(file);
    setImagePreview(previewUrl);
    setImageResult(null);
    setImageError('');
  };

  const handleImageClear = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageResult(null);
    setImageError('');
  };

  const handleResetMetadata = () => {
    setMetadata(INITIAL_METADATA);
    setResult(null);
    setError('');
  };

  const handleFillSample = () => {
    setMetadata(SAMPLE_CASE);
    setResult(null);
    setError('');
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const payload = Object.fromEntries(
        Object.entries(metadata).filter(
          ([key]) =>
            key !== 'color_symmetry' &&
            key !== 'history_of_malignancy'
        )
      );

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Prediction request failed.');
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          'Could not connect to the API. Check that the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeImage = async () => {
  if (!imageFile) {
    setImageError('Please select an image first.');
    return;
  }

  setImageLoading(true);
  setImageError('');
  setImageResult(null);

  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(
      'http://127.0.0.1:8000/api/v1/predictions/image',
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Image prediction failed.');
    }

    setImageResult(data);
  } catch (err) {
    setImageError(
      err.message || 'Could not connect to the image inference API.'
    );
  } finally {
    setImageLoading(false);
  }
};


  const handleLoadIsicRow = async () => {
    setLoadingRow(true);
    setRowMessage('');
    setError('');
    setResult(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/predictions/metadata/row/${encodeURIComponent(isicId.trim())}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Could not load ISIC row.');
      }

      setMetadata(data.metadata);
      setRowMessage(`Loaded metadata for ${data.isic_id}.`);
    } catch (err) {
      setRowMessage(
        err.message || 'Could not connect to the metadata API.'
      );
    } finally {
      setLoadingRow(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">
          Lesion Risk Assessment Dashboard
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Analyze structured metadata with CatBoost or uploaded images with ResNet-18.
          Both outputs are experimental research scores, not medical diagnoses.
        </p>

        {/* Add the connection badges here */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 border border-green-200">
            CatBoost Metadata: Connected
          </span>

          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 border border-green-200">
            ResNet-18 Image: Connected
          </span>
        </div>
      </div>


      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">
          Load ISIC Dataset Row
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Enter an ISIC ID to load the complete metadata row from the local CSV.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={isicId}
            onChange={(e) => setIsicId(e.target.value)}
            placeholder="e.g. ISIC_0015670"
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2"
          />

          <button
            type="button"
            onClick={handleLoadIsicRow}
            disabled={loadingRow || !isicId.trim()}
            className="rounded-md bg-sky-600 px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {loadingRow ? 'Loading row...' : 'Load Metadata Row'}
          </button>
        </div>

        {rowMessage && (
          <p className="mt-3 text-sm text-slate-600" role="status">
            {rowMessage}
          </p>
        )}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImageUploader
          imageFile={imageFile}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
          onImageClear={handleImageClear}
        />

        <MetadataForm
          metadata={metadata}
          onChange={setMetadata}
          onReset={handleResetMetadata}
          onFillSample={handleFillSample}
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">
            CatBoost Metadata Inference
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Sends metadata to POST /api/v1/predictions/metadata.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-md text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {loading ? 'Analyzing...' : 'Run Metadata Analysis'}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}


<div className="space-y-4">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div>
      <h3 className="text-sm font-semibold text-slate-800">
        ResNet-18 Image Inference
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Sends the uploaded image to POST /api/v1/predictions/image.
      </p>
    </div>

    <button
      type="button"
      onClick={handleAnalyzeImage}
      disabled={!imageFile || imageLoading}
      className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {imageLoading && (
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
      )}
      {imageLoading ? 'Analyzing Image...' : 'Analyze Image'}
    </button>
  </div>

  {imageError && (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {imageError}
    </div>
  )}

  {imageResult && (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-800">
        Image Model Result
      </h3>

      <div className="text-3xl font-bold text-indigo-700">
        {imageResult.risk_score_percent.toFixed(2)}%
      </div>

      <p className="text-sm text-slate-600">
        Model: {imageResult.model}
      </p>

      <p className="text-sm text-amber-800">
        {imageResult.disclaimer}
      </p>
    </div>
  )}

  <ResultsSection result={result} />
</div>

    </div>
  );
}
