import { X } from "lucide-react";
import React from "react";

type ModalShellProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

const ModalShell: React.FC<ModalShellProps> = ({ open, title, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-70" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative z-80 flex min-h-full items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-md rounded-3xl bg-white shadow-xl overflow-hidden">
          <button
            type="button"
            className="absolute left-4 top-4 rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
            onClick={onClose}
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex max-h-[calc(100vh-3rem)] flex-col pt-10 px-6 pb-6">
            <div className="text-center text-lg font-semibold text-gray-900 mb-4 pr-6">{title}</div>
            <div className="overflow-y-auto pr-1">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalShell;
