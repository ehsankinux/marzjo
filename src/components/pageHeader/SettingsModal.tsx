import { Camera, KeyRound, LogOut, Mail, Shield, Trash2, UserPen } from "lucide-react";
import React from "react";
import LabeledInput from "./LabeledInput";
import ModalShell from "./ModalShell";
import MoreInfoSection from "./MoreInfoSection";
import SettingsLink from "./SettingsLink";
import type { ProfileState } from "./types";

type SettingsModalProps = {
  open: boolean;
  profile: ProfileState;
  onFieldChange: (field: keyof ProfileState, value: string) => void;
  onAvatarButtonClick: () => void;
  onAvatarChange: (files: FileList | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  showMoreInfo: boolean;
  onToggleMoreInfo: () => void;
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  profile,
  onFieldChange,
  onAvatarButtonClick,
  onAvatarChange,
  fileInputRef,
  onClose,
  showMoreInfo,
  onToggleMoreInfo,
}) => {
  return (
    <ModalShell open={open} title="تنظیمات حساب" onClose={onClose}>
      <div className="space-y-6 text-right">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={profile.avatar}
              alt="تصویر پروفایل"
              className="w-16 h-16 rounded-full object-cover border-4 border-indigo-50 shadow"
            />
            <button
              type="button"
              className="absolute bottom-0 left-0 p-1.5 rounded-full bg-white shadow"
              onClick={onAvatarButtonClick}
              aria-label="تغییر تصویر"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => onAvatarChange(event.target.files)}
            />
          </div>

          <div className="flex-1 space-y-3">
            <LabeledInput
              label="نام نمایش"
              value={profile.name}
              onChange={(value) => onFieldChange("name", value)}
              compact
            />
            <LabeledInput
              label="ایمیل"
              value={profile.email}
              onChange={(value) => onFieldChange("email", value)}
              compact
              type="email"
            />
          </div>
        </div>

        <nav className="space-y-3">
          <SettingsLink icon={Mail} label="ایمیل" description={profile.email} />
          <SettingsLink icon={KeyRound} label="تغییر رمز عبور" />
          <SettingsLink icon={UserPen} label="عضویت پلاس" description="قابلیت‌های پیشرفته" />
          <SettingsLink icon={Shield} label="حریم خصوصی" />
          <MoreInfoSection expanded={showMoreInfo} onToggle={onToggleMoreInfo} />
        </nav>

        <div className="space-y-3">
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-gray-800 hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4" />
            خروج از حساب
          </button>
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-red-600 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
            حذف حساب
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default SettingsModal;
