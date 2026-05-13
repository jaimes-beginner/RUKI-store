import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './BlogPagina.css';

const posts = [
  {
    id: 1,
    title: 'La Tecnología del Tejido Definitivo',
    category: 'INNOVACIÓN',
    date: '07/06/2026',
    excerpt: 'Nuestra división de I+D confirma el lanzamiento de la "Fibra Ultra-WOD": un tejido que absorbe la humedad un 40% más rápido y reduce la fatiga muscular en ejercicios de alta intensidad. ¡Descubre por qué nuestros nuevos shorts y leggings están revolucionando el rendimiento en el box!',
    image: '/imagenes/wallpaper.jpg',
    link: '/noticiashort'
  },
  {
    id: 2,
    title: 'El Impacto de la Moda en la Motivación',
    category: 'LIFESTYLE',
    date: '07/05/2026',
    excerpt: 'Un estudio reciente del Centro de Psicología Deportiva de California revela que vestir ropa deportiva que inspire confianza y estilo puede aumentar la adherencia a la rutina de entrenamiento hasta en un 25%. ¡Explora nuestra nueva colección diseñada para potenciar tu mejor versión!',
    image: '/imagenes/fondo.jpeg',
    link: '/noticiashort'
  }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
};

export default function BlogPagina() {
  return (
    <main className="ruki-blog-wrapper">
      
      {/* HERO SECTION DE BLOG */}
      <section className="blog-hero-section">
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="blog-hero-content"
        >
            <span className="blog-hero-badge">RUKI JOURNAL</span>
            <h1 className="blog-hero-title">Noticias & Editorial</h1>
            <p className="blog-hero-subtitle">Descubre historias, tecnología y novedades del mundo del entrenamiento de alto rendimiento.</p>
        </motion.div>
      </section>

      <section className="container pb-5">
        <motion.div 
            className="row g-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
          {posts.map((post) => (
            <motion.div className="col-12 col-lg-10 mx-auto" key={post.id} variants={itemVariants}>
              <Link to={post.link} className="text-decoration-none">
                  <motion.article 
                      className="blog-card"
                      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
                      transition={{ duration: 0.3 }}
                  >
                    <div className="row g-0 h-100">
                      
                      {/* IMAGEN DE LA NOTICIA */}
                      <div className="col-md-5 col-lg-4">
                        <div className="blog-image-wrap">
                          <img src={post.image} alt={post.title} className="blog-img" />
                        </div>
                      </div>

                      {/* CONTENIDO DE LA NOTICIA */}
                      <div className="col-md-7 col-lg-8">
                        <div className="blog-card-body">
                          <div className="blog-meta">
                            <span className="blog-category">{post.category}</span>
                            <span className="blog-dot">•</span>
                            <span className="blog-date">{post.date}</span>
                          </div>

                          <h2 className="blog-post-title">{post.title}</h2>
                          <p className="blog-post-excerpt">{post.excerpt}</p>

                          <div className="blog-read-more">
                            Leer artículo completo 
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ms-2 blog-arrow-icon">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                              <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.article>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </main>
  );
}