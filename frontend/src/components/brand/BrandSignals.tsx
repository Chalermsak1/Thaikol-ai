import React from 'react';
import { BrandProfile } from '../../types';
import { Users, Layers, ShoppingBag, MessageSquare, Hash } from 'lucide-react';

interface BrandSignalsProps {
  brandProfile: BrandProfile;
}

const SignalSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="saas-card p-5">
    <div className="flex items-center gap-2 mb-3">
      <div className="text-slate-400">{icon}</div>
      <h3 className="text-xs font-semibold text-slate-800">{title}</h3>
    </div>
    {children}
  </div>
);

export const BrandSignals: React.FC<BrandSignalsProps> = ({ brandProfile }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Target Audience */}
      <SignalSection
        icon={<Users className="w-3.5 h-3.5" />}
        title="Target Audience"
      >
        <ul className="space-y-1.5">
          {brandProfile.target_audience.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
              <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </SignalSection>

      {/* Content Themes */}
      <SignalSection
        icon={<Layers className="w-3.5 h-3.5" />}
        title="Content Themes"
      >
        <div className="flex flex-wrap gap-1.5">
          {brandProfile.content_themes.map((theme, idx) => (
            <span key={idx} className="badge badge-neutral">
              {theme}
            </span>
          ))}
        </div>
      </SignalSection>

      {/* Products & Services */}
      <SignalSection
        icon={<ShoppingBag className="w-3.5 h-3.5" />}
        title="Products & Services"
      >
        <div className="flex flex-wrap gap-1.5">
          {brandProfile.products_services.map((product, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700"
            >
              {product}
            </span>
          ))}
        </div>
      </SignalSection>

      {/* Brand Tone + Keywords */}
      <SignalSection
        icon={<MessageSquare className="w-3.5 h-3.5" />}
        title="Brand Tone"
      >
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {brandProfile.brand_tone.map((tone, idx) => (
              <span key={idx} className="badge badge-neutral">
                {tone}
              </span>
            ))}
          </div>

          {brandProfile.keywords.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                <Hash className="w-3 h-3" />
                Keywords
              </div>
              <div className="flex flex-wrap gap-1">
                {brandProfile.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </SignalSection>
    </div>
  );
};
