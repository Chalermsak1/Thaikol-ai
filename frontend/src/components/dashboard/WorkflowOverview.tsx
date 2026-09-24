import React from 'react';
import { ActiveNavPage } from '../../types';
import { Building2, Users, Cpu, Award, ArrowRight, Check } from 'lucide-react';

interface WorkflowOverviewProps {
  onSelectPage: (page: ActiveNavPage) => void;
  hasAnalyzedBrand: boolean;
}

const steps = [
  {
    step: 1,
    id: 'analyze' as ActiveNavPage,
    title: 'Brand Analysis',
    desc: 'Extract identity, tone & target audience from website & Facebook',
    icon: Building2,
    badge: 'Step 1',
  },
  {
    step: 2,
    id: 'discovery' as ActiveNavPage,
    title: 'Creator Discovery',
    desc: 'Query Thai TikTok candidate pool using multi-theme search strategies',
    icon: Users,
    badge: 'Step 2',
  },
  {
    step: 3,
    id: 'technical' as ActiveNavPage,
    title: 'AI Matching',
    desc: 'Bilingual dense embeddings (Sentence-Transformers 384-dim) + 5-factor scoring model',
    icon: Cpu,
    badge: 'Step 3',
  },
  {
    step: 4,
    id: 'recommendations' as ActiveNavPage,
    title: 'Recommendations',
    desc: 'Ranked creator list with mathematical explainability & evidence provenance',
    icon: Award,
    badge: 'Step 4',
  },
];

export const WorkflowOverview: React.FC<WorkflowOverviewProps> = ({
  onSelectPage,
  hasAnalyzedBrand,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Workflow Architecture
        </h2>
        <span className="text-[11px] text-slate-400">Deterministic & Explainable Pipeline</span>
      </div>

      <div className="saas-card p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                onClick={() => onSelectPage(item.id)}
                className="group relative p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-2xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                      {item.badge}
                    </span>
                    {hasAnalyzedBrand && item.step <= 4 ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-bold">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-slate-400">
                        0{item.step}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-slate-400 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-slate-700" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-semibold text-slate-600 group-hover:text-slate-900">
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
