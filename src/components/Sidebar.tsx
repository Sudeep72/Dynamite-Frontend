"use client";

import React, { useState, useEffect } from "react";
import { FileText, Upload, Cpu, TestTube, User } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { ViewType } from "@/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";

const useIsLargeScreen = () => {
  const [isLarge, setIsLarge] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const check = () => setIsLarge(window.innerWidth >= 1024);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }
  }, []);
  return isLarge;
};

const NavContent: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  onClose,
  isCollapsed,
}) => (
  <nav className="flex-1 px-5 py-2 space-y-2 overflow-y-auto">
    {[
      {
        view: "documentation",
        label: "Documentation",
        icon: <FileText className="w-7 h-7" />,
      },
      {
        view: "upload",
        label: "Upload Images",
        icon: <Upload className="w-7 h-7" />,
      },
      {
        view: "train",
        label: "Train Model",
        icon: <Cpu className="w-7 h-7" />,
      },
      {
        view: "test",
        label: "Test Model",
        icon: <TestTube className="w-7 h-7" />,
      },
    ].map((item) => (
      <SidebarItem
        key={item.view}
        icon={item.icon}
        label={item.label}
        active={activeView === item.view}
        onClick={() => onViewChange(item.view as ViewType)}
        isCollapsed={isCollapsed}
      />
    ))}

    <div className="border-t border-gray-200 mt-10 pt-5">
      <SidebarItem
        icon={<User className="w-7 h-7" />}
        label="About Us"
        active={activeView === "about"}
        onClick={() => onViewChange("about")}
        isCollapsed={isCollapsed}
      />
    </div>
  </nav>
);

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  isCollapsed: boolean;
  onClose: () => void;
}

const DesktopSidebar: React.FC<SidebarProps> = (props) => (
  <aside
    className={`flex-col bg-gray-50 border-r border-gray-200 fixed inset-y-0 z-30 transition-all duration-300 ${
      props.isCollapsed ? "w-20" : "w-80"
    }`}
  >
    <div className="p-8">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">D</span>
        </div>
        <h2
          className={`text-2xl font-bold text-gray-900 transition-opacity duration-100 ${
            props.isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
          }`}
        >
          Dynamite
        </h2>
      </div>
    </div>

    <NavContent {...props} />
  </aside>
);

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  isCollapsed,
  onClose,
}) => {
  const isLarge = useIsLargeScreen();

  return (
    <>
      {isLarge && (
        <>
          <DesktopSidebar
            activeView={activeView}
            onViewChange={onViewChange}
            isCollapsed={isCollapsed}
            onClose={onClose}
          />
          <div
            className={`transition-all duration-300 flex-shrink-0 ${
              isCollapsed ? "w-20" : "w-80"
            }`}
          />
        </>
      )}

      {!isLarge && (
        <Sheet open={!isCollapsed} onOpenChange={onClose}>
          <SheetContent
            side="left"
            className="w-80 p-0 flex flex-col sm:max-w-sm bg-gray-50 border-r border-gray-200 z-50"
          >
            <SheetHeader className="p-8 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <SheetTitle className="text-2xl font-bold text-gray-900">
                  Navigation
                </SheetTitle>
              </div>
            </SheetHeader>

            <NavContent
              activeView={activeView}
              onViewChange={onViewChange}
              onClose={onClose}
              isCollapsed={false}
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};
