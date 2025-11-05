import { createContext, useContext, useState, useEffect, useMemo } from "react";
import fr from "../locales/fr";
import en from "../locales/en";

const LanguageContext = createContext({
  language: "fr",
  setLanguage: () => {},
  t: () => "",
});

const translations = {
  fr,
  en,
};

// Détecter la langue du navigateur
const detectLanguage = () => {
  const savedLanguage = localStorage.getItem("appLanguage");
  if (savedLanguage && (savedLanguage === "fr" || savedLanguage === "en")) {
    return savedLanguage;
  }

  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split("-")[0].toLowerCase();

  return langCode === "en" ? "en" : "fr";
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(detectLanguage);

  // Enregistrer la langue dans localStorage quand elle change
  const setLanguage = (lang) => {
    if (lang === "fr" || lang === "en") {
      setLanguageState(lang);
      localStorage.setItem("appLanguage", lang);
    }
  };

  // Charger la langue depuis localStorage au montage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("appLanguage");
    if (savedLanguage && (savedLanguage === "fr" || savedLanguage === "en")) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Fonction de traduction avec support pour les fonctions
  const t = useMemo(() => {
    return (key, params = {}) => {
      const keys = key.split(".");
      let value = translations[language];

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          // Fallback vers français si la clé n'existe pas
          let fallbackValue = translations.fr;
          for (const fk of keys) {
            if (fallbackValue && typeof fallbackValue === "object" && fk in fallbackValue) {
              fallbackValue = fallbackValue[fk];
            } else {
              return key;
            }
          }
          value = fallbackValue;
          break;
        }
      }

      if (typeof value === "function") {
        return value(params.fieldName || (typeof params === "string" ? params : params.fieldName || ""));
      }

      return value || key;
    };
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

