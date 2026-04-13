import { useState } from 'react'
import './NewArriivals.css'

const products = [
	{
		id: 1,
		name: 'Buzo Black',
		price: '$ 14.900',
		image: '/imagenes/wallpaper.jpg',
		thumbs: ['/imagenes/wallpaper.jpg', '/imagenes/walpaper 2.jpg', '/imagenes/fondo.jpeg'],
	},
	{
		id: 2,
		name: 'Calcetas Porn',
		price: '$ 15.900',
		image: '/imagenes/walpaper 2.jpg',
		thumbs: ['/imagenes/walpaper 2.jpg', '/imagenes/fondo.jpeg'],
	},
	{
		id: 3,
		name: 'Polera Ruki Core',
		price: '$ 13.900',
		image: '/imagenes/fondo.jpeg',
		thumbs: ['/imagenes/fondo.jpeg', '/imagenes/wallpaper.jpg'],
	},
	{
		id: 4,
		name: 'Short Motion',
		price: '$ 16.900',
		image: '/imagenes/wallpaper.jpg',
		thumbs: ['/imagenes/wallpaper.jpg', '/imagenes/walpaper 2.jpg'],
	},
	{
		id: 5,
		name: 'Poleron Street',
		price: '$ 18.900',
		image: '/imagenes/walpaper 2.jpg',
		thumbs: ['/imagenes/walpaper 2.jpg', '/imagenes/fondo.jpeg'],
	},
	{
		id: 6,
		name: 'Mochila Utility',
		price: '$ 22.900',
		image: '/imagenes/fondo.jpeg',
		thumbs: ['/imagenes/fondo.jpeg', '/imagenes/wallpaper.jpg'],
	},
]

export default function NewArriivals() {
	const [selectedImages, setSelectedImages] = useState({})

	const getGallery = (product) => [product.image, ...product.thumbs]

	const getSelectedIndex = (productId) => selectedImages[productId] ?? 0

	const handleSelectImage = (productId, imageIndex) => {
		setSelectedImages((current) => ({ ...current, [productId]: imageIndex }))
	}

	const getDisplayImage = (product) => {
		const gallery = getGallery(product)
		const selectedIndex = getSelectedIndex(product.id)
		return gallery[selectedIndex] ?? gallery[0]
	}

	return (
		<main className="new-arrivals-page">
			<header className="na-page-header">
			</header>
		
				<section className="na-content">
					<aside className="na-filter">
						<p className="na-filter-title">Filtro</p>

						<div className="na-filter-block">
							<p>Talla</p>
							<div className="na-size-grid">
								<button type="button">XS</button>
								<button type="button">S</button>
								<button type="button">M</button>
								<button type="button">L</button>
							</div>
						</div>
					</aside>

					<div className="na-products">
						<h2>New Arrivals</h2>

						<div className="na-grid">
							{products.map((product) => (
								<article key={product.id} className="na-card">
									<div className="na-image-wrap">
										<img src={getDisplayImage(product)} alt={product.name} />
										<span className="na-badge">NEW!</span>
									</div>

									<h3>{product.name}</h3>
									<p className="na-price">{product.price}</p>

									<div className="na-thumbs">
										{getGallery(product).map((thumb, index) => (
											<button
												key={`${product.id}-${index}`}
												type="button"
												className={`na-thumb-btn ${getSelectedIndex(product.id) === index ? 'is-active' : ''}`}
												onClick={() => handleSelectImage(product.id, index)}
												aria-label={`Mostrar imagen ${index + 1} de ${product.name}`}
											>
												<img
													src={thumb}
													alt={`${product.name} miniatura ${index + 1}`}
												/>
											</button>
										))}
									</div>
								</article>
							))}
						</div>
					</div>
				</section>
			
		</main>
	)
}
