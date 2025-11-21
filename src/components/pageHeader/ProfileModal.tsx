import { Camera } from "lucide-react";
import React from "react";
import LabeledInput from "./LabeledInput";
import ModalShell from "./ModalShell";
import type { ProfileState } from "./types";

type ProfileModalProps = {
  open: boolean;
  profile: ProfileState;
  onFieldChange: (field: keyof ProfileState, value: string) => void;
  onAvatarButtonClick: () => void;
  onAvatarChange: (files: FileList | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  profile,
  onFieldChange,
  onAvatarButtonClick,
  onAvatarChange,
  fileInputRef,
  onClose,
}) => {
  return (
    <ModalShell open={open} title="پروفایل من" onClose={onClose}>
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <img
            src={profile.avatar}
            alt="تصویر پروفایل"
            className="w-28 h-28 rounded-full object-cover border-4 border-indigo-100 shadow-md"
          />
          <button
            type="button"
            className="absolute bottom-1 left-1 p-2 rounded-full bg-white shadow"
            onClick={onAvatarButtonClick}
            aria-label="تغییر تصویر"
          >
            <Camera className="w-4 h-4 text-indigo-600" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => onAvatarChange(event.target.files)}
          />
        </div>

        <div className="w-full space-y-4 text-right">
          <LabeledInput label="نام" value={profile.name} onChange={(value) => onFieldChange("name", value)} />
          <LabeledInput
            label="نام کاربری"
            value={profile.username}
            onChange={(value) => onFieldChange("username", value)}
          />
        </div>
      </div>
    </ModalShell>
  );
};

export default ProfileModal;
