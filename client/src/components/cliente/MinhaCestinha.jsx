// Salvar como: src/components/cliente/MinhaCestinha.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cestinhaService } from "../../services/cestinhaService";
import ClientNavbar from "./ClientNavbar";
import "./MinhaCestinha.css";

export default function MinhaCestinha() {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  useEffect(() => {
    carregarCestinha();
  }, [token]);

  const carregarCestinha = async () => {
    setCarregando(true);
    if (token) {
      try {
        const dados = await cestinhaService.getItensAPI();
        setItens(dados);
      } catch (err) {
        console.error("Erro ao buscar cestinha da API", err);
      }
    } else {
      setItens(cestinhaService.getItensLocais());
    }
    setCarregando(false);
  };

  const handleRemover = async (item) => {
    if (token) {
      await cestinhaService.removerItemAPI(item.id_cestinha);
    } else {
      cestinhaService.removerItemLocal(item.id_produto);
    }
    carregarCestinha();
  };

  const calcularTotal = () => {
    return itens.reduce((acc, item) => {
      const preco = parseFloat(item.produto?.preco || 0);
      return acc + preco * item.quantidade;
    }, 0);
  };

  if (carregando) {
    return (
      <div className="dashboard-cestinha-page">
        <ClientNavbar />
        <div className="cestinha-loading">Carregando sua cestinha...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-cestinha-page">
      <ClientNavbar />
      <div className="dashboard-cestinha-container">
        <h2>Sua Cestinha de Interesse</h2>
        <p className="cestinha-subtitle">Gerencie os itens escolhidos para a sua tierlist de beleza.</p>

        {itens.length === 0 ? (
          <div className="cestinha-vazia">
            <p>Sua cestinha está vazia no momento.</p>
            <Link to="/minha-conta/produtos" className="client-primary-btn" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginTop: "20px", textDecoration: "none", height: "48px", padding: "0 28px", color: "#ffffff" }}>
              VER PRODUTOS
            </Link>
          </div>
        ) : (
          <div className="cestinha-content">
            <div className="cestinha-lista-wrapper">
              <div className="cestinha-lista">
                {itens.map((item) => (
                  <div key={item.id_cestinha || item.id_produto} className="cestinha-item-card">
                    <img 
                      src={item.produto?.imagem_url || ""} 
                      alt={item.produto?.nome} 
                      className="cestinha-item-img"
                    />
                    <div className="cestinha-item-info">
                      <h4>{item.produto?.nome}</h4>
                      <span className="cestinha-item-cat">{item.produto?.categoria}</span>
                      <span className="cestinha-item-preco">R$ {item.produto?.preco}</span>
                    </div>
                    <div className="cestinha-item-acoes">
                      <span>Qtd: {item.quantidade}</span>
                      <button 
                        className="btn-remover-item" 
                        onClick={() => handleRemover(item)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão para adicionar mais produtos abaixo da lista */}
              <div style={{ marginTop: "20px" }}>
                <Link 
                  to="/minha-conta/produtos" 
                  className="client-outline-btn" 
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", width: "100%", height: "46px", boxSizing: "border-box" }}
                >
                  + ADICIONAR MAIS PRODUTOS
                </Link>
              </div>
            </div>

            <div className="cestinha-resumo">
              <h3>Resumo do Pedido</h3>
              <div className="resumo-linha">
                <span>Total Estimado:</span>
                <strong>R$ {calcularTotal().toFixed(2)}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}