import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, AlertCircle, RefreshCw, Database } from 'lucide-react';

interface HealthData {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  demo_mode: boolean;
  database_connected: boolean;
  timestamp: string;
}

export const HealthBadge: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<HealthData>('/health');
      setHealth(response.data);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  if (loading && !health) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium shadow-2xs">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
        <span>Connecting to API...</span>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-800 font-bold shadow-2xs">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
        <span>API Offline (Demo Standby)</span>
        <button
          onClick={fetchHealth}
          title="Retry"
          className="ml-1 hover:text-amber-950 p-0.5 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Backend API status */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold shadow-2xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Backend: v{health.version}</span>
      </div>

      {/* Database status */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold shadow-2xs ${
          health.database_connected
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}
        title={
          health.database_connected
            ? 'PostgreSQL Database Connected'
            : 'Database Standby (Demo Fixtures Active)'
        }
      >
        <Database className="w-3 h-3 text-slate-500" />
        <span>{health.database_connected ? 'Postgres: Ready' : 'DB: Offline'}</span>
      </div>

      {/* Demo mode badge */}
      {health.demo_mode && (
        <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-2xs">
          DEMO_MODE
        </span>
      )}

      {/* Refresh trigger */}
      <button
        onClick={fetchHealth}
        disabled={loading}
        title="Check status now"
        className="p-1 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
      </button>
    </div>
  );
};
