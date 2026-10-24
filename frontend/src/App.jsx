import React, { useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Disclaimer from './components/Disclaimer';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Application Header */}
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Navigation Bar */}
      <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Educational Disclaimer */}
        <Disclaimer />

        {/* Dynamic Page Views */}
        {activeTab === 'dashboard' ? (
          <Dashboard onOpenAuth={() => setAuthModalOpen(true)} />
        ) : (
          <History
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <p>
          ISIC Skin Lesion Analysis • Educational Prototype • FastAPI + React + Tailwind CSS
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
