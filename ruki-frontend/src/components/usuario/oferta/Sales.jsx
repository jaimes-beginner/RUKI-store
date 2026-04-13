import { useState } from 'react'
import '../newarrivals/NewArriivals.css'
import './Sales.css'

const products = [
	{
		id: 1,
		name: 'Poleron Blackout',
		oldPrice: '$ 19.900',
		newPrice: '$ 12.900',
		image: '/imagenes/wallpaper.jpg',
		thumbs: ['/imagenes/wallpaper.jpg', '/imagenes/walpaper 2.jpg', '/imagenes/fondo.jpeg'],
	},
	{
		id: 2,
		name: 'Calcetas Burnout',
		oldPrice: '$ 14.900',
		newPrice: '$ 10.900',
		image: '/imagenes/walpaper 2.jpg',
		thumbs: ['/imagenes/walpaper 2.jpg', '/imagenes/fondo.jpeg'],
	},
	{
		id: 3,
		name: 'Polera Ruki Ghost',
		oldPrice: '$ 17.900',
		newPrice: '$ 11.900',
		image: '/imagenes/fondo.jpeg',
		thumbs: ['/imagenes/fondo.jpeg', '/imagenes/wallpaper.jpg'],
	},
	{
		id: 4,
		name: 'Short Endurance',
		oldPrice: '$ 20.900',
		newPrice: '$ 13.900',
		image: '/imagenes/wallpaper.jpg',
		thumbs: ['/imagenes/wallpaper.jpg', '/imagenes/walpaper 2.jpg'],
	},
	{
		id: 5,
		name: 'Jogger Street Fade',
		oldPrice: '$ 21.900',
		newPrice: '$ 14.900',
		image: '/imagenes/walpaper 2.jpg',
		thumbs: ['/imagenes/walpaper 2.jpg', '/imagenes/fondo.jpeg'],
	},
	{
		id: 6,
		name: 'Mochila Core Sale',
		oldPrice: '$ 24.900',
		newPrice: '$ 16.900',
		image: '/imagenes/fondo.jpeg',
		thumbs: ['/imagenes/fondo.jpeg', '/imagenes/wallpaper.jpg'],
	},
]

export default function Sales() {
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
		<main className="new-arrivals-page sale-page">
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
					<h2>Sale</h2>

					<div className="na-grid">
						{products.map((product) => (
							<article key={product.id} className="na-card">
								<div className="na-image-wrap">
									<img src={getDisplayImage(product)} alt={product.name} />
									<span className="na-badge sale-badge">SALE!</span>
								</div>

								<h3>{product.name}</h3>
								<div className="sale-price-wrap">
									<p className="sale-price-old">{product.oldPrice}</p>
									<p className="sale-price-new">{product.newPrice}</p>
								</div>

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
