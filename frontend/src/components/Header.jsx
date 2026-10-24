import React from 'react';
import { Activity, ShieldCheck, User, LogOut, LogIn, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onOpenAuth }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* App Title & Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
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

        {/* Right Section: Badges & Auth Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Connection Status Badges */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              CatBoost Metadata: Connected
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              ResNet-18 Image: Connected
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-slate-50 text-slate-600 border border-slate-200 hidden sm:inline-flex">
              <Database className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Database: Active
            </span>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden md:block" />

          {/* User Auth Info & Actions */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs">
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span className="font-medium text-slate-800 max-w-[140px] truncate">
                  {user.full_name || user.email}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 rounded-md transition-colors"
                title="Log out of account"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md shadow-sm transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5" />
              Sign In / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
