import React, { createContext, useContext, useState } from 'react';

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

  const markPageAsLoaded = (pageName) => {
    setLoadedPages(prev => new Set(prev).add(pageName));
  };

  const isPageLoaded = (pageName) => {
    return loadedPages.has(pageName);
  };

  const cachePageData = (pageName, data) => {
    setPageData(prev => ({
      ...prev,
      [pageName]: data
    }));
  };

  const getPageData = (pageName) => {
    return pageData[pageName] || null;
  };

  const clearPageCache = (pageName) => {
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
    }
  };

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