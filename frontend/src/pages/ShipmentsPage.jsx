import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, Plus, Search, Filter, ChevronLeft, ChevronRight,
  Edit2, Trash2, Eye, X, AlertTriangle, CheckCircle2,
  ArrowUpDown, RefreshCw, MapPin, Clock
} from 'lucide-react';
import { shipmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusTimeline from '../components/StatusTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
import { getStatusBadgeClass, formatDate, formatDateTime, SHIPMENT_STATUSES, truncate } from '../utils/helpers';

const CreateShipmentModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    senderName: '', receiverName: '', origin: '',
    destination: '', estimatedDelivery: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await shipmentsAPI.create(form);
      onSuccess(res.data.trackingCode);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shipment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Package size={20} className="text-brand-600" />
            Register New Shipment
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sender Name *</label>
              <input name="senderName" value={form.senderName} onChange={handleChange} className="input-field" placeholder="Company or person" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Receiver Name *</label>
              <input name="receiverName" value={form.receiverName} onChange={handleChange} className="input-field" placeholder="Recipient name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Origin *</label>
              <input name="origin" value={form.origin} onChange={handleChange} className="input-field" placeholder="City, Country" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destination *</label>
              <input name="destination" value={form.destination} onChange={handleChange} className="input-field" placeholder="City, Country" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Delivery Date *</label>
            <input type="date" name="estimatedDelivery" value={form.estimatedDelivery} onChange={handleChange} className="input-field" required min={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center">
              {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" /> Creating...</> : <><Plus size={16} /> Create Shipment</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UpdateStatusModal = ({ shipment, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    newStatus: shipment.currentStatus,
    location: '',
    statusNote: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await shipmentsAPI.updateStatus(shipment.shipmentId, form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Update Shipment Status</h2>
            <p className="text-sm text-slate-500 font-mono">{shipment.trackingCode}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Status *</label>
            <select
              value={form.newStatus}
              onChange={(e) => setForm((p) => ({ ...p, newStatus: e.target.value }))}
              className="input-field"
              required
            >
              {SHIPMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <MapPin size={13} className="inline mr-1" />
              Checkpoint Location *
            </label>
            <input
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              className="input-field"
              placeholder="e.g. Dubai International Airport"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Clock size={13} className="inline mr-1" />
              Status Note *
            </label>
            <textarea
              value={form.statusNote}
              onChange={(e) => setForm((p) => ({ ...p, statusNote: e.target.value }))}
              className="input-field resize-none"
              rows={3}
              placeholder="Describe what happened at this checkpoint..."
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center">
              {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" /> Updating...</> : <><CheckCircle2 size={16} /> Update Status</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ShipmentDrawer = ({ shipmentId, onClose }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await shipmentsAPI.getById(shipmentId);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [shipmentId]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Eye size={18} className="text-brand-600" />
            Shipment Details
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} /></button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : data ? (
          <div className="p-5 flex-1">
            <div className="mb-5">
              <span className={`badge text-sm px-3 py-1 ${getStatusBadgeClass(data.shipment.currentStatus)}`}>
                {data.shipment.currentStatus}
              </span>
              <p className="text-xl font-bold text-slate-800 mt-2 font-mono">{data.shipment.trackingCode}</p>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: 'Sender', value: data.shipment.senderName },
                { label: 'Receiver', value: data.shipment.receiverName },
                { label: 'Origin', value: data.shipment.origin },
                { label: 'Destination', value: data.shipment.destination },
                { label: 'Est. Delivery', value: formatDate(data.shipment.estimatedDelivery) },
                { label: 'Created', value: formatDateTime(data.shipment.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-xs font-medium text-slate-400 w-24 flex-shrink-0 pt-0.5">{label}</span>
                  <span className="text-sm text-slate-700 font-medium">{value}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                Checkpoint History ({data.checkpoints.length})
              </h3>
              <StatusTimeline checkpoints={data.checkpoints} currentStatus={data.shipment.currentStatus} />
            </div>
          </div>
        ) : (
          <div className="p-5 text-center text-slate-400">Failed to load details.</div>
        )}
      </div>
    </div>
  );
};

const ShipmentsPage = () => {
  const { isAdmin } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [updateTarget, setUpdateTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchShipments = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await shipmentsAPI.getAll({
        page, limit: pagination.limit, search, status: statusFilter, sortBy, sortOrder,
      });
      setShipments(res.data.shipments);
      setPagination((p) => ({ ...p, page, total: res.data.total, totalPages: res.data.totalPages }));
    } catch (err) {
      setError('Failed to load shipments.');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, sortBy, sortOrder, pagination.limit]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchShipments(1), 300);
    return () => clearTimeout(debounce);
  }, [search, statusFilter, sortBy, sortOrder]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await shipmentsAPI.delete(deleteTarget.shipmentId);
      setDeleteTarget(null);
      showSuccess(`Shipment ${deleteTarget.trackingCode} deleted.`);
      fetchShipments(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(col);
      setSortOrder('ASC');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {showCreate && (
        <CreateShipmentModal
          onClose={() => setShowCreate(false)}
          onSuccess={(code) => {
            setShowCreate(false);
            showSuccess(`Shipment ${code} created successfully!`);
            fetchShipments(1);
          }}
        />
      )}
      {updateTarget && (
        <UpdateStatusModal
          shipment={updateTarget}
          onClose={() => setUpdateTarget(null)}
          onSuccess={() => {
            setUpdateTarget(null);
            showSuccess('Shipment status updated!');
            fetchShipments(pagination.page);
          }}
        />
      )}
      {viewTarget && <ShipmentDrawer shipmentId={viewTarget} onClose={() => setViewTarget(null)} />}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Shipment?</h3>
            <p className="text-slate-500 text-sm mb-6">
              This will permanently delete <span className="font-mono font-bold">{deleteTarget.trackingCode}</span> and all its checkpoints.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting} className="btn-danger flex-1 justify-center">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Shipment Registry</h1>
          <p className="text-slate-500 mt-1">{pagination.total} shipment{pagination.total !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={16} /> New Shipment
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      <div className="card mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by tracking code, sender, or receiver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400 flex-shrink-0" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-48">
              <option value="">All Statuses</option>
              {SHIPMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={() => fetchShipments(pagination.page)} className="btn-secondary">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="p-8 text-center text-slate-400">
            <AlertTriangle size={32} className="mx-auto mb-2 text-amber-400" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    { label: 'Tracking Code', col: 'tracking_code' },
                    { label: 'Sender', col: 'sender_name' },
                    { label: 'Receiver', col: 'receiver_name' },
                    { label: 'Route', col: null },
                    { label: 'Status', col: 'current_status' },
                    { label: 'Est. Delivery', col: 'estimated_delivery' },
                    { label: 'Actions', col: null },
                  ].map(({ label, col }) => (
                    <th
                      key={label}
                      onClick={col ? () => toggleSort(col) : undefined}
                      className={`text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${col ? 'cursor-pointer hover:text-slate-700 select-none' : ''}`}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        {col && <ArrowUpDown size={12} className="text-slate-300" />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Package size={32} className="mx-auto mb-2 opacity-30" />
                      No shipments found.
                    </td>
                  </tr>
                ) : (
                  shipments.map((s) => (
                    <tr key={s.shipmentId} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-3 px-4">
                        <span className="font-mono text-brand-600 font-semibold">{s.trackingCode}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{truncate(s.senderName, 22)}</td>
                      <td className="py-3 px-4 text-slate-700">{truncate(s.receiverName, 22)}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {truncate(s.origin, 14)} → {truncate(s.destination, 14)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${getStatusBadgeClass(s.currentStatus)}`}>{s.currentStatus}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(s.estimatedDelivery)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setViewTarget(s.shipmentId)}
                            title="View Details"
                            className="p-1.5 hover:bg-brand-50 text-slate-400 hover:text-brand-600 rounded-lg transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setUpdateTarget(s)}
                            title="Update Status"
                            className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDeleteTarget(s)}
                              title="Delete"
                              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchShipments(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn-secondary py-1.5 px-3 text-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => fetchShipments(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="btn-secondary py-1.5 px-3 text-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipmentsPage;

