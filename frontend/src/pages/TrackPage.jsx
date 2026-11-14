import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, Search, Package, AlertCircle, ArrowRight,
  MapPin, Clock, User, Truck, CheckCircle2, Shield
} from 'lucide-react';
import { publicAPI } from '../services/api';
import StatusTimeline from '../components/StatusTimeline';
import { getStatusBadgeClass, formatDate } from '../utils/helpers';

const TrackPage = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const code = trackingCode.trim().toUpperCase();
    if (!code) {
      setError('Please enter a tracking code.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);
    setHasSearched(true);

    try {
      const response = await publicAPI.trackShipment(code);
      setResult(response.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Tracking code not found. Please verify and try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSearch = (code) => {
    setTrackingCode(code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900">
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg">
              <Globe size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl leading-none">GlobalTrack</h1>
              <p className="text-brand-300 text-xs">International Logistics</p>
            </div>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg"
          >
            <Shield size={14} />
            Staff Login
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-300 px-4 py-2 rounded-full text-sm mb-6 border border-brand-500/30">
          <Truck size={14} />
          Real-time International Freight Tracking
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
          Track Your Shipment
          <span className="text-brand-400"> Worldwide</span>
        </h2>
        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
          Enter your tracking code below to get real-time updates on your international cargo.
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex gap-3 p-2 bg-white rounded-2xl shadow-2xl">
            <div className="flex-1 flex items-center gap-3 pl-3">
              <Package size={20} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                placeholder="e.g. TRK-983214"
                className="flex-1 py-2 text-slate-800 placeholder-slate-400 focus:outline-none text-base font-medium"
                maxLength={20}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Track
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="text-slate-500 text-xs">Try demo codes:</span>
          {['TRK-983214', 'TRK-774501', 'TRK-329047', 'TRK-112938'].map((code) => (
            <button
              key={code}
              onClick={() => handleDemoSearch(code)}
              className="text-xs text-brand-400 hover:text-brand-300 transition-colors underline underline-offset-2"
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {error && hasSearched && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-red-300 font-semibold mb-1">Shipment Not Found</h3>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className={`px-6 py-3 flex items-center justify-between ${
                result.shipment.currentStatus === 'Delivered'
                  ? 'bg-green-500'
                  : 'bg-brand-600'
              }`}>
                <div className="flex items-center gap-2">
                  {result.shipment.currentStatus === 'Delivered'
                    ? <CheckCircle2 size={18} className="text-white" />
                    : <Truck size={18} className="text-white" />
                  }
                  <span className="text-white font-semibold text-sm">
                    {result.shipment.currentStatus}
                  </span>
                </div>
                <span className="text-white/80 font-mono text-sm font-medium">
                  {result.shipment.trackingCode}
                </span>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Route</p>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center mb-1">
                          <MapPin size={16} className="text-brand-600" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{result.shipment.origin}</p>
                      </div>
                      <div className="flex-1 flex items-center gap-1">
                        <div className="flex-1 h-0.5 bg-slate-200" />
                        <ArrowRight size={14} className="text-slate-400" />
                        <div className="flex-1 h-0.5 bg-slate-200" />
                      </div>
                      <div className="text-center">
                        <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center mb-1">
                          <MapPin size={16} className="text-green-600" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{result.shipment.destination}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400">Sender</p>
                        <p className="text-sm font-medium text-slate-700">{result.shipment.senderName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User size={14} className="text-brand-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400">Recipient</p>
                        <p className="text-sm font-medium text-slate-700">{result.shipment.receiverName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400">Estimated Delivery</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {formatDate(result.shipment.estimatedDelivery)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-5 flex items-center gap-2">
                    <Truck size={16} className="text-brand-600" />
                    Shipment Journey
                    <span className="ml-auto text-xs font-normal text-slate-400">
                      {result.checkpoints.length} checkpoint{result.checkpoints.length !== 1 ? 's' : ''}
                    </span>
                  </h3>
                  <StatusTimeline
                    checkpoints={result.checkpoints}
                    currentStatus={result.shipment.currentStatus}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {!hasSearched && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {[
              { icon: <Globe size={24} />, title: 'Global Coverage', desc: '190+ countries tracked in real-time' },
              { icon: <Clock size={24} />, title: 'Live Updates', desc: 'Instant checkpoint notifications' },
              { icon: <Shield size={24} />, title: 'Secure & Reliable', desc: 'Enterprise-grade ACID database' },
            ].map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-5 text-center backdrop-blur-sm">
                <div className="text-brand-400 flex justify-center mb-3">{f.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-slate-400 text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackPage;

