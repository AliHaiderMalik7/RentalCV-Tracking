// src/components/common/Modal.tsx
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 px-4">
      <div
        className="
          bg-white rounded-lg border border-gray-300 
          w-full max-w-sm sm:max-w-md md:max-w-2xl 
          max-h-[80vh] flex flex-col relative overflow-hidden
        "
      >
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-4 bg-white border-b border-gray-200 z-10">
          {title && (
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
