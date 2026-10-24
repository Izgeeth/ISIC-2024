import React from 'react';
import { LayoutDashboard, History } from 'lucide-react';

export default function Navigation({ activeTab, onSelectTab }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Image upload & metadata risk analysis',
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      description: 'Past patient logs & predictions',
    },
  ];

  return (
    <nav className="flex space-x-1 border-b border-slate-200 bg-white px-6 py-2">
      <div className="max-w-7xl mx-auto w-full flex space-x-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sky-50 text-sky-700 border-b-2 border-sky-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
