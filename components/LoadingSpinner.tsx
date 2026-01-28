import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full opacity-25"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-gray-600 font-medium animate-pulse">Stil Analizi Yapılıyor...</p>
      <div className="flex space-x-1 text-sm text-purple-500">
        <span>✨</span>
        <span>Renkler İnceleniyor</span>
        <span>✨</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
