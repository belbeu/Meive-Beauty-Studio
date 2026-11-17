// Salvar como: src/components/cliente/EstrelasNota.jsx
import { useRef, useState } from "react";
import { ROTULOS_NOTA } from "../../services/avaliacaoService";

function Estrela({ cheia }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill={cheia ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
    </svg>
  );
}

// Seletor de nota (1 a 5 estrelas). Funciona com mouse, toque e teclado (setas).
export default function EstrelasNota({ valor, onChange, desabilitado = false, invalido = false, descricaoId }) {
  const [passando, setPassando] = useState(0);
  const botoes = useRef([]);
  const mostrada = passando || valor;

  function escolher(n) {
    onChange(n);
    botoes.current[n - 1]?.focus();
  }

  function aoTeclar(evento) {
    if (evento.key === "ArrowRight" || evento.key === "ArrowUp") {
      evento.preventDefault();
      escolher(Math.min(5, (valor || 0) + 1));
    } else if (evento.key === "ArrowLeft" || evento.key === "ArrowDown") {
      evento.preventDefault();
      escolher(Math.max(1, (valor || 1) - 1));
    }
  }

  return (
    <div className="aval-nota">
      <div
        id="aval-nota"
        className="aval-estrelas"
        role="radiogroup"
        aria-label="Nota de 1 a 5 estrelas"
        aria-invalid={invalido}
        aria-describedby={descricaoId}
        onMouseLeave={() => setPassando(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            ref={(el) => {
              botoes.current[n - 1] = el;
            }}
            aria-checked={valor === n}
            aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"} - ${ROTULOS_NOTA[n - 1]}`}
            tabIndex={valor === n || (!valor && n === 1) ? 0 : -1}
            disabled={desabilitado}
            className={`aval-estrela${n <= mostrada ? " aval-estrela--ativa" : ""}`}
            onClick={() => escolher(n)}
            onMouseEnter={() => setPassando(n)}
            onKeyDown={aoTeclar}
          >
            <Estrela cheia={n <= mostrada} />
          </button>
        ))}
      </div>
      <span className="aval-nota-texto">
        {mostrada ? ROTULOS_NOTA[mostrada - 1] : "Toque nas estrelas para dar sua nota"}
      </span>
    </div>
  );
}

// Estrelas só para exibir uma nota já dada.
export function EstrelasLeitura({ nota }) {
  return (
    <span className="aval-leitura" role="img" aria-label={`Nota ${nota} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`aval-leitura-estrela${n <= nota ? " aval-leitura-estrela--ativa" : ""}`}>
          <Estrela cheia={n <= nota} />
        </span>
      ))}
    </span>
  );
}
