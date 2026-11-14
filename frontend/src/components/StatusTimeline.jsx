import React from 'react';
import { MapPin, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { formatDateTime, getStatusBadgeClass } from '../utils/helpers';

const StatusTimeline = ({ checkpoints, currentStatus }) => {
  if (!checkpoints || checkpoints.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-slate-400">
        <Clock size={40} className="mb-3 opacity-50" />
        <p className="text-sm">No checkpoints recorded yet.</p>
      </div>
    );
  }

  const sorted = [...checkpoints].sort(
    (a, b) => new Date(a.checkpointTime) - new Date(b.checkpointTime)
  );
  const latestIdx = sorted.length - 1;

  return (
    <ol className="relative">
      {sorted.map((cp, idx) => {
        const isLatest = idx === latestIdx;
        const isPast = idx < latestIdx;

        return (
          <li key={cp.checkpointId || idx} className="flex gap-4 pb-8 last:pb-0 relative">
            {idx < sorted.length - 1 && (
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200" />
            )}

            <div className="relative flex-shrink-0 z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ring-4 transition-all ${
                  isLatest
                    ? 'bg-brand-600 ring-brand-100'
                    : isPast
                    ? 'bg-green-500 ring-green-100'
                    : 'bg-slate-300 ring-slate-100'
                }`}
              >
                {isLatest ? (
                  currentStatus === 'Delivered' ? (
                    <CheckCircle2 size={16} className="text-white" />
                  ) : (
                    <Loader2 size={14} className="text-white spinner" />
                  )
                ) : (
                  <CheckCircle2 size={14} className="text-white" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className={`text-sm font-semibold ${isLatest ? 'text-brand-700' : 'text-slate-700'}`}>
                    {cp.location}
                  </span>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {formatDateTime(cp.checkpointTime)}
                </span>
              </div>
              <p className={`text-sm ml-5 ${isLatest ? 'text-slate-700' : 'text-slate-500'}`}>
                {cp.statusNote}
              </p>
              {isLatest && (
                <span className={`mt-2 ml-5 badge text-xs ${getStatusBadgeClass(currentStatus)}`}>
                  Current Status
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default StatusTimeline;

