import React, { ReactNode, useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange 
}) => {
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // Scroll active tab into view on tab change
  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeTabElement = tabsContainerRef.current.querySelector(`[data-tab-id="${activeTab}"]`);
      if (activeTabElement) {
        const containerRect = tabsContainerRef.current.getBoundingClientRect();
        const activeTabRect = activeTabElement.getBoundingClientRect();
        
        // Check if active tab is not fully visible
        if (activeTabRect.left < containerRect.left || activeTabRect.right > containerRect.right) {
          activeTabElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }
      }
      
      // Check scroll position
      checkScrollPosition();
    }
  }, [activeTab]);
  
  // Function to check scroll position and show/hide arrows
  const checkScrollPosition = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer
    }
  };
  
  // Add scroll event listener to update arrow visibility
  useEffect(() => {
    const tabsContainer = tabsContainerRef.current;
    if (tabsContainer) {
      tabsContainer.addEventListener('scroll', checkScrollPosition);
      // Check initial scroll position
      checkScrollPosition();
      
      // Check on window resize too
      window.addEventListener('resize', checkScrollPosition);
      
      return () => {
        tabsContainer.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, []);
  
  const scrollLeft = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Left arrow navigation button - only visible on mobile/small screens and when there's content to scroll to */}
      {showLeftArrow && (
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 rounded-full shadow-md p-1 md:hidden"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft className="w-5 h-5 text-blue-600" />
        </button>
      )}
      
      {/* Right arrow navigation button - only visible on mobile/small screens and when there's content to scroll to */}
      {showRightArrow && (
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 rounded-full shadow-md p-1 md:hidden"
          aria-label="Scroll tabs right"
        >
          <ChevronRight className="w-5 h-5 text-blue-600" />
        </button>
      )}
      
      {/* Left shadow indicator when scrollable */}
      {showLeftArrow && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      )}
      
      <div 
        ref={tabsContainerRef}
        className="flex overflow-x-auto p-1 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            onClick={() => onTabChange(tab.id)}
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