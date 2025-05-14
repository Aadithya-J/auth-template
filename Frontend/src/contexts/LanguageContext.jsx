// src/contexts/LanguageContext.js
import React, { createContext, useContext, useState } from 'react';
import { getTranslation } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // 'en', 'ta', or 'hi'
  
  const t = (key) => getTranslation(key, language);
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);