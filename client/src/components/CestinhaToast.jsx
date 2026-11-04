// src/components/CestinhaToast.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./CestinhaToast.css";

export default function CestinhaToast({ produtoNome, onClose }) {
  const navigate = useNavigate();

  return (
    <div className="cestinha-toast-overlay">
      <div className="cestinha-toast-card">
        <div className="cestinha-toast-icon">✨</div>
        <div className="cestinha-toast-body">
          <strong>Adicionado à cestinha!</strong>
          <p>{produtoNome} foi incluído com sucesso.</p>
        </div>
        <div className="cestinha-toast-actions">
          <button 
            className="cestinha-toast-btn-ver" 
            onClick={() => {
              onClose();
              const token = localStorage.getItem("access");
              // Se estiver logada, vai direto para a cestinha dela. Se não, vai para o login.
              if (token) {
                navigate("/cestinha");
              } else {
                navigate("/login");
              }
            }}
          >
            VER ITENS &rarr;
          </button>
          <button className="cestinha-toast-btn-fechar" onClick={onClose}>
            &times;
          </button>
        </div>
      </div>
    </div>
  );
}