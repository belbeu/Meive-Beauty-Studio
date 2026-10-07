import React from "react";
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


function App() {
  return (
    <main className="home">
      <Navbar />
      <Hero />
      <BeautyMarquee />
      <Services />
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

export default App;