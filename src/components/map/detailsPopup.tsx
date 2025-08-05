import React from 'react';

interface DetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const DetailsPopup: React.FC<DetailsPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end items-center">
      <div className="relative w-80 h-[90%] bg-white bg-opacity-50 shadow-lg mr-5 rounded-xl">
        <div className="p-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-xl border-none bg-transparent cursor-pointer"
          >
            ×
          </button>
          <div className="mt-8">
            {/* Modal content will go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPopup;
