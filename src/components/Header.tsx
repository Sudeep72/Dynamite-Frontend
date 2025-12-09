import React from 'react';
import { Minimize2, Maximize2 } from 'lucide-react'; 
import { Button } from './ui/button';

interface HeaderProps {
  onMenuToggle: () => void;
  isCollapsed: boolean; 
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isCollapsed }) => (
  <header className="bg-white px-6 sm:px-10 py-4 flex items-center justify-between sticky top-0 z-40"> 
    <div className="flex items-center gap-4 sm:gap-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuToggle}
        className="w-10 h-10" 
        aria-label="Toggle sidebar size"
      >
        {isCollapsed ? (
          <Maximize2 className="w-6 h-6" />
        ) : (
          <Minimize2 className="w-6 h-6" />
        )}
      </Button>
      
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-base">D</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dynamite</h1>
      </div>
    </div>
  </header>
);