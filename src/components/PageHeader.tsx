import React, { useRef, useState } from "react";
import HeaderBar from "./pageHeader/HeaderBar";
import ProfileModal from "./pageHeader/ProfileModal";
import SettingsModal from "./pageHeader/SettingsModal";
import { defaultProfile } from "./pageHeader/constants";
import type { PageHeaderProps, ProfileState } from "./pageHeader/types";
import { useScrollLock } from "./pageHeader/useScrollLock";

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  const [profile, setProfile] = useState<ProfileState>(defaultProfile);
  const [activeModal, setActiveModal] = useState<"profile" | "settings" | null>(null);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  const profileImageInputRef = useRef<HTMLInputElement | null>(null);
  const settingsImageInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarChange = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    const newUrl = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, avatar: newUrl }));
  };

  const handleFieldChange = (field: keyof ProfileState, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const openProfileModal = () => setActiveModal("profile");
  const openSettingsModal = () => {
    setShowMoreInfo(false);
    setActiveModal("settings");
  };
  const closeModal = () => setActiveModal(null);

  useScrollLock(activeModal !== null);

  return (
    <>
      <HeaderBar title={title} avatar={profile.avatar} onOpenProfile={openProfileModal} onOpenSettings={openSettingsModal} />

      <ProfileModal
        open={activeModal === "profile"}
        profile={profile}
        onFieldChange={handleFieldChange}
        onClose={closeModal}
        onAvatarButtonClick={() => profileImageInputRef.current?.click()}
        onAvatarChange={handleAvatarChange}
        fileInputRef={profileImageInputRef}
      />

      <SettingsModal
        open={activeModal === "settings"}
        profile={profile}
        onFieldChange={handleFieldChange}
        onClose={closeModal}
        onAvatarButtonClick={() => settingsImageInputRef.current?.click()}
        onAvatarChange={handleAvatarChange}
        fileInputRef={settingsImageInputRef}
        showMoreInfo={showMoreInfo}
        onToggleMoreInfo={() => setShowMoreInfo((prev) => !prev)}
      />
    </>
  );
};

export default PageHeader;

