import React, { useState } from 'react';
import { Sliders, RefreshCw, Sparkles, Shield, Flame, MapPin, Database } from 'lucide-react';

export interface ScoringWeights {
  semantic_relevance: number;
  engagement_quality: number;
  local_content_relevance: number;
  brand_safety: number;
  data_quality: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  semantic_relevance: 0.45,
  engagement_quality: 0.25,
  local_content_relevance: 0.15,
  brand_safety: 0.10,
  data_quality: 0.05,
};

export const PRESET_STRATEGIES = [
  {
    id: 'balanced',
    name: 'Balanced Agency Standard',
    description: '45% Semantic · 25% Engagement · 15% Local · 10% Safety · 5% Data',
    weights: {
      semantic_relevance: 0.45,
      engagement_quality: 0.25,
      local_content_relevance: 0.15,
      brand_safety: 0.10,
      data_quality: 0.05,
    },
  },
  {
    id: 'virality',
    name: 'High Virality & Reach',
    description: 'Prioritizes views, likes, shares, and high engagement rates (50% Eng)',
    weights: {
      semantic_relevance: 0.25,
      engagement_quality: 0.50,
      local_content_relevance: 0.15,
      brand_safety: 0.05,
      data_quality: 0.05,
    },
  },
  {
    id: 'safety',
    name: 'Brand Safety & Corporate Clean',
    description: 'Strict profanity and gray-market filtering for corporate compliance (30% Safety)',
    weights: {
      semantic_relevance: 0.30,
      engagement_quality: 0.20,
      local_content_relevance: 0.15,
      brand_safety: 0.30,
      data_quality: 0.05,
    },
  },
  {
    id: 'hyperlocal',
    name: 'Hyper-Local Thai Community',
    description: 'Maximizes Thai language fluency and provincial geotargeting (40% Local)',
    weights: {
      semantic_relevance: 0.30,
      engagement_quality: 0.20,
      local_content_relevance: 0.40,
      brand_safety: 0.05,
      data_quality: 0.05,
    },
  },
];

interface ScoringWeightsTunerProps {
  weights: ScoringWeights;
  onChange: (weights: ScoringWeights) => void;
}

export const ScoringWeightsTuner: React.FC<ScoringWeightsTunerProps> = ({
  weights,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const totalSum = Math.round(
    (weights.semantic_relevance +
      weights.engagement_quality +
      weights.local_content_relevance +
      weights.brand_safety +
      weights.data_quality) *
      100
  );

  const handleSliderChange = (key: keyof ScoringWeights, valPercent: number) => {
    const newWeights = {
      ...weights,
      [key]: valPercent / 100,
    };
    onChange(newWeights);
  };

  const handlePresetSelect = (presetWeights: ScoringWeights) => {
    onChange(presetWeights);
  };

  const handleReset = () => {
    onChange(DEFAULT_SCORING_WEIGHTS);
  };

  return (
    <div className="border border-slate-200/80 bg-white rounded-xl overflow-hidden shadow-2xs">
      {/* Accordion Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-slate-50/70 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-3 border-b border-slate-100"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Custom Scoring Weights & Algorithms
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                Sum: {totalSum}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Fine-tune the 5-factor deterministic ranking formula to match your campaign goals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="text-[11px] text-slate-400 hover:text-slate-700 font-medium px-2 py-1 rounded hover:bg-slate-200/60 transition flex items-center gap-1"
            title="Reset to default 45/25/15/10/5 weights"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <span className="text-xs font-semibold text-indigo-600 hover:underline">
            {isOpen ? 'Close' : 'Adjust'}
          </span>
        </div>
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-5 bg-white">
          {/* Strategy Presets */}
          <div>
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2">
              Pre-Configured Strategy Presets
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PRESET_STRATEGIES.map((preset) => {
                const isActive =
                  Math.abs(preset.weights.semantic_relevance - weights.semantic_relevance) < 0.01 &&
                  Math.abs(preset.weights.engagement_quality - weights.engagement_quality) < 0.01 &&
                  Math.abs(preset.weights.local_content_relevance - weights.local_content_relevance) < 0.01 &&
                  Math.abs(preset.weights.brand_safety - weights.brand_safety) < 0.01 &&
                  Math.abs(preset.weights.data_quality - weights.data_quality) < 0.01;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset.weights)}
                    className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className={`text-xs font-bold ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 leading-snug">
                        {preset.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span>5-Factor Weight Distribution</span>
              <span className={`font-mono text-xs ${totalSum === 100 ? 'text-emerald-600' : 'text-amber-600 font-bold'}`}>
                Total: {totalSum}% {totalSum !== 100 && '(Adjust to 100%)'}
              </span>
            </div>

            {/* Semantic Relevance */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Semantic Relevance (Topic & Concept Match)
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {Math.round(weights.semantic_relevance * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={Math.round(weights.semantic_relevance * 100)}
                onChange={(e) => handleSliderChange('semantic_relevance', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Engagement Quality */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Engagement Quality (Likes, Comments, Shares, Views)
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {Math.round(weights.engagement_quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={Math.round(weights.engagement_quality * 100)}
                onChange={(e) => handleSliderChange('engagement_quality', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Local Thai Signals */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                  Local Thai Signals (Language, Geotargeting, Keywords)
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {Math.round(weights.local_content_relevance * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={Math.round(weights.local_content_relevance * 100)}
                onChange={(e) => handleSliderChange('local_content_relevance', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Brand Safety */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  Brand Safety & Compliance
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {Math.round(weights.brand_safety * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={Math.round(weights.brand_safety * 100)}
                onChange={(e) => handleSliderChange('brand_safety', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Data Quality */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  Data Completeness & Profile Health
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {Math.round(weights.data_quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={Math.round(weights.data_quality * 100)}
                onChange={(e) => handleSliderChange('data_quality', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
