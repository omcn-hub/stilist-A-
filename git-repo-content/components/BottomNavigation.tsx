import React from 'react';
import { Home, User, Camera } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: 'home' | 'profile';
  onTabChange: (tab: 'home' | 'profile') => void;
  onScanClick: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange, onScanClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto relative px-2">
        
        {/* Home Tab */}
        <button 
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center w-16 space-y-1 transition-colors ${activeTab === 'home' ? 'text-purple-600' : 'text-gray-400'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Ana Sayfa</span>
        </button>

        {/* Floating Scan Button */}
        <div className="relative -top-5">
           <button 
             onClick={onScanClick}
             className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-300 hover:scale-105 active:scale-95 transition-transform ring-4 ring-gray-50"
           >
             <Camera className="w-7 h-7" />
           </button>
        </div>

        {/* Profile Tab */}
        <button 
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center w-16 space-y-1 transition-colors ${activeTab === 'profile' ? 'text-purple-600' : 'text-gray-400'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profilim</span>
        </button>

      </div>
    </div>
  );
};

export default BottomNavigation;
