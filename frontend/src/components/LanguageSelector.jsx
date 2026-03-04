import { useState } from 'react';
import { useLanguage } from '../i18n';

export default function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'pt', flag: '🇧🇷', label: 'PT' },
    { code: 'en', flag: '🇺🇸', label: 'EN' },
    { code: 'es', flag: '🇪🇸', label: 'ES' },
  ];

  const current = languages.find(l => l.code === lang);

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Botão que mostra idioma atual */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-white hover:bg-white hover:bg-opacity-10 px-2 py-1 rounded transition-colors"
      >
        <span className="text-lg">{current.flag}</span>
        <span className="text-sm font-medium">{current.label}</span>
        <span className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {/* Dropdown com as 3 opções */}
      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu dropdown */}
          <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border z-20 min-w-[100px]">
            {languages.map(l => (
              <button
                key={l.code}
                onClick={() => handleLanguageChange(l.code)}
                className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-left transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  lang === l.code ? 'bg-gray-50 font-semibold' : ''
                }`}
              >
                <span className="text-lg">{l.flag}</span>
                <span className="text-sm text-gray-700">{l.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}