import { Settings } from "lucide-react";
import React from "react";

type HeaderBarProps = {
  title: string;
  avatar: string;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
};

const HeaderBar: React.FC<HeaderBarProps> = ({ title, avatar, onOpenProfile, onOpenSettings }) => (
  <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
    <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
      <button
        type="button"
        className="p-2 rounded-2xl bg-gray-100 hover:bg-gray-200 transition"
        onClick={onOpenSettings}
        aria-label="تنظیمات"
      >
        <Settings className="w-5 h-5 text-gray-800" />
      </button>

      <div className="text-lg font-semibold text-gray-900">{title}</div>

      <button
        type="button"
        className="w-11 h-11 rounded-full overflow-hidden border-2 border-indigo-100 shadow-sm"
        onClick={onOpenProfile}
        aria-label="پروفایل"
      >
        <img src={avatar} alt="پروفایل کاربر" className="w-full h-full object-cover" />
      </button>
    </div>
  </header>
);

export default HeaderBar;
