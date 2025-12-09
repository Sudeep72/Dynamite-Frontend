import { ReactNode } from 'react';

export type ViewType = 'documentation' | 'upload' | 'train' | 'test' | 'about';

export interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

export interface UploadedFile {
  name: string;
  size: string;
  status: 'ready' | 'processing' | 'complete';
}