import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Edit2, Trash2, Shield, UserCheck, UserX,
  X, AlertTriangle, CheckCircle2, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/helpers';

const CreateUserModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'STAFF' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await usersAPI.create(form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Plus size={18} className="text-brand-600" />
            Create New Account
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />{error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} className="input-field" placeholder="John Doe" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="input-field" placeholder="user@globaltrack.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="input-field pr-10"
                placeholder="Min. 8 characters"
                required minLength={8}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className="input-field">
              <option value="STAFF">STAFF - Logistics Operator</option>
              <option value="ADMIN">ADMIN - System Administrator</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center">
              {isLoading ? 'Creating...' : <><Plus size={16} />Create Account</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditUserModal = ({ user, currentUserId, onClose, onSuccess }) => {
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await usersAPI.update(user.userId, { role, isActive });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const isSelf = currentUserId === user.userId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Edit User</h2>
            <p className="text-sm text-slate-500">{user.fullName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />{error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field" disabled={isSelf}>
              <option value="STAFF">STAFF</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            {isSelf && <p className="text-xs text-slate-400 mt-1">You cannot change your own role.</p>}
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-slate-700">Account Active</p>
              <p className="text-xs text-slate-400">Toggle to activate or deactivate</p>
            </div>
            <button
              type="button"
              onClick={() => !isSelf && setIsActive(!isActive)}
              disabled={isSelf}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${isActive ? 'bg-green-500' : 'bg-slate-300'} ${isSelf ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${isActive ? 'translate-x-5.5' : 'translate-x-0.5'}`} style={{ transform: isActive ? 'translateX(20px)' : 'translateX(2px)' }} />
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data.users);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await usersAPI.delete(deleteTarget.userId);
      setDeleteTarget(null);
      showSuccess(`User "${deleteTarget.fullName}" removed.`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); showSuccess('Account created successfully!'); fetchUsers(); }}
        />
      )}
      {editTarget && (
        <EditUserModal
          user={editTarget}
          currentUserId={currentUser?.userId}
          onClose={() => setEditTarget(null)}
          onSuccess={() => { setEditTarget(null); showSuccess('User updated!'); fetchUsers(); }}
        />
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete User?</h3>
            <p className="text-slate-500 text-sm mb-6">
              This will permanently delete <span className="font-bold">{deleteTarget.fullName}</span>'s account.
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
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 mt-1">{users.length} account{users.length !== 1 ? 's' : ''} in the system</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchUsers} className="btn-secondary"><RefreshCw size={16} /></button>
          <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> New Account</button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle2 size={16} />{successMsg}
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner text="Loading users..." />
      ) : error ? (
        <div className="card text-center py-10">
          <AlertTriangle size={32} className="text-amber-400 mx-auto mb-3" />
          <p className="text-slate-500">{error}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((u) => {
            const isSelf = currentUser?.userId === u.userId;
            return (
              <div
                key={u.userId}
                className={`card hover:shadow-md transition-shadow ${!u.isActive ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                      u.role === 'ADMIN' ? 'bg-purple-600' : 'bg-brand-600'
                    }`}>
                      {u.fullName.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800">{u.fullName}</h3>
                        {isSelf && <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">You</span>}
                      </div>
                      <p className="text-sm text-slate-500">{u.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge text-xs ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          <Shield size={9} className="mr-1" />
                          {u.role}
                        </span>
                        <span className={`badge text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.isActive ? <><UserCheck size={9} className="mr-1" />Active</> : <><UserX size={9} className="mr-1" />Inactive</>}
                        </span>
                        <span className="text-xs text-slate-400">Joined {formatDate(u.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditTarget(u)}
                      className="p-2 hover:bg-brand-50 text-slate-400 hover:text-brand-600 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    {!isSelf && (
                      <button
                        onClick={() => setDeleteTarget(u)}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {users.length === 0 && (
            <div className="card text-center py-10 text-slate-400">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p>No users found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersPage;

