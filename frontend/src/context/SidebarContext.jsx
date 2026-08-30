import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  // Desktop collapsed state stored in localStorage
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar_collapsed_desktop');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Mobile drawer state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Sync to localStorage whenever desktop collapsed state changes
  useEffect(() => {
    try {
      localStorage.setItem('sidebar_collapsed_desktop', isDesktopCollapsed ? 'true' : 'false');
    } catch (e) {
      console.warn('Could not persist sidebar state:', e);
    }
  }, [isDesktopCollapsed]);

  const toggleDesktopSidebar = () => {
    setIsDesktopCollapsed(prev => !prev);
  };

  const toggleMobileDrawer = () => {
    setIsMobileDrawerOpen(prev => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        isDesktopCollapsed,
        setIsDesktopCollapsed,
        toggleDesktopSidebar,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        toggleMobileDrawer,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isDesktopCollapsed: false,
      setIsDesktopCollapsed: () => {},
      toggleDesktopSidebar: () => {},
      isMobileDrawerOpen: false,
      setIsMobileDrawerOpen: () => {},
      toggleMobileDrawer: () => {},
    };
  }
  return context;
};

export default SidebarContext;
