import React, { useMemo, useState } from 'react'
import './FAQPagina.css'

const faqSections = [
  {
    id: 'cambios',
    label: 'Cambios de Producto',
    icon: '🔄',
    items: [
      {
        question: '¿Puedo cambiar un producto si no me quedó o no me gustó?',
        answer:
          'Sí, tienes un plazo de 30 días corridos desde la emisión de tu boleta. Los cambios se realizan directamente en nuestra tienda física. Dirección: Los Alerces 2131, Ñuñoa, Santiago. Horarios: Lun-Vie (09:00-12:00 y 16:00-20:00) | Sáb (10:00-19:00). No realizamos cambios en días feriados.'
      },
      {
        question: '¿En qué condiciones debe estar el producto?',
        answer:
          'Debe estar impecable: sin uso, sin olores (perfume, sudor), sin manchas de maquillaje o desodorante, y libre de pelos de mascotas. Es obligatorio entregar el producto con todas sus etiquetas y envoltorios originales, además de presentar tu boleta o factura.'
      },
      {
        question: '¿Qué productos NO tienen cambio?',
        answer:
          'Por higiene, no se aceptan cambios en calcetines, ropa interior, trajes de baño y bikinis. También quedan fuera los productos adquiridos en campañas de promoción o con descuento.'
      },
      {
        question: '¿Qué pasa si soy de región?',
        answer:
          'Debes completar el formulario de contacto en nuestra web seleccionando la opción “Cambio”. Una vez aprobado, te enviaremos por mail los pasos a seguir para el envío.'
      }
    ]
  },
  {
    id: 'envios',
    label: 'Envíos y Seguimiento',
    icon: '📦',
    items: [
      {
        question: '¿Cuánto demora en llegar mi pedido?',
        answer:
          'El tiempo de entrega depende de tu ubicación. Generalmente, los despachos en Santiago tardan de 2 a 4 días hábiles, mientras que para regiones el plazo puede variar entre 5 a 10 días hábiles según la provincia.'
      },
      {
        question: '¿Cómo puedo hacer seguimiento a mi compra?',
        answer:
          'Una vez que tu pedido sea despachado, recibirás un correo electrónico con el número de seguimiento y el link del transportista para ver el estado de tu paquete en tiempo real.'
      },
      {
        question: '¿Qué pasa si no hay nadie en el domicilio al momento de la entrega?',
        answer:
          'La empresa de transporte realizará hasta dos intentos de entrega. Si en ambos casos no hay quien reciba, el paquete volverá a nuestra bodega. En ese caso, deberás gestionar un nuevo envío pagando el costo correspondiente.'
      }
    ]
  },
  {
    id: 'pagos',
    label: 'Pagos y Facturación',
    icon: '💳',
    items: [
      {
        question: '¿Qué métodos de pago aceptan?',
        answer:
          'En nuestra tienda online puedes pagar de forma segura a través de Mercado Pago o Webpay, utilizando tarjetas de débito y crédito, con opción de cuotas según tu banco.'
      },
      {
        question: '¿Puedo pedir factura en lugar de boleta?',
        answer:
          'Sí. Al momento de realizar el pago, selecciona la opción de Factura y completa los datos fiscales: RUT, Razón Social, Giro y Dirección. Si se te olvidó, contáctanos de inmediato antes de que el pedido sea procesado.'
      }
    ]
  },
  {
    id: 'stock',
    label: 'Stock y Productos',
    icon: '🛠️',
    items: [
      {
        question: '¿Los precios de la web son los mismos que en la tienda física?',
        answer:
          'Sí, mantenemos los mismos precios base. Sin embargo, algunas promociones online pueden ser exclusivas de la página web y no aplicar para compras presenciales en Ñuñoa.'
      },
      {
        question: '¿Qué pasa si el producto que quiero está agotado?',
        answer:
          'Si un producto no tiene stock, puedes suscribirte en la misma página del artículo dejando tu mail. Te avisaremos automáticamente apenas tengamos reposición (restock).'
      }
    ]
  },
  {
    id: 'contacto',
    label: 'Contacto',
    icon: '📩',
    items: []
  }
]

