import React from 'react';

const StatCard = ({ icon, label, value, color = 'blue', description }) => {
  const colorMap = {
    blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',   text: 'text-blue-700' },
    green:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-600',  text: 'text-green-700' },
    amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-600',  text: 'text-amber-700' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-700' },
    red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-600',    text: 'text-red-700' },
    slate:  { bg: 'bg-slate-50',  icon: 'bg-slate-100 text-slate-600',  text: 'text-slate-700' },
    cyan:   { bg: 'bg-cyan-50',   icon: 'bg-cyan-100 text-cyan-600',   text: 'text-cyan-700' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`card hover:shadow-md transition-shadow ${c.bg} border-0`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${c.text}`}>{value ?? '—'}</p>
          {description && (
            <p className="text-xs text-slate-400 mt-1">{description}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

