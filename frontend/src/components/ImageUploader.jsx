import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

export default function ImageUploader({ imageFile, imagePreview, onImageChange, onImageClear }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, etc.).');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageChange(file, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    return kb >= 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(1)} KB`;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-800 flex items-center">
          <ImageIcon className="w-5 h-5 mr-2 text-sky-600" />
          Dermoscopic Image Upload
        </h3>
        <span className="text-xs text-slate-500 font-mono">Modality: Image (ResNet-18)</span>
      </div>

      {!imagePreview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-sky-500 bg-sky-50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              Drag and drop dermoscopic image here, or <span className="text-sky-600 underline">browse</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports JPEG, PNG, or WebP. Optimal: high-resolution macro or dermatoscope capture.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center max-h-72">
            <img
              src={imagePreview}
              alt="Lesion preview"
              className="max-h-72 w-auto object-contain"
            />
            <button
              type="button"
              onClick={onImageClear}
              className="absolute top-2 right-2 p-1.5 bg-slate-800/80 hover:bg-slate-900 text-white rounded-full transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <span className="font-medium truncate max-w-xs">{imageFile?.name}</span>
            <span>{formatFileSize(imageFile?.size)}</span>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center text-xs text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-100">
        <AlertCircle className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
        <span>Preprocessed by PyTorch pipeline: 224x224 resize, ImageNet normalization, center-crop.</span>
      </div>
    </div>
  );
}
