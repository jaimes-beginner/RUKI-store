import { useState } from 'react'
import '../newarrivals/NewArriivals.css'
import './Productos.css'

const products = [
	{
		id: 1,
		type: 'new',
		name: 'Polera Ruki Bolt',
		price: '$ 15.900',
		image: '/imagenes/fondo.jpeg',
		thumbs: ['/imagenes/fondo.jpeg', '/imagenes/wallpaper.jpg'],
	},
	{
		id: 2,
		type: 'sale',
		name: 'Buzo Blackout',
		oldPrice: '$ 19.900',
		newPrice: '$ 12.900',
		image: '/imagenes/wallpaper.jpg',
		thumbs: ['/imagenes/wallpaper.jpg', '/imagenes/walpaper 2.jpg'],
	},
	{
		id: 3,
		type: 'regular',
		name: 'Mochila Training',
		price: '$ 22.900',
		image: '/imagenes/walpaper 2.jpg',
		thumbs: ['/imagenes/walpaper 2.jpg', '/imagenes/fondo.jpeg'],
	},
	{
		id: 4,
		type: 'new',
		name: 'Short Motion New',
		price: '$ 17.900',
		image: '/imagenes/wallpaper.jpg',
		thumbs: ['/imagenes/wallpaper.jpg', '/imagenes/fondo.jpeg'],
	},
	{
		id: 5,
		type: 'sale',
		name: 'Calcetas Burnout',
		oldPrice: '$ 14.900',
		newPrice: '$ 10.900',
		image: '/imagenes/walpaper 2.jpg',
		thumbs: ['/imagenes/walpaper 2.jpg', '/imagenes/fondo.jpeg'],
	},
	{
		id: 6,
		type: 'regular',
		name: 'Poleron Core',
		price: '$ 21.900',
		image: '/imagenes/fondo.jpeg',
		thumbs: ['/imagenes/fondo.jpeg', '/imagenes/wallpaper.jpg'],
	},
	{
		id: 7,
		type: 'new',
		name: 'Top Active New',
		price: '$ 14.900',
		image: '/imagenes/fondo.jpeg',
		thumbs: ['/imagenes/fondo.jpeg', '/imagenes/walpaper 2.jpg'],
	},
	{
		id: 8,
		type: 'sale',
		name: 'Jogger Street Fade',
		oldPrice: '$ 21.900',
		newPrice: '$ 14.900',
		image: '/imagenes/wallpaper.jpg',
		thumbs: ['/imagenes/wallpaper.jpg', '/imagenes/fondo.jpeg'],
	},
	{
		id: 9,
		type: 'regular',
		name: 'Polera Performance',
		price: '$ 16.900',
		image: '/imagenes/walpaper 2.jpg',
		thumbs: ['/imagenes/walpaper 2.jpg', '/imagenes/wallpaper.jpg'],
	},
]

const badgeByType = {
	new: 'NEW!',
	sale: 'SALE!',

}

export default function Productos() {
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

	const badgeClassByType = (type) => {
		if (type === 'sale') return 'products-badge-sale'
		if (type === 'new') return 'products-badge-new'
		return 'products-badge-regular'
	}

	return (
		<main className="new-arrivals-page products-page">
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
					<h2>Productos</h2>
					<p className="products-subtitle">Todos tus productos a solo un click.</p>

					<div className="na-grid">
						{products.map((product) => (
							<article key={product.id} className="na-card">
								<div className="na-image-wrap">
									<img src={getDisplayImage(product)} alt={product.name} />
									<span className={`na-badge ${badgeClassByType(product.type)}`}>{badgeByType[product.type]}</span>
								</div>

								<h3>{product.name}</h3>

								{product.type === 'sale' ? (
									<div className="products-price-wrap">
										<p className="products-price-old">{product.oldPrice}</p>
										<p className="products-price-new">{product.newPrice}</p>
									</div>
								) : (
									<p className="na-price">{product.price}</p>
								)}

								<div className="na-thumbs">
									{getGallery(product).map((thumb, index) => (
										<button
											key={`${product.id}-${index}`}
											type="button"
											className={`na-thumb-btn ${getSelectedIndex(product.id) === index ? 'is-active' : ''}`}
											onClick={() => handleSelectImage(product.id, index)}
											aria-label={`Mostrar imagen ${index + 1} de ${product.name}`}
										>
											<img src={thumb} alt={`${product.name} miniatura ${index + 1}`} />
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
