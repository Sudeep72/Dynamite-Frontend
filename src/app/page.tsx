"use client";

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { DocumentationView } from '@/views/DocumentationView';
import { UploadView } from '@/views/UploadView';
import { TrainView } from '@/views/TrainView';
import { SearchView } from '@/views/SearchView';
import { AboutView } from '@/views/AboutView';
import { ViewType } from '@/types';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('documentation');
  const [isCollapsed, setIsCollapsed] = useState(true); 

  const renderView = () => {
    switch (activeView) {
      case 'documentation':
        return <DocumentationView />;
      case 'upload':
        return <UploadView />;
      case 'train':
        return <TrainView />;
      case 'test':
        return <SearchView />;
      case 'about':
        return <AboutView />;
      default:
        return <DocumentationView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header 
        onMenuToggle={() => setIsCollapsed(prev => !prev)} 
        isCollapsed={isCollapsed} 
      /> 
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          isCollapsed={isCollapsed} 
          onClose={() => setIsCollapsed(true)} 
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 sm:p-8 lg:p-10">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}