export default function FAQPagina() {
  const defaultSection = useMemo(() => faqSections[0].id, [])
  const [activeSection, setActiveSection] = useState(defaultSection)
  const [openIndex, setOpenIndex] = useState(0)

  const currentSection = faqSections.find((section) => section.id === activeSection) ?? faqSections[0]

  const toggleItem = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index))
  }

  return (
    <section className="faq-page" id="faq">
      <div className="container py-5">
        <div className="faq-hero text-center mb-5">
          <p className="faq-kicker">💡 Preguntas Frecuentes</p>
          <h1 className="faq-title">RUKI</h1>
          <p className="faq-subtitle">
            Encuentra respuestas rápidas sobre cambios, envíos, pagos, stock y contacto.
          </p>
        </div>

        <div className="faq-tabs" role="tablist" aria-label="Secciones FAQ">
          {faqSections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`faq-tab ${activeSection === section.id ? 'is-active' : ''}`}
              onClick={() => {
                setActiveSection(section.id)
                setOpenIndex(0)
              }}
              role="tab"
              aria-selected={activeSection === section.id}
            >
              <span className="faq-tab-icon" aria-hidden="true">
                {section.icon}
              </span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        <div className="faq-panel">
          {currentSection.id === 'contacto' ? (
            <div className="contact-page faq-contact">
              <div className="channels-row">
                <div className="channel-card">
                  <div className="channel-icon">💬</div>
                  <h4>Chat</h4>
                  <button className="channel-link" type="button" onClick={() => globalThis.location.assign('/chat')}>
                    Iniciar chat
                  </button>
                  <p className="channel-note">Atención: las 24 horas.</p>
                </div>

                <div className="channel-card">
                  <div className="channel-icon">🟢</div>
                  <h4>Whatsapp</h4>
                  <div className="faq-channel-stack">
                    <button
                      className="channel-link"
                      type="button"
                      onClick={() => globalThis.open('https://wa.me/5511930360000', '_blank', 'noreferrer')}
                    >
                      +56 9 6282 3706
                    </button>
                    <button
                      className="channel-link"
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText('+56962823706')
                          alert('Número copiado: +56962823706')
                        } catch {
                          alert('No se pudo copiar el número')
                        }
                      }}
                    >
                      Copiar número
                    </button>
                  </div>
                  <p className="channel-note">
                    Atención:<br />
                    Lunes a viernes de 9:00 am a 22:00 pm<br />
                    Sábado de 9:00 a.m a 14:00 p.m
                  </p>
                </div>

                <div className="channel-card">
                  <div className="channel-icon">📞</div>
                  <h4>Teléfono</h4>
                  <div className="faq-channel-stack">
                    <div>
                      <button className="channel-link" type="button" onClick={() => (globalThis.location.href = 'tel:+52227318732')}>
                        227 318 732 (teléfono celular)
                      </button>
                      <button
                        className="channel-link"
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText('+52227318732')
                            alert('Número copiado: +52227318732')
                          } catch {
                            alert('No se pudo copiar el número')
                          }
                        }}
                      >
                        Copiar
                      </button>
                    </div>
                    <div>
                      <button className="channel-link" type="button" onClick={() => (globalThis.location.href = 'tel:+526006009999')}>
                        600 600 99 99 (teléfono fijo)
                      </button>
                      <button
                        className="channel-link"
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText('+526006009999')
                            alert('Número copiado: +526006009999')
                          } catch {
                            alert('No se pudo copiar el número')
                          }
                        }}
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                  <p className="channel-note">
                    Atención:<br />
                    Lunes a viernes de 9:00 am a 22:00 pm<br />
                    Sábado de 9:00 a.m a 14:00 p.m
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="faq-accordion">
              {currentSection.items.map((item, index) => {
                const isOpen = openIndex === index

                return (
                  <div className={`faq-item ${isOpen ? 'is-open' : ''}`} key={item.question}>
                    <button
                      type="button"
                      className="faq-question"
                      onClick={() => toggleItem(index)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.question}</span>
                      <span className="faq-plus" aria-hidden="true">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    <div className="faq-answer" aria-hidden={!isOpen}>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="faq-legal-grid">
          <article className="faq-legal-card" id="devolucion">
            <p className="faq-legal-eyebrow">Política de Devolución</p>
            <h2>Devoluciones y cambios</h2>
            <p>
              Los cambios se gestionan dentro de los 30 días corridos desde la boleta, en tienda física, con el producto en perfecto estado y sus etiquetas originales.
            </p>
          </article>

          <article className="faq-legal-card" id="terminos">
            <p className="faq-legal-eyebrow">Términos y Condiciones</p>
            <h2>Uso del sitio y compras</h2>
            <p>
              Al comprar en nuestro sitio aceptas las condiciones generales de venta, disponibilidad, promociones, medios de pago y validación de datos de facturación.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
