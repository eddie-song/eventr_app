import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PageCacheContext = createContext();

export const usePageCache = () => {
  const context = useContext(PageCacheContext);
  if (!context) {
    throw new Error('usePageCache must be used within a PageCacheProvider');
  }
  return context;
};

export const PageCacheProvider = ({ children }) => {
  const [loadedPages, setLoadedPages] = useState(new Set());
  const [pageData, setPageData] = useState({});

  // Load cached data from localStorage on mount
  useEffect(() => {
    try {
      const cachedLoadedPages = localStorage.getItem('encounters_loadedPages');
      const cachedPageData = localStorage.getItem('encounters_pageData');
      
      if (cachedLoadedPages) {
        setLoadedPages(new Set(JSON.parse(cachedLoadedPages)));
      }
      
      if (cachedPageData) {
        setPageData(JSON.parse(cachedPageData));
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('encounters_loadedPages', JSON.stringify(Array.from(loadedPages)));
      localStorage.setItem('encounters_pageData', JSON.stringify(pageData));
    } catch (error) {
      console.error('Error saving cached data:', error);
    }
  }, [loadedPages, pageData]);

  const markPageAsLoaded = useCallback((pageName) => {
    setLoadedPages(prev => new Set(prev).add(pageName));
  }, []);

  const isPageLoaded = useCallback((pageName) => {
    return loadedPages.has(pageName);
  }, [loadedPages]);

  const cachePageData = useCallback((pageName, data) => {
    setPageData(prev => ({
      ...prev,
      [pageName]: data
    }));
  }, []);

  const getPageData = useCallback((pageName) => {
    return pageData[pageName] || null;
  }, [pageData]);

  const clearPageCache = useCallback((pageName) => {
    if (pageName) {
      setLoadedPages(prev => {
        const newSet = new Set(prev);
        newSet.delete(pageName);
        return newSet;
      });
      setPageData(prev => {
        const newData = { ...prev };
        delete newData[pageName];
        return newData;
      });
    } else {
      // Clear all cache
      setLoadedPages(new Set());
      setPageData({});
      // Clear localStorage
      localStorage.removeItem('encounters_loadedPages');
      localStorage.removeItem('encounters_pageData');
    }
  }, []);

  const value = {
    loadedPages,
    markPageAsLoaded,
    isPageLoaded,
    cachePageData,
    getPageData,
    clearPageCache
  };

  return (
    <PageCacheContext.Provider value={value}>
      {children}
    </PageCacheContext.Provider>
  );
}; 