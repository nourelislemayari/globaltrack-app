
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusBadgeClass = (status) => {
  const map = {
    'Registered':          'bg-slate-100 text-slate-700',
    'In Transit':          'bg-blue-100 text-blue-700',
    'Customs Inspection':  'bg-amber-100 text-amber-700',
    'Customs Cleared':     'bg-cyan-100 text-cyan-700',
    'Out for Delivery':    'bg-purple-100 text-purple-700',
    'Delivered':           'bg-green-100 text-green-700',
    'Exception':           'bg-red-100 text-red-700',
    'Returned':            'bg-orange-100 text-orange-700',
  };
  return map[status] || 'bg-slate-100 text-slate-700';
};

export const getCheckpointColor = (status, isLatest) => {
  if (isLatest) return 'bg-brand-600 ring-brand-200';
  return 'bg-green-500 ring-green-100';
};

export const truncate = (str, len = 30) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
};

export const SHIPMENT_STATUSES = [
  'Registered',
  'In Transit',
  'Customs Inspection',
  'Customs Cleared',
  'Out for Delivery',
  'Delivered',
  'Exception',
  'Returned',
];

