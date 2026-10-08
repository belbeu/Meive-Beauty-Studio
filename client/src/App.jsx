import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import BeautyMarquee from "./components/BeautyMarquee";
import Services from "./components/Services";
import AboutSection from "./components/Sobre";
import ProdutosSection from "./components/ProdutosHome";
import Testimonials from "./components/Avaliacoes"; 
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FloatingSocials from "./components/IconeFlutuante"; 
import PromocoesSection from "./components/Promocao"; // Importando a seção de promoções
// Importa corretamente o Courses da pasta components
import Courses from "./components/Courses"; 

function HomePage() {
  return (
    <main className="home">
      <Navbar />
      <Hero />
      <BeautyMarquee />
      <Services />
      <PromocoesSection/>
      <AboutSection />
      <ProdutosSection />
      <Testimonials />
      <Contact />

      <div className="section-divider"></div>
      <Footer />
      <FloatingSocials />
    </main>
  );
}

export default function App() {
  return (
    <Router basename="/Meive-Beauty-Studio">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<Courses />} />
      </Routes>
    </Router>
  );
}