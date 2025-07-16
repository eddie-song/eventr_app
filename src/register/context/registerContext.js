import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'onboardingData';
const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) ?? {};
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      return {};
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  }, [data]);

  const clear = () => {
    setData({});
    sessionStorage.removeItem(STORAGE_KEY);
  }

  return (
    <OnboardingContext.Provider value={{ 
      data,
      setData,
      clear,
     }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);