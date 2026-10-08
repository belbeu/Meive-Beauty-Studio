import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import BeautyMarquee from "./components/BeautyMarquee";
import Services from "./components/Services";
import AboutSection from "./components/Sobre";
import ProdutosSection from "./components/ProdutosHome";
// import Testimonials from "./components/Avaliacoes"; // <-- CERTIFIQUE-SE DE QUE ESTA LINHA EXISTE
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FloatingSocials from "./components/IconeFlutuante"; 
import Courses from "./components/Courses"; 
import PromocoesSection from "./components/Promocao";

function HomePage() {
  return (
    <main className="home">
      <Navbar />
      <Hero />
      <BeautyMarquee />
      <Services />
      <AboutSection />
      <ProdutosSection />
      {/* <Testimonials /> <-- ELA É USADA AQUI */}
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