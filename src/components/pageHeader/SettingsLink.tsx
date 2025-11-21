import React from "react";

type SettingsLinkProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
};

const SettingsLink: React.FC<SettingsLinkProps> = ({ icon: Icon, label, description }) => {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3 text-gray-800 shadow-sm hover:border-indigo-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="text-right">
          <div className="font-semibold">{label}</div>
          {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
        </div>
      </div>
    </button>
  );
};

export default SettingsLink;
