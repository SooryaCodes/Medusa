import React, { useRef, useEffect, useState } from 'react';
import { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon: ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  tabs, 
  activeTab, 
  onChange 
}) => {
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  useEffect(() => {
    const checkForScrollbar = () => {
      if (tabsContainerRef.current) {
        const { scrollWidth, clientWidth } = tabsContainerRef.current;
        setShowRightArrow(scrollWidth > clientWidth);
      }
    };
    
    checkForScrollbar();
    window.addEventListener('resize', checkForScrollbar);
    return () => window.removeEventListener('resize', checkForScrollbar);
  }, [tabs]);
  
  const scrollToActiveTab = () => {
    if (tabsContainerRef.current) {
      const activeTabElement = tabsContainerRef.current.querySelector(`[data-tab-id="${activeTab}"]`);
      if (activeTabElement) {
        activeTabElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }
  };
  
  useEffect(() => {
    scrollToActiveTab();
  }, [activeTab]);
  
  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-2">
      <div 
        ref={tabsContainerRef}
        className="flex overflow-x-auto p-1 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm whitespace-nowrap transition-all snap-start mr-1 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="mr-1.5 sm:mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Right shadow indicator when scrollable */}
      {showRightArrow && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
      )}
    </div>
  );
};

export default TabNavigation;