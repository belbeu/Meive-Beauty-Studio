import React from "react";
import { Link } from "react-router-dom";
import "./Courses.css";

// Dados divididos por categorias
const categoriesData = [
  {
    categoryTitle: "TÉCNICAS DE ALONGAMENTO",
    courses: [
      {
        id: "01",
        tag: "MAIS PROCURADO",
        title: "FIO A FIO",
        description: "O curso de extensão de cílios fio a fio ensina a técnica de aplicar um fio sintético em cada cílio natural do cliente, com foco em segurança, simetria e durabilidade.",
        price: "R$ 1500",
        duration: "20h",
      },
      {
        id: "02",
        tag: null,
        title: "VOLUME RUSSO",
        description: "Montagem de leques artesanais contendo de 3 a 10 fios ultrafinos aplicados em cada cílio natural.",
        price: "R$ 1800",
        duration: "30h",
      },
      {
        id: "03",
        tag: null,
        title: "LASH LIFTING",
        description: "O curso ensina a aplicar uma química suave que altera a estrutura do fio natural, curvando-o desde a raiz.",
        price: "R$ 2300",
        duration: "28h",
      },
      {
        id: "04",
        tag: null,
        title: "MEGA VOLUME",
        description: "Uma evolução do Volume Russo, onde são aplicados fans com 10 a 20 fios extremamente finos e leves.",
        price: "R$ 2000",
        duration: "30h",
      },
    ],
  },
  {
    categoryTitle: "NEGÓCIOS E CLIENTELA",
    courses: [
      {
        id: "05",
        tag: "NOVO",
        title: "AGENDA LOTADA",
        description: "Posicionamento, conteúdo e estratégias de vendas para construir uma clientela fiel e faturar mais.",
        price: "R$ 900",
        duration: "10h",
      },
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="services-page-container">
      <div className="services-page-nav-bar">
        <Link to="/" className="back-home-btn">← Voltar ao Início</Link>
      </div>

      <section className="services-section">
        <div className="services-header-container">
          <div className="services-titles">
            <span className="services-subtitle">MEIVE BEAUTY STUDIO</span>
            <h2 className="services-title">CURSOS PROFISSIONAIS</h2>
          </div>
          <p className="services-top-note">
            Os cursos profissionais de formação para Lash Designers (design de cílios) ensinam desde a anatomia do olho até técnicas complexas de colagem e visagismo.
          </p>
        </div>

        {/* Mapeia cada categoria */}
        {categoriesData.map((category, index) => (
          // Ajustado o marginBottom para 30px para aproximar do próximo bloco
          <div key={index} className="course-category-block" style={{ marginBottom: "30px" }}>
            
            {/* Título da Categoria */}
            <h3 style={{ 
              fontFamily: "'Bebas Neue', sans-serif", 
              fontSize: "32px", 
              color: "#ffffff", 
              letterSpacing: "1px", 
              marginBottom: "25px",
              borderLeft: "4px solid #ad1838",
              paddingLeft: "12px"
            }}>
              {category.categoryTitle}
            </h3>

            {/* Grid dos cards daquela categoria específica */}
            <div className="services-grid">
              {category.courses.map((service) => (
                <div key={service.id} className="service-card">
                  <div className="service-card-top">
                    {service.tag && <span className="service-tag">{service.tag}</span>}
                    <span className="service-number">{service.id}</span>
                  </div>

                  <div className="service-info">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>

                  <div className="service-footer">
                    <strong className="service-price">{service.price}</strong>
                    <span className="service-duration">{service.duration}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </section>
      <div style={{ width: "100%", padding: "0 5%", boxSizing: "border-box" }}>
        <hr style={{ 
          border: "none", 
          height: "1px", 
          backgroundColor: "rgba(255, 255, 255, 0.1)", 
          margin: "10px 0 40px 0" 
        }} />
      </div>

      {/* SECÇÃO DO KIT / MATERIAIS (BASEADA NA IMAGEM) */}
      <section style={{ padding: "40px 5%", maxWidth: "1300px", margin: "0 auto" }}>
        {/* Cabeçalho da Secção com texto descritivo à direita */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "40px",
          alignItems: "end",
          marginBottom: "50px"
        }}>
          <div>
            <span style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              letterSpacing: "4px",
              color: "#ad1838",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "20px"
            }}>
              <span style={{ display: "inline-block", width: "30px", height: "1px", backgroundColor: "#ad1838" }}></span>
              PREPARADA PARA COMEÇAR
            </span>

            <h2 style={{
              display: "flex",
              flexDirection: "column",
              margin: "0",
              padding: "0",
              lineHeight: "0.9",
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: "72px",
            }}>
              <span style={{ color: "#ffffff", letterSpacing: "3px", margin: "0 0 -5px 0" }}>SEU KIT.</span>
              <span style={{ color: "#ffffff", letterSpacing: "3px", margin: "0 0 -5px 0" }}>SEU COMEÇO.</span>
              <span style={{ color: "#ad1838", letterSpacing: "3px", margin: "0" }}>SUA ARTE.</span>
            </h2>
          </div>

          <div>
            <p style={{ color: "#cccccc", fontSize: "15px", lineHeight: "1.6", margin: "0 0 10px 0" }}>
              Você recebe os materiais essenciais para acompanhar a aula, praticar a técnica e dar os primeiros passos com segurança.
            </p>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "1px", color: "#ad1838", textTransform: "uppercase", fontWeight: "600" }}>
              Exemplo · Curso Lash Boss
            </span>
          </div>
        </div>

        {/* Corpo: Duas colunas (Caixa Esquerda com Moldura + Lista de 6 Itens à Direita) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          alignItems: "stretch"
        }}>
          
          {/* Coluna Esquerda: Caixa preta com simulação do kit */}
          <div style={{
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backgroundColor: "rgba(20, 20, 20, 0.5)",
            padding: "30px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            minHeight: "450px"
          }}>
            <span style={{ fontSize: "10px", letterSpacing: "3px", color: "#666666", textTransform: "uppercase", fontWeight: "600" }}>
              Kit Inicial Meive
            </span>

            {/* Ilustração Estilizada da Caixa do Kit */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 0" }}>
              <div style={{
                backgroundColor: "#161616",
                border: "1px solid rgba(255,255,255,0.08)",
                width: "100%",
                maxWidth: "380px",
                padding: "30px 25px",
                position: "relative",
                boxShadow: "0 15px 30px rgba(0,0,0,0.5)"
              }}>
                {/* Tampa vermelha da caixa */}
                <div style={{
                  backgroundColor: "#8a162b",
                  padding: "15px",
                  textAlign: "center",
                  marginBottom: "25px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
                }}>
                  <h4 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: "28px", color: "#ffffff", letterSpacing: "3px", margin: 0 }}>
                    MEIVE
                  </h4>
                  <span style={{ fontSize: "8px", letterSpacing: "2px", color: "#f0f0f0", textTransform: "uppercase" }}>
                    Academy Kit
                  </span>
                </div>

                {/* Conteúdo figurativo dentro da caixa */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "120px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <div style={{ width: "2px", height: "60px", backgroundColor: "#cccccc", transform: "rotate(15deg)" }}></div>
                    <div style={{ width: "2px", height: "60px", backgroundColor: "#cccccc", transform: "rotate(-10deg)" }}></div>
                  </div>
                  
                  {/* Bloco de notas/apostila miniatura */}
                  <div style={{ backgroundColor: "#ffffff", padding: "10px", width: "110px", height: "70px", opacity: "0.9" }}>
                    <div style={{ height: "4px", backgroundColor: "#333", width: "40%", marginBottom: "8px" }}></div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      <div style={{ height: "2px", backgroundColor: "#888", width: "100%" }}></div>
                      <div style={{ height: "2px", backgroundColor: "#888", width: "100%" }}></div>
                      <div style={{ height: "2px", backgroundColor: "#888", width: "80%" }}></div>
                    </div>
                  </div>

                  {/* Frasco/Pinças miniatura */}
                  <div style={{ width: "22px", height: "35px", backgroundColor: "#ad1838", borderRadius: "3px" }}></div>
                  <div style={{ display: "flex", gap: "3px" }}>
                    <div style={{ width: "3px", height: "30px", backgroundColor: "#8a2be2" }}></div>
                    <div style={{ width: "3px", height: "30px", backgroundColor: "#8a2be2" }}></div>
                    <div style={{ width: "3px", height: "30px", backgroundColor: "#8a2be2" }}></div>
                  </div>
                </div>
              </div>
            </div>

            <span style={{ fontSize: "11px", color: "#777777", textAlign: "center", fontStyle: "italic" }}>
              Imagem ilustrativa do kit de formação.
            </span>
          </div>

          {/* Coluna Direita: Lista dos 6 Itens com Moldura */}
          <div style={{
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backgroundColor: "rgba(20, 20, 20, 0.5)",
            padding: "30px 35px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "18px" }}>
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: "26px", color: "#ad1838", lineHeight: "1" }}>01</span>
                <div>
                  <h4 style={{ color: "#ffffff", fontSize: "15px", marginBottom: "4px", fontWeight: "600" }}>Kit de pinças</h4>
                  <p style={{ color: "#999999", fontSize: "13px", margin: 0, lineHeight: "1.4" }}>Pinça de isolamento e pinça de volume para a prática em aula.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "18px" }}>
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: "26px", color: "#ad1838", lineHeight: "1" }}>02</span>
                <div>
                  <h4 style={{ color: "#ffffff", fontSize: "15px", marginBottom: "4px", fontWeight: "600" }}>Fios para extensão</h4>
                  <p style={{ color: "#999999", fontSize: "13px", margin: 0, lineHeight: "1.4" }}>Bandejas selecionadas para treinar as técnicas apresentadas.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "18px" }}>
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: "26px", color: "#ad1838", lineHeight: "1" }}>03</span>
                <div>
                  <h4 style={{ color: "#ffffff", fontSize: "15px", marginBottom: "4px", fontWeight: "600" }}>Adesivo e acessórios</h4>
                  <p style={{ color: "#999999", fontSize: "13px", margin: 0, lineHeight: "1.4" }}>Itens essenciais para preparação, aplicação e acabamento.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "18px" }}>
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: "26px", color: "#ad1838", lineHeight: "1" }}>04</span>
                <div>
                  <h4 style={{ color: "#ffffff", fontSize: "15px", marginBottom: "4px", fontWeight: "600" }}>Apostila exclusiva</h4>
                  <p style={{ color: "#999999", fontSize: "13px", margin: 0, lineHeight: "1.4" }}>Conteúdo técnico organizado para consultar durante e depois do curso.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "18px" }}>
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: "26px", color: "#ad1838", lineHeight: "1" }}>05</span>
                <div>
                  <h4 style={{ color: "#ffffff", fontSize: "15px", marginBottom: "4px", fontWeight: "600" }}>Material de mapping</h4>
                  <p style={{ color: "#999999", fontSize: "13px", margin: 0, lineHeight: "1.4" }}>Fichas e exercícios para planejar efeitos personalizados.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: "26px", color: "#ad1838", lineHeight: "1" }}>06</span>
                <div>
                  <h4 style={{ color: "#ffffff", fontSize: "15px", marginBottom: "4px", fontWeight: "600" }}>Suporte pós-curso</h4>
                  <p style={{ color: "#999999", fontSize: "13px", margin: 0, lineHeight: "1.4" }}>Canal para dúvidas durante seus primeiros passos na profissão.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* DIVISÓRIA MINIMALISTA E ELEGANTE */}
      <div style={{ width: "100%", padding: "0 5%", boxSizing: "border-box" }}>
        <hr style={{ 
          border: "none", 
          height: "1px", 
          backgroundColor: "rgba(255, 255, 255, 0.1)", 
          margin: "10px 0 40px 0" 
        }} />
      </div>

      <section className="testimonials-section" style={{ paddingTop: "0px" }}>
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            marginBottom: "40px",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              letterSpacing: "4px",
              color: "#ad1838",
              fontWeight: "600",
              marginBottom: "15px",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
          >
            QUEM APRENDEU COM A MEIVE
          </span>
          <h2
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              margin: "0",
              padding: "0",
              lineHeight: "0.9",
            }}
          >
            <span
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: "78px",
                color: "#ffffff",
                margin: "0 0 -5px 0",
                letterSpacing: "4px",
              }}
            >
              ELAS COMEÇARAM.
            </span>

            <span
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: "85px",
                color: "#ad1838",
                margin: "0 0 -5px 0",
                letterSpacing: "1px",
                letterSpacing: "6px",
              }}
            >
              E NÃO PARARAM.
            </span>
          </h2>
        </div>

        <div className="testimonials-grid">
          {/* Card 1 */}
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">
              “Eu cheguei sem experiência e saí segura para atender minhas primeiras clientes. A didática e o suporte fizeram toda a diferença.”
            </p>
            <div className="testimonial-author">
              <span className="author-avatar">A</span>
              <span className="author-name">Ana Paula M.</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">
              “Finalmente consegui criar fans mais leves e simétricos. Minha retenção melhorou e hoje consigo cobrar com mais confiança.”
            </p>
            <div className="testimonial-author">
              <span className="author-avatar">B</span>
              <span className="author-name">Bruna L.</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">
              “Organizei meu posicionamento, comecei a mostrar melhor meu trabalho e vi minha agenda ganhar movimento de verdade.”
            </p>
            <div className="testimonial-author">
              <span className="author-avatar">L</span>
              <span className="author-name">Larissa C.</span>
            </div>
          </div>
        </div>
        
        
      </section>
      <div style={{ width: "100%", padding: "0 5%", boxSizing: "border-box", marginTop: "40px" }}>
        <hr style={{ 
          border: "none", 
          height: "1px", 
          backgroundColor: "rgba(255, 255, 255, 0.1)", 
          margin: "10px 0 40px 0" 
        }} />
      </div>
      <section style={{ padding: "40px 5%", maxWidth: "1300px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "50px",
          alignItems: "center",
          "@media (max-width: 900px)": { gridTemplateColumns: "1fr" }
        }}>
          
          
          {/* Lado Esquerdo: Textos e Tópicos */}
          <div>
            <span style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              letterSpacing: "4px",
              color: "#ad1838",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "20px"
            }}>
              
              <span style={{ display: "inline-block", width: "30px", height: "1px", backgroundColor: "#ad1838" }}></span>
              SUA CONQUISTA, REGISTRADA
            </span>

            <h2 style={{
              display: "flex",
              flexDirection: "column",
              margin: "0 0 20px 0",
              padding: "0",
              lineHeight: "0.9",
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: "72px",
            }}>
              <span style={{ color: "#ffffff", letterSpacing: "3px", margin: "0 0 -5px 0" }}>APRENDEU.</span>
              <span style={{ color: "#ffffff", letterSpacing: "3px", margin: "0 0 -5px 0" }}>PRATICOU.</span>
              <span style={{ color: "#ad1838", letterSpacing: "3px", margin: "0" }}>CONQUISTOU.</span>
            </h2>

            <p style={{ color: "#cccccc", fontSize: "15px", lineHeight: "1.6", marginBottom: "40px", maxWidth: "500px" }}>
              Ao concluir sua formação, você recebe o Certificado Meive Beauty Studio com identificação do curso e carga horária.
            </p>

            {/* Lista dos 3 tópicos */}
            <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: "28px", color: "#ad1838", lineHeight: "1" }}>01</span>
                <div>
                  <h4 style={{ color: "#ffffff", fontSize: "16px", marginBottom: "5px", fontWeight: "600" }}>Certificado de conclusão</h4>
                  <p style={{ color: "#999999", fontSize: "13px", margin: 0, lineHeight: "1.4" }}>Um registro da sua jornada e das habilidades desenvolvidas no curso.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: "28px", color: "#ad1838", lineHeight: "1" }}>02</span>
                <div>
                  <h4 style={{ color: "#ffffff", fontSize: "16px", marginBottom: "5px", fontWeight: "600" }}>Versão digital</h4>
                  <p style={{ color: "#999999", fontSize: "13px", margin: 0, lineHeight: "1.4" }}>Pronta para compartilhar nas redes sociais e adicionar ao seu portfólio.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: "28px", color: "#ad1838", lineHeight: "1" }}>03</span>
                <div>
                  <h4 style={{ color: "#ffffff", fontSize: "16px", marginBottom: "5px", fontWeight: "600" }}>Identificação individual</h4>
                  <p style={{ color: "#999999", fontSize: "13px", margin: 0, lineHeight: "1.4" }}>Emitido com o nome da aluna, curso realizado, data e carga horária.</p>
                </div>
              </div>
            </div>
          </div>
          

          <div style={{ position: "relative", display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <div style={{
              backgroundColor: "#f4f0ec",
              width: "100%",
              maxWidth: "680px", // Aumentado para simular o formato largo A4
              padding: "35px 45px", // Mais esticado nas laterais
              boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
              border: "1px solid #dcd6ce",
              position: "relative",
              transform: "rotate(1.5deg)",
              borderRadius: "2px"
            }}>
              {/* Badge Modelo Ilustrativo */}
              <div style={{
                position: "absolute",
                top: "-12px",
                right: "25px",
                backgroundColor: "#ad1838",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "1.5px",
                padding: "4px 10px",
                textTransform: "uppercase"
              }}>
                Modelo Ilustrativo
              </div>

              {/* Borda interna dupla do certificado A4 */}
              <div style={{ border: "1.5px solid #ad1838", padding: "20px", textAlign: "center" }}>
                <div style={{ border: "0.5px solid #ad1838", padding: "20px" }}>
                  
                  <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: "26px", color: "#111111", letterSpacing: "2px", margin: "0 0 2px 0" }}>
                    MEIVE <span style={{ fontSize: "11px", fontFamily: "Inter, sans-serif", fontWeight: "300", letterSpacing: "1px", color: "#666666" }}>BEAUTY STUDIO</span>
                  </h3>
                  
                  <p style={{ fontSize: "9px", letterSpacing: "2.5px", color: "#ad1838", textTransform: "uppercase", marginBottom: "20px", fontWeight: "600" }}>
                    Certificado de Conclusão
                  </p>

                  <p style={{ fontSize: "10px", color: "#555555", marginBottom: "8px", fontStyle: "italic" }}>
                    Certificamos que
                  </p>

                  <h4 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: "34px", color: "#111111", letterSpacing: "2px", margin: "0 0 12px 0", borderBottom: "1px solid #dcd6ce", paddingBottom: "3px", display: "inline-block", minWidth: "260px" }}>
                    NOME DA ALUNA
                  </h4>

                  <p style={{ fontSize: "10px", color: "#555555", marginBottom: "10px" }}>
                    concluiu com excelência o curso
                  </p>

                  <h5 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: "20px", color: "#ad1838", letterSpacing: "1px", margin: "0 0 25px 0" }}>
                    LASH BOSS: DO ZERO AO PRO
                  </h5>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "15px", paddingTop: "12px", borderTop: "1px dotted #ccc", fontSize: "9px", color: "#777777" }}>
                    <div style={{ textAlign: "left", width: "120px", borderBottom: "1px solid #bbb", paddingBottom: "2px" }}>
                      <span>DATA</span>
                    </div>
                    
                    {/* Selo redondo central */}
                    <div style={{
                      width: "40px",
                      height: "40px",
                      border: "1px solid #ad1838",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "6.5px",
                      color: "#ad1838",
                      fontWeight: "bold",
                      textAlign: "center",
                      lineHeight: "1",
                      padding: "2px"
                    }}>
                      MEIVE CERTIFIED
                    </div>

                    <div style={{ textAlign: "right", width: "120px", borderBottom: "1px solid #bbb", paddingBottom: "2px" }}>
                      <span>ASSINATURA</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}