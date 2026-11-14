import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 24, text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
    <Loader2 size={size} className="spinner text-brand-500" />
    {text && <p className="text-sm">{text}</p>}
  </div>
);

export default LoadingSpinner;

