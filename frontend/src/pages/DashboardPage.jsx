import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Truck, CheckCircle2, AlertTriangle,
  ShieldAlert, Clock, BarChart3, ArrowRight,
  TrendingUp, RefreshCw
} from 'lucide-react';
import { statsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getStatusBadgeClass, formatDate, truncate } from '../utils/helpers';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentShipments, setRecentShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await statsAPI.getDashboard();
      setStats(response.data.stats);
      setRecentShipments(response.data.recentShipments);
    } catch (err) {
      setError('Failed to load dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {getGreeting()}, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your shipments today.</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="btn-secondary"
        >
          <RefreshCw size={16} className={isLoading ? 'spinner' : ''} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading dashboard..." />
      ) : error ? (
        <div className="card text-center py-10">
          <AlertTriangle size={40} className="text-amber-400 mx-auto mb-3" />
          <p className="text-slate-600">{error}</p>
          <button onClick={fetchStats} className="btn-primary mt-4 mx-auto">Retry</button>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Package size={24} />}
              label="Total Shipments"
              value={stats.totalShipments}
              color="blue"
              description="All time records"
            />
            <StatCard
              icon={<Truck size={24} />}
              label="Active Shipments"
              value={stats.activeShipments}
              color="purple"
              description="In transit / processing"
            />
            <StatCard
              icon={<CheckCircle2 size={24} />}
              label="Delivered"
              value={stats.delivered}
              color="green"
              description="Successfully completed"
            />
            <StatCard
              icon={<ShieldAlert size={24} />}
              label="In Customs"
              value={stats.inCustoms}
              color="amber"
              description="Inspection / clearance"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Truck size={20} />}       label="In Transit"       value={stats.inTransit}      color="cyan"  />
            <StatCard icon={<TrendingUp size={20} />}  label="Out for Delivery" value={stats.outForDelivery} color="purple" />
            <StatCard icon={<Clock size={20} />}       label="Registered"       value={stats.registered}     color="slate" />
            <StatCard icon={<AlertTriangle size={20} />} label="Exceptions"      value={stats.exceptions}     color="red" />
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <BarChart3 size={20} className="text-brand-600" />
                Recent Shipments
              </h2>
              <Link
                to="/dashboard/shipments"
                className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Tracking</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Sender</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Recipient</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Route</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Est. Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentShipments.map((s) => (
                    <tr key={s.trackingCode} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-mono text-brand-600 font-medium">{s.trackingCode}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{truncate(s.senderName, 20)}</td>
                      <td className="py-3 px-3 text-slate-600">{truncate(s.receiverName, 20)}</td>
                      <td className="py-3 px-3 text-slate-500 hidden md:table-cell">
                        {truncate(s.origin, 15)} → {truncate(s.destination, 15)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`badge ${getStatusBadgeClass(s.currentStatus)}`}>
                          {s.currentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 hidden sm:table-cell">
                        {formatDate(s.estimatedDelivery)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentShipments.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Package size={32} className="mx-auto mb-2 opacity-40" />
                  <p>No shipments yet.</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default DashboardPage;

