'use client';
import { createContext, useContext, useState, useEffect } from 'react';

export type VisitorMode = 'recruiter' | 'developer' | 'friend';

interface Ctx {
  mode:    VisitorMode;
  setMode: (m: VisitorMode) => void;
  dark:    boolean;
  setDark: (d: boolean) => void;
}
const VisitorCtx = createContext<Ctx>({ mode: 'developer', setMode: ()=>{}, dark: false, setDark: ()=>{} });

export function VisitorModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<VisitorMode>('developer');
  const [dark, setDarkState] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('pf_mode') as VisitorMode | null;
    const savedDark = localStorage.getItem('pf_dark') === '1';
    if (savedMode) setModeState(savedMode);
    setDarkState(savedDark);
    applyTheme(savedMode ?? 'developer', savedDark);
  }, []);

  const applyTheme = (m: VisitorMode, d: boolean) => {
    document.documentElement.setAttribute('data-mode', m);
    if (d && m !== 'developer') {
      document.documentElement.setAttribute('data-dark', '1');
    } else {
      document.documentElement.removeAttribute('data-dark');
    }
  };

  const setMode = (m: VisitorMode) => {
    setModeState(m);
    localStorage.setItem('pf_mode', m);
    applyTheme(m, dark);
  };

  const setDark = (d: boolean) => {
    setDarkState(d);
    localStorage.setItem('pf_dark', d ? '1' : '0');
    applyTheme(mode, d);
  };

  return <VisitorCtx.Provider value={{ mode, setMode, dark, setDark }}>{children}</VisitorCtx.Provider>;
}

export const useVisitorMode = () => useContext(VisitorCtx);
