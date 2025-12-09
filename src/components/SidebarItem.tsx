import React from 'react';
import { SidebarItemProps } from '@/types'; 
import { Button } from './ui/button';

interface UpdatedSidebarItemProps extends SidebarItemProps {
  isCollapsed: boolean;
}

export const SidebarItem: React.FC<UpdatedSidebarItemProps> = ({ icon, label, active, onClick, isCollapsed }) => (
  <Button
    variant="ghost"
    onClick={onClick}
    className={`
      w-full justify-start gap-3 py-4 text-base transition-all duration-300
      ${isCollapsed ? 'px-3' : 'px-5'} 
      ${
        active
          ? 'bg-blue-100 text-violet-700 hover:bg-blue-200 font-semibold'
          : 'text-gray-600 hover:bg-gray-100 hover:text-violet-700'
      }
    `}
  >
    <span className="flex-shrink-0">{icon}</span>
    
    {!isCollapsed && (
      <span className="truncate">
        {label}
      </span>
    )}
  </Button>
);