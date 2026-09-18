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
