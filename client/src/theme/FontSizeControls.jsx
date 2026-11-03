
import React from "react";
import { useTheme } from "../theme/ThemeContext";
import "./FontSizeControls.css";

export default function FontSizeControls() {
  const {
    fontScale,
    increaseFont,
    decreaseFont
  } = useTheme();

  return (
    <div className="font-size-controls" aria-label="Acessibilidade: tamanho da fonte">

      <button
        type="button"
        className="font-size-btn"
        onClick={increaseFont}
        disabled={fontScale >= 1.3}
        aria-label="Aumentar tamanho da fonte"
        title="Aumentar fonte"
      >
        A+
      </button>

      <button
        type="button"
        className="font-size-btn"
        onClick={decreaseFont}
        disabled={fontScale <= 0.9}
        aria-label="Diminuir tamanho da fonte"
        title="Diminuir fonte"
      >
        A−
      </button>

    </div>
  );
}
