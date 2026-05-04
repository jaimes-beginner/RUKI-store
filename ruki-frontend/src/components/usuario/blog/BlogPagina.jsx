import React from 'react'
import { Link } from 'react-router-dom'
import '../../../App.css'
import './BlogPagina.css'

const posts = [
  {
    id: 1,
    title: 'La Tecnología del Tejido Definitivo',
    category: 'NOTICIAS IMPORTANTES',
    date: '07/06/2024',
    excerpt:
      'Nuestra división de I+D confirma el lanzamiento de la "Fibra Ultra-WOD": un tejido que absorbe la humedad un 40% más rápido y reduce la fatiga muscular en ejercicios de alta intensidad. ¡Descubre por qué nuestros nuevos shorts y leggings están revolucionando el rendimiento en el box!',
    image: '/imagenes/wallpaper.jpg'
  },
  {
    id: 2,
    title: 'El Impacto de la Moda en la Motivación',
    category: 'NOTICIAS IMPORTANTES',
    date: '07/05/2024',
    excerpt:
      'Un estudio reciente del Centro de Psicología Deportiva de California revela que vestir ropa deportiva que inspire confianza y estilo puede aumentar la adherencia a la rutina de entrenamiento hasta en un 25%. ¡Explora nuestra nueva colección diseñada para potenciar tu mejor versión!',
    image: '/imagenes/fondo.jpeg'
  }
]

export default function BlogPagina() {
  return (
    <section className="ruki-blog-section py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="ruki-blog-title">Noticias Importantes</h1>
          <p className="text-muted lead">Las últimas novedades del mundo RUKI</p>
          <hr className="ruki-divider mx-auto" />
        </div>

        <div className="row g-4">
          {posts.map((post) => (
            <div className="col-12" key={post.id}>
              <article className="card ruki-post-card shadow-sm overflow-hidden">
                <div className="row g-0 align-items-center">
                  <div className="col-md-5">
                    <div className="ruki-img-wrap">
                      <img src={post.image} alt={post.title} className="img-fluid w-100 h-100" />
                    </div>
                  </div>

                  <div className="col-md-7">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center text-uppercase small text-muted mb-3 gap-3">
                        <span className="fw-bold text-dark">{post.category}</span>
                        <span>•</span>
                        <span>{post.date}</span>
                      </div>

                      <h2 className="card-title fw-bold mb-3">{post.title}</h2>
                      <p className="card-text text-secondary mb-4 ruki-excerpt">{post.excerpt}</p>

                      <Link to={`/noticiashort`} className="btn btn-dark ruki-btn">
                        SABER MÁS
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
