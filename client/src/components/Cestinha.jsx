// Salvar como: src/components/Cestinha.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { cestinhaService } from "../services/cestinhaService";
import "./Cestinha.css";

export default function Cestinha() {
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

  return (
    <>
      <Navbar />
      <main className="cestinha-page-container">
        <div className="cestinha-header">
          <h2>SUA CESTINHA DE INTERESSE</h2>
          <p>Gerencie os itens escolhidos para a sua tierlist de beleza.</p>
        </div>

        {!token && itens.length > 0 && (
          <div className="cestinha-aviso-login">
            <p>🔒 Você está visualizando uma cestinha temporária.</p>
            <button onClick={() => navigate("/login")} className="btn-ir-login">
              Fazer Login / Criar Conta para Salvar
            </button>
          </div>
        )}

        {carregando ? (
          <div className="cestinha-loading">Carregando...</div>
        ) : itens.length === 0 ? (
          <div className="cestinha-vazia">
            <p>Sua cestinha está vazia.</p>
            <Link to="/produtos" className="btn-voltar-loja">Ver Produtos</Link>
          </div>
        ) : (
          <div className="cestinha-content">
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
                    <button className="btn-remover-item" onClick={() => handleRemover(item)}>
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cestinha-resumo">
              <h3>Resumo</h3>
              <div className="resumo-linha">
                <span>Total Estimado:</span>
                <strong>R$ {calcularTotal().toFixed(2)}</strong>
              </div>
              <button 
                className="btn-finalizar-interesse"
                onClick={() => {
                  if (!token) {
                    alert("Por favor, faça login para continuar.");
                    navigate("/login");
                  } else {
                    alert("Solicitação enviada com sucesso!");
                  }
                }}
              >
                SOLICITAR COMPRA / CONTATO
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}