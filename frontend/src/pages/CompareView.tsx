import React from 'react';
import { RecommendationResponse } from '../types';
import { CompareCreators } from '../components/kol/CompareCreators';
import { EmptyState } from '../components/common/EmptyState';
import { SlidersHorizontal, Info } from 'lucide-react';

interface CompareViewProps {
  result: RecommendationResponse | null;
  comparisonList: string[];
  onRemoveCreator: (username: string) => void;
  onClearAll: () => void;
  onGoToRecommendations: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  result,
  comparisonList,
  onRemoveCreator,
  onClearAll,
  onGoToRecommendations,
}) => {
  if (!result || !result.recommendations || result.recommendations.length === 0) {
    return (
      <EmptyState
        title="ยังไม่มีครีเอเตอร์ให้เปรียบเทียบ (No Creators to Compare)"
        description="เริ่มการวิเคราะห์แบรนด์ก่อน จากนั้นกดปุ่มเปรียบเทียบจากหน้ารายการแนะนำหรือการค้นหา"
        actionLabel="ดูรายการแนะนำ (Recommendations)"
        onAction={onGoToRecommendations}
        icon={<SlidersHorizontal className="w-5 h-5 text-slate-400" />}
      />
    );
  }

  const comparedCreators = result.recommendations.filter((c) =>
    comparisonList.includes(c.username)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-thai">
      {/* Page header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5A1F] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              Side-by-Side Analysis
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            เปรียบเทียบครีเอเตอร์ (Creator Comparison)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            ประเมินคะแนนเชิงลึก 5 มิติแบบคู่ขนานเพื่อประกอบการตัดสินใจของทีมการตลาด
          </p>
        </div>

        {comparisonList.length > 0 && (
          <button
            onClick={onClearAll}
            className="btn-secondary text-xs px-4 py-2.5 self-start sm:self-auto min-h-[44px] cursor-pointer"
          >
            ล้างการเลือก ({comparisonList.length})
          </button>
        )}
      </div>

      {/* Instruction callout when empty */}
      {comparisonList.length === 0 && (
        <div className="p-5 rounded-3xl bg-orange-50/40 border border-orange-200/80 shadow-2xs flex items-start gap-3">
          <Info className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-900">
              ยังไม่ได้เลือกครีเอเตอร์เข้าสู่ตารางเปรียบเทียบ
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ไปที่หน้า{' '}
              <button
                onClick={onGoToRecommendations}
                className="text-[#FF5A1F] font-bold underline underline-offset-2 cursor-pointer hover:text-[#E24A12]"
              >
                รายการแนะนำ (Recommendations)
              </button>
              {' '}หรือหน้าค้นหา แล้วแตะปุ่ม "เปรียบเทียบ" บนครีเอเตอร์ที่สนใจ (เลือกได้สูงสุด 3 ท่าน)
            </p>
          </div>
        </div>
      )}

      {/* Comparison table / Mobile cards */}
      {comparedCreators.length > 0 && (
        <CompareCreators
          creators={comparedCreators}
          onRemoveCreator={onRemoveCreator}
          onClearAll={onClearAll}
        />
      )}
    </div>
  );
};

export default CompareView;
