
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

const KEY = "meive-theme";
const FONT_KEY = "meive-font-scale";

const FONT_SCALES = [0.9, 1, 1.1, 1.2, 1.3];

const ThemeContext = createContext({
  theme: "dark",
  isLight: false,
  toggleTheme() {},
  fontScale: 1,
  increaseFont() {},
  decreaseFont() {},
  resetFont() {}
});

function lerSalvo() {
  try {
    const t = localStorage.getItem(KEY);
    if (t === "light" || t === "dark") return t;
  } catch {}

  return "dark";
}

function lerFonteSalva() {
  try {
    const saved = Number(localStorage.getItem(FONT_KEY));

    if (FONT_SCALES.includes(saved)) return saved;
  } catch {}

  return 1;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(lerSalvo);
  const [fontScale, setFontScale] = useState(lerFonteSalva);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    try {
      localStorage.setItem(KEY, theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--font-scale",
      fontScale
    );

    document.documentElement.setAttribute(
      "data-font-scale",
      String(fontScale)
    );

    try {
      localStorage.setItem(FONT_KEY, String(fontScale));
    } catch {}
  }, [fontScale]);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === "light" ? "dark" : "light"));
  }, []);

  const increaseFont = useCallback(() => {
    setFontScale(current => {
      const index = FONT_SCALES.indexOf(current);

      return FONT_SCALES[
        Math.min(index + 1, FONT_SCALES.length - 1)
      ];
    });
  }, []);

  const decreaseFont = useCallback(() => {
    setFontScale(current => {
      const index = FONT_SCALES.indexOf(current);

      return FONT_SCALES[
        Math.max(index - 1, 0)
      ];
    });
  }, []);

  const resetFont = useCallback(() => {
    setFontScale(1);
  }, []);

  const value = useMemo(() => ({
    theme,
    isLight: theme === "light",
    toggleTheme,
    fontScale,
    increaseFont,
    decreaseFont,
    resetFont
  }), [
    theme,
    toggleTheme,
    fontScale,
    increaseFont,
    decreaseFont,
    resetFont
  ]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
