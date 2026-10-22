import React, {useEffect} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import BeautyMarquee from "./components/BeautyMarquee";
import Services from "./components/Services";
import AboutSection from "./components/Sobre";
import ProdutosSection from "./components/ProdutosHome";
// import Testimonials from "./components/Avaliacoes";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FloatingSocials from "./components/IconeFlutuante";
import Courses from "./components/Courses";
import PromocoesSection from "./components/Promocao";

import Login from "./components/cliente/Login";
import Cadastro from "./components/cliente/Cadastro";
import ClientDashboard from "./components/cliente/ClienteDashboard";

import { AuthProvider } from "./components/admin/AuthContext";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminAgenda from "./components/admin/AdminAgenda";
import AdminLayout from "./components/admin/AdminLayout";
import AdminClientes from "./components/admin/AdminClientes";
import AdminProdutos from "./components/admin/AdminProdutos";
import AdminConfiguracoes from "./components/admin/AdminConfiguracoes";

// URL constante do Booksy
const BOOKSY_URL =
  "https://booksy.com/pt-br/390978_nicolle-neris-studio-cilios-sobrancelhas-e-unhas-zona-leste-vila-re_sobrancelhas-cilios_1047773_sao-paulo?utm_source=ig&utm_medium=social&utm_content=link_in_bio";

// Componente auxiliar para redirecionamento externo
function RedirectExternal({ url }) {
  useEffect(() => {
    window.location.href = url;
  }, [url]);

  return null;
}

function HomePage() {
  return (
    <main className="home">
      <Navbar />
      <Hero />
      <BeautyMarquee />
      <Services />
      <PromocoesSection />
      <AboutSection />
      <ProdutosSection />
      {/* <Testimonials /> */}
      <Contact />
      <div className="section-divider"></div>
      <Footer />
      <FloatingSocials />
    </main>
  );
}

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/minha-conta" element={<ClientDashboard />} />

          {/* Rotas de Agendamento Booksy */}
          <Route
            path="/agendar"
            element={<RedirectExternal url={BOOKSY_URL} />}
          />
          <Route
            path="/booksy"
            element={<RedirectExternal url={BOOKSY_URL} />}
          />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/agenda" element={<AdminAgenda />} />
            <Route path="/admin/clientes" element={<AdminClientes />} />
            <Route path="/admin/produtos" element={<AdminProdutos />} />
            <Route
              path="/admin/configuracoes"
              element={<AdminConfiguracoes />}
            />
          </Route>

          {/* Mantém links antigos funcionando */}
          <Route
            path="/adm/login"
            element={<Navigate to="/admin/login" replace />}
          />
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
