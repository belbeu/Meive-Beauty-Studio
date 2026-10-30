import React, { useState } from "react";

// Foto do produto. Se não houver imagem ou o link estiver quebrado, não mostra nada
// e o fundo do cartão (com a marca em marca-d'água) aparece no lugar.
export default function FotoProduto({ src, alt }) {
  const [falhou, setFalhou] = useState(false);

  if (!src || falhou) return null;
  return <img src={src} alt={alt} loading="lazy" onError={() => setFalhou(true)} />;
}