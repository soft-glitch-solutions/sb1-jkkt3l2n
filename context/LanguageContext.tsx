// context/LanguageContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import * as Localization from 'expo-localization';

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

type LanguageProviderProps = {
  children: React.ReactNode;
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<string>(Localization.locale.split('-')[0]); // Default to device locale

  useEffect(() => {
    // Update the language if the device locale changes
    setLanguage(Localization.locale.split('-')[0]);
  }, [Localization.locale]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};