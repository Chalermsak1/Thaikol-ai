import React from 'react';
import { Cpu, Database, Server } from 'lucide-react';
import { TikTokDiscoverySandbox } from '../TikTokDiscoverySandbox';
import { SemanticMatchingSandbox } from '../SemanticMatchingSandbox';

interface TechnicalDrawerProps {
  demoMode?: boolean;
}

export const TechnicalDrawer: React.FC<TechnicalDrawerProps> = () => {
  return (
    <div className="space-y-5 max-w-4xl">
      {/* Stack specifications */}
      <div className="saas-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Architecture & Stack</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Engineering contracts and inference specifications
            </p>
          </div>
          <span className="font-mono text-[11px] text-slate-500 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
            FastAPI 0.115 + Python 3.12
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              Backend & API
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              FastAPI with Pydantic v2 schemas. Primary endpoint:{' '}
              <code className="text-slate-700 font-mono bg-slate-100 px-1 rounded text-[10px]">
                POST /api/v1/matching/recommend-from-brand
              </code>
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              Embedding Model
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              <code className="text-slate-700 font-mono bg-slate-100 px-1 rounded text-[10px]">
                paraphrase-multilingual-MiniLM-L12-v2
              </code>
              {' '}— 384-dimensional dense vectors with cosine similarity
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              Persistence
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              PostgreSQL 16 + SQLAlchemy 2.0 ORM. Dual-mode provider with{' '}
              <code className="text-slate-700 font-mono bg-slate-100 px-1 rounded text-[10px]">
                DEMO_MODE=true
              </code>{' '}
              for offline fixture fallback.
            </p>
          </div>
        </div>
      </div>

      {/* End-to-End Pipeline Architecture Flowchart */}
      <div className="saas-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">End-to-End Pipeline Architecture</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic, explainable workflow from client input to ranked creator recommendations
            </p>
          </div>
          <span className="font-mono text-[11px] text-slate-500 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
            Pipeline Flow
          </span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
            {[
              { step: '1', title: 'Client Input', desc: 'Website & Facebook URLs', color: 'border-slate-200 bg-slate-50/70' },
              { step: '2', title: 'Brand Analysis', desc: 'Audience & content signals', color: 'border-slate-200 bg-slate-50/70' },
              { step: '3', title: 'Search Strategy', desc: 'Bilingual query formulation', color: 'border-slate-200 bg-slate-50/70' },
              { step: '4', title: 'TikTok Discovery', desc: 'Public candidate ingestion', color: 'border-slate-200 bg-slate-50/70' },
              { step: '5', title: 'AI Matching', desc: '384-dim dense vectors', color: 'border-indigo-200 bg-indigo-50/50 text-indigo-950 font-semibold' },
              { step: '6', title: '5-Factor Scoring', desc: 'Audited weighted formula', color: 'border-slate-200 bg-slate-50/70' },
              { step: '7', title: 'Recommendations', desc: 'Ranked cards + Rationale', color: 'border-emerald-200 bg-emerald-50/50 text-emerald-950 font-semibold' },
            ].map((node) => (
              <div key={node.step} className={`p-3 rounded-xl border ${node.color} flex flex-col justify-between shadow-2xs`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Step {node.step}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">{node.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{node.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diagnostic Sandboxes */}
      <div className="saas-card p-5 space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-semibold text-slate-900">Developer Diagnostic Sandboxes</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect isolated ingestion and vector matching components individually
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <div className="page-section-label mb-3">
              Diagnostic A: Candidate Ingestion & Scraper Test
            </div>
            <TikTokDiscoverySandbox />
          </div>

          <div>
            <div className="page-section-label mb-3">
              Diagnostic B: Vector Similarity & Cosine Matcher Test
            </div>
            <SemanticMatchingSandbox />
          </div>
        </div>
      </div>
    </div>
  );
};
