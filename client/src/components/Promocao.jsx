import React, { useEffect, useState } from "react";
import { api } from "../api";
import "./Promocao.css";

const PHONE_NUMBER = "5511944874969";
const moeda = (valor) => Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

export default function PromocoesSection() {
  const [promocoes, setPromocoes] = useState([]);

  useEffect(() => {
    let ativa = true;
    api("/promocoes/")
      .then((dados) => { if (ativa) setPromocoes(Array.isArray(dados) ? dados : dados.results || []); })
      .catch((error) => console.error("Não foi possível carregar as promoções:", error));
    return () => { ativa = false; };
  }, []);

  if (promocoes.length === 0) return null;

  return (
    <section id="promocoes" className="promo-section">
      <div className="promo-header">
        <span className="promo-subtitle">OFERTAS ESPECIAIS</span>
        <h2 className="promo-title">PROMOÇÕES DO MÊS</h2>
      </div>
      <div className="promo-grid">
        {promocoes.map((promo) => {
          const mensagem = `Olá! Gostaria de aproveitar a promoção *${promo.titulo}* por *${moeda(promo.preco_promocional)}* (${promo.validade || "consulte as condições"}). Como faço para agendar?`;
          const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(mensagem)}`;
          return (
            <article key={promo.id_promocao} className={`promo-card ${promo.destaque ? "highlighted" : ""}`}>
              {promo.destaque && <div className="promo-badge">Mais Popular</div>}
              <div className="promo-content">
                <h3>{promo.titulo}</h3>
                <p>{promo.descricao}</p>
                <div className="promo-pricing">
                  <span className="promo-old-price">{moeda(promo.preco_original)}</span>
                  <span className="promo-new-price">{moeda(promo.preco_promocional)}</span>
                </div>
                {promo.validade && <span className="promo-validity">{promo.validade}</span>}
              </div>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="promo-btn">Agendar Agora!</a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
