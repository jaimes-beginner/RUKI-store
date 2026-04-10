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
]

export default function NewArriivals() {
	return (
		<main className="new-arrivals-page">
		
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
										<img src={product.image} alt={product.name} />
										<span className="na-badge">NEW!</span>
									</div>

									<h3>{product.name}</h3>
									<p className="na-price">{product.price}</p>

									<div className="na-thumbs">
										{product.thumbs.map((thumb, index) => (
											<img
												key={`${product.id}-${index}`}
												src={thumb}
												alt={`${product.name} miniatura ${index + 1}`}
											/>
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
