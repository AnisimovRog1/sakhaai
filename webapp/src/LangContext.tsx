import { createContext, useContext, useState, useCallback } from 'react';
import type { Lang } from './i18n';
import { t as translate } from './i18n';
import type { TranslationKey } from './i18n';

type LangContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
};

const LangContext = createContext<LangContextType>({
  lang: 'ru',
  setLang: () => {},
  t: (key) => key,
});

export function LangProvider({ children, initialLang = 'ru' }: { children: React.ReactNode; initialLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  const tFn = useCallback((key: TranslationKey) => translate(key, lang), [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t: tFn }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
