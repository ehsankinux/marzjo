import { ChevronDown, HelpCircle, Info } from "lucide-react";
import React from "react";

type MoreInfoSectionProps = {
  expanded: boolean;
  onToggle: () => void;
};

const MoreInfoSection: React.FC<MoreInfoSectionProps> = ({ expanded, onToggle }) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
    <button type="button" className="flex w-full items-center justify-between text-gray-800" onClick={onToggle}>
      <div className="flex items-center gap-3">
        <Info className="w-5 h-5 text-indigo-600" />
        <span className="font-medium">اطلاعات بیشتر</span>
      </div>
      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
    </button>

    {expanded && (
      <div className="mt-3 space-y-2 pr-8 text-sm">
        <button type="button" className="flex w-full items-center gap-2 text-gray-700 hover:text-indigo-600">
          <Info className="w-4 h-4 text-gray-400" />
          درباره ما
        </button>
        <button type="button" className="flex w-full items-center gap-2 text-gray-700 hover:text-indigo-600">
          <HelpCircle className="w-4 h-4 text-gray-400" />
          کمک
        </button>
      </div>
    )}
  </div>
);

export default MoreInfoSection;
