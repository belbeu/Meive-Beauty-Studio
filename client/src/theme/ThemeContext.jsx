import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const KEY = "meive-theme";
const ThemeContext = createContext({ theme: "dark", isLight: false, toggleTheme() {} });

function lerSalvo() {
  try {
    const t = localStorage.getItem(KEY);
    if (t === "light" || t === "dark") return t;
  } catch { /* sem localStorage */ }
  return "dark"; // o visual atual é o escuro
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(lerSalvo);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch { /* ignora */ }
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(t => (t === "light" ? "dark" : "light")), []);
  const value = useMemo(() => ({ theme, isLight: theme === "light", toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);