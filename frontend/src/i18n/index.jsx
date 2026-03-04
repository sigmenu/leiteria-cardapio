import { createContext, useContext, useState, useEffect } from 'react';
import pt from './pt.json';
import en from './en.json';
import es from './es.json';

const translations = { pt, en, es };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('menu_lang') || 'pt';
  });

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('menu_lang', newLang);
  };

  // Função para traduzir textos fixos do sistema
  const t = (key) => {
    return translations[lang]?.[key] || translations['pt'][key] || key;
  };

  // Função para retornar o campo traduzido de um objeto do banco
  // Ex: tField(category, 'name') retorna category.name_en se lang='en', senão category.name
  const tField = (obj, field) => {
    if (!obj) return '';
    if (lang === 'pt') return obj[field] || '';
    const translatedField = obj[`${field}_${lang}`];
    return translatedField || obj[field] || ''; // fallback para português se não tiver tradução
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t, tField }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};