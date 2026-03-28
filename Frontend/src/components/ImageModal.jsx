import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white p-4 rounded-lg shadow-lg max-w-4xl max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={imageUrl} alt="Full screen" className="max-h-[80vh] max-w-full object-contain" />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-gray-800 rounded-full p-2"
        >
          <X size={24} />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ImageModal;
