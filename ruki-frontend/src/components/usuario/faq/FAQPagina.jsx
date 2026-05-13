import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FAQPagina.css';

/*
  Diccionario de datos con iconos
   SVG Nativos Integrados
*/
const faqSections = [
  {
    id: 'cambios',
    label: 'Cambios de Producto',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>,
    items: [
      { question: '¿Puedo cambiar un producto si no me quedó o no me gustó?', answer: 'Sí, tienes un plazo de 30 días corridos desde la emisión de tu boleta. Los cambios se realizan directamente en nuestra tienda física. Dirección: Los Alerces 2131, Ñuñoa, Santiago. Horarios: Lun-Vie (09:00-12:00 y 16:00-20:00) | Sáb (10:00-19:00). No realizamos cambios en días feriados.' },
      { question: '¿En qué condiciones debe estar el producto?', answer: 'Debe estar impecable: sin uso, sin olores (perfume, sudor), sin manchas de maquillaje o desodorante, y libre de pelos de mascotas. Es obligatorio entregar el producto con todas sus etiquetas y envoltorios originales, además de presentar tu boleta o factura.' },
      { question: '¿Qué productos NO tienen cambio?', answer: 'Por higiene, no se aceptan cambios en calcetines, ropa interior, trajes de baño y bikinis. También quedan fuera los productos adquiridos en campañas de promoción o con descuento.' },
      { question: '¿Qué pasa si soy de región?', answer: 'Debes completar el formulario de contacto en nuestra web seleccionando la opción “Cambio”. Una vez aprobado, te enviaremos por mail los pasos a seguir para el envío.' }
    ]
  },
  {
    id: 'envios',
    label: 'Envíos y Seguimiento',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
    items: [
      { question: '¿Cuánto demora en llegar mi pedido?', answer: 'El tiempo de entrega depende de tu ubicación. Generalmente, los despachos en Santiago tardan de 2 a 4 días hábiles, mientras que para regiones el plazo puede variar entre 5 a 10 días hábiles según la provincia.' },
      { question: '¿Cómo puedo hacer seguimiento a mi compra?', answer: 'Una vez que tu pedido sea despachado, recibirás un correo electrónico con el número de seguimiento y el link del transportista para ver el estado de tu paquete en tiempo real.' },
      { question: '¿Qué pasa si no hay nadie en el domicilio al momento de la entrega?', answer: 'La empresa de transporte realizará hasta dos intentos de entrega. Si en ambos casos no hay quien reciba, el paquete volverá a nuestra bodega. En ese caso, deberás gestionar un nuevo envío pagando el costo correspondiente.' }
    ]
  },
  {
    id: 'pagos',
    label: 'Pagos y Facturación',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
    items: [
      { question: '¿Qué métodos de pago aceptan?', answer: 'En nuestra tienda online puedes pagar de forma segura a través de Mercado Pago o Webpay, utilizando tarjetas de débito y crédito, con opción de cuotas según tu banco.' },
      { question: '¿Puedo pedir factura en lugar de boleta?', answer: 'Sí. Al momento de realizar el pago, selecciona la opción de Factura y completa los datos fiscales: RUT, Razón Social, Giro y Dirección. Si se te olvidó, contáctanos de inmediato antes de que el pedido sea procesado.' }
    ]
  },
  {
    id: 'stock',
    label: 'Stock y Productos',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
    items: [
      { question: '¿Los precios de la web son los mismos que en la tienda física?', answer: 'Sí, mantenemos los mismos precios base. Sin embargo, algunas promociones online pueden ser exclusivas de la página web y no aplicar para compras presenciales en Ñuñoa.' },
      { question: '¿Qué pasa si el producto que quiero está agotado?', answer: 'Si un producto no tiene stock, puedes suscribirte en la misma página del artículo dejando tu mail. Te avisaremos automáticamente apenas tengamos reposición (restock).' }
    ]
  },
  {
    id: 'contacto',
    label: 'Contacto',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
    items: []
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function FAQPagina() {
  const defaultSection = useMemo(() => faqSections[0].id, []);
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [openIndex, setOpenIndex] = useState(0);

  const currentSection = faqSections.find((section) => section.id === activeSection) ?? faqSections[0];

  const toggleItem = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <main className="ruki-faq-wrapper" id="faq">
      
      {/* HERO SECTION */}
      <section className="faq-hero-section">
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="faq-hero-content"
        >
            <span className="faq-hero-badge">SOPORTE AL CLIENTE</span>
            <h1 className="faq-hero-title">¿En qué podemos ayudarte?</h1>
            <p className="faq-hero-subtitle">Encuentra respuestas rápidas sobre cambios, envíos, pagos, stock y contacto directo con nuestro equipo.</p>
        </motion.div>
      </section>

      <div className="container pb-5 px-4 px-lg-5">
        
        {/* TABS DE NAVEGACIÓN */}
        <div className="faq-tabs-grid" role="tablist" aria-label="Secciones FAQ">
          {faqSections.map((section) => (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              key={section.id}
              type="button"
              className={`faq-tab-btn ${activeSection === section.id ? 'is-active' : ''}`}
              onClick={() => {
                setActiveSection(section.id);
                setOpenIndex(0);
              }}
              role="tab"
              aria-selected={activeSection === section.id}
            >
              <span className="faq-tab-icon" aria-hidden="true">
                {section.icon}
              </span>
              <span className="faq-tab-label">{section.label}</span>
            </motion.button>
          ))}
        </div>

        {/* PANEL DE CONTENIDO */}
        <motion.div 
            className="faq-content-panel"
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
          {currentSection.id === 'contacto' ? (
            
            /* PÁGINA DE CONTACTO */
            <div className="faq-contact-grid">
              <div className="faq-channel-card">
                <div className="channel-icon-wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <h4>Chat en Vivo</h4>
                <p className="channel-desc">Habla con un asesor de RUKI en tiempo real para resolver tus dudas.</p>
                <button className="channel-btn" type="button" onClick={() => globalThis.location.assign('/chat')}>
                  Iniciar chat
                </button>
                <p className="channel-note">Atención 24/7 mediante bot, asesores en horario hábil.</p>
              </div>

              <div className="faq-channel-card">
                <div className="channel-icon-wrap whatsapp">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </div>
                <h4>WhatsApp</h4>
                <p className="channel-desc">Escríbenos directamente a nuestro WhatsApp oficial.</p>
                <button className="channel-btn outline" type="button" onClick={() => globalThis.open('https://wa.me/56962823706', '_blank', 'noreferrer')}>
                  +56 9 6282 3706
                </button>
                <button className="channel-link-text mt-2" type="button" onClick={async () => {
                    try { await navigator.clipboard.writeText('+56962823706'); alert('Número copiado al portapapeles'); } catch { alert('No se pudo copiar'); }
                }}>
                  Copiar número
                </button>
                <p className="channel-note mt-3">Lun-Vie: 9:00 - 22:00 | Sáb: 9:00 - 14:00</p>
              </div>

              <div className="faq-channel-card">
                <div className="channel-icon-wrap phone">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <h4>Llamada Telefónica</h4>
                <p className="channel-desc">Si prefieres la voz, llámanos a nuestras líneas de soporte.</p>
                <button className="channel-btn outline" type="button" onClick={() => (globalThis.location.href = 'tel:+56227318732')}>
                  227 318 732 (Celular)
                </button>
                <button className="channel-btn outline mt-2" type="button" onClick={() => (globalThis.location.href = 'tel:+566006009999')}>
                  600 600 99 99 (Fijo)
                </button>
                <p className="channel-note mt-3">Mismos horarios que WhatsApp.</p>
              </div>
            </div>

          ) : (
            /* ACORDEÓN DE PREGUNTAS */
            <motion.div className="faq-accordion-list" variants={containerVariants} initial="hidden" animate="visible">
              {currentSection.items.map((item, index) => {
                const isOpen = openIndex === index;

                return (
                  <motion.div variants={itemVariants} className={`faq-accordion-item ${isOpen ? 'is-open' : ''}`} key={index}>
                    <button
                      type="button"
                      className="faq-accordion-trigger"
                      onClick={() => toggleItem(index)}
                      aria-expanded={isOpen}
                    >
                      <span className="faq-question-text">{item.question}</span>
                      <motion.span 
                          className="faq-plus-icon"
                          animate={{ rotate: isOpen ? 45 : 0 }}
                          transition={{ duration: 0.2 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </motion.span>
                    </button>
                    
                    <AnimatePresence initial={false}>
                        {isOpen && (
                            <motion.div 
                                className="faq-accordion-content"
                                initial="collapsed"
                                animate="open"
                                exit="collapsed"
                                variants={{
                                    open: { opacity: 1, height: "auto", marginTop: 16 },
                                    collapsed: { opacity: 0, height: 0, marginTop: 0 }
                                }}
                                transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                            >
                                <p>{item.answer}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* SECCIÓN LEGAL */}
        <div className="faq-legal-section">
          <div className="faq-legal-card" id="devolucion">
            <span className="faq-legal-badge">POLÍTICA</span>
            <h3>Devoluciones y Cambios</h3>
            <p>Los cambios se gestionan dentro de los 30 días corridos desde la boleta, en tienda física, con el producto en perfecto estado y sus etiquetas originales.</p>
          </div>

          <div className="faq-legal-card" id="terminos">
            <span className="faq-legal-badge">LEGAL</span>
            <h3>Términos y Condiciones</h3>
            <p>Al comprar en nuestro sitio aceptas las condiciones generales de venta, disponibilidad, promociones, medios de pago y validación de datos de facturación.</p>
          </div>
        </div>
        
      </div>
    </main>
  );
}