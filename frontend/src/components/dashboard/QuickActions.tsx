import React from 'react';
import { ActiveNavPage } from '../../types';
import { Search, Sparkles, Users, SlidersHorizontal, ArrowRight } from 'lucide-react';

interface QuickActionsProps {
  onSelectPage: (page: ActiveNavPage) => void;
  onRunDemo: () => void;
  isLoading: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectPage,
  onRunDemo,
  isLoading,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Quick Actions
        </h2>
        <span className="text-[11px] text-slate-400">Select workflow</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Action 1: Analyze a Brand */}
        <div className="saas-card p-5 flex flex-col justify-between hover:border-slate-300 transition-all group">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
              Analyze a Brand
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Input client website & Facebook page to extract brand identity and audience signals.
            </p>
          </div>
          <button
            onClick={() => onSelectPage('analyze')}
            className="mt-4 w-full btn-primary text-xs justify-center gap-1.5"
          >
            <span>Analyze Brand</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action 2: Try Demo */}
        <div className="saas-card p-5 flex flex-col justify-between hover:border-slate-300 transition-all group border-amber-200/80 bg-linear-to-b from-amber-50/30 to-white">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900">
                Try Demo
              </h3>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                Instant
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Load curated Khaokho Talaypu herbal haircare benchmark with full evidence.
            </p>
          </div>
          <button
            onClick={onRunDemo}
            disabled={isLoading}
            className="mt-4 w-full btn-secondary text-xs justify-center gap-1.5 border-amber-300 hover:bg-amber-50 text-amber-900"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{isLoading ? 'Running...' : 'Try Demo'}</span>
          </button>
        </div>

        {/* Action 3: KOL Discovery */}
        <div className="saas-card p-5 flex flex-col justify-between hover:border-slate-300 transition-all group">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Users className="w-5 h-5 text-slate-700" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              KOL Discovery
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Browse candidate pool of Thai TikTok creators with category and semantic filtering.
            </p>
          </div>
          <button
            onClick={() => onSelectPage('discovery')}
            className="mt-4 w-full btn-secondary text-xs justify-center gap-1.5"
          >
            <span>Explore Pool</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Action 4: Compare */}
        <div className="saas-card p-5 flex flex-col justify-between hover:border-slate-300 transition-all group">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <SlidersHorizontal className="w-5 h-5 text-slate-700" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Compare Creators
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Multi-factor objective evaluation matrix across all 5 scoring dimensions.
            </p>
          </div>
          <button
            onClick={() => onSelectPage('compare')}
            className="mt-4 w-full btn-secondary text-xs justify-center gap-1.5"
          >
            <span>Open Compare</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
