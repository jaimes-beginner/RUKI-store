import { useEffect, useMemo, useState } from 'react';
import './pantallainicio.css';

const categories = [
	{ title: 'Accesorios', image: '/imagenes/wallpaper.jpg' },
	{ title: 'Shorts', image: '/imagenes/walpaper 2.jpg' },
	{ title: 'Polerones', image: '/imagenes/fondo.jpeg' },
	{ title: 'Polera', image: '/imagenes/wallpaper.jpg' },
];

const products = [
	{
		name: 'Poleron Crossfit On Fire',
		price: '$ 14.900',
		image: '/imagenes/walpaper 2.jpg',
	},
	{
		name: 'Polera NO MORE BURPEES',
		price: '$ 15.900',
		image: '/imagenes/fondo.jpeg',
	},
	{
		name: 'Polera Sailor Moon',
		price: '$ 15.900',
		image: '/imagenes/wallpaper.jpg',
	},
	{
		name: 'Short Performance Black',
		price: '$ 18.900',
		image: '/imagenes/walpaper 2.jpg',
	},
	{
		name: 'Mochila Utility RUKI',
		price: '$ 22.900',
		image: '/imagenes/wallpaper.jpg',
	},
];

function PantallaInicio() {
	const [slideIndex, setSlideIndex] = useState(0);
	const [cardsPerView, setCardsPerView] = useState(3);

	useEffect(() => {
		const syncCards = () => {
			if (window.innerWidth <= 640) {
				setCardsPerView(1);
				return;
			}
			if (window.innerWidth <= 980) {
				setCardsPerView(2);
				return;
			}
			setCardsPerView(3);
		};

		syncCards();
		window.addEventListener('resize', syncCards);

		return () => window.removeEventListener('resize', syncCards);
	}, []);

	const maxSlideIndex = useMemo(
		() => Math.max(0, products.length - cardsPerView),
		[cardsPerView],
	);

	useEffect(() => {
		if (slideIndex > maxSlideIndex) {
			setSlideIndex(maxSlideIndex);
		}
	}, [slideIndex, maxSlideIndex]);

	useEffect(() => {
		if (maxSlideIndex === 0) return undefined;

		const timer = window.setInterval(() => {
			setSlideIndex((current) => (current >= maxSlideIndex ? 0 : current + 1));
		}, 3500);

		return () => window.clearInterval(timer);
	}, [maxSlideIndex]);

	const handlePrev = () => {
		setSlideIndex((current) => (current <= 0 ? maxSlideIndex : current - 1));
	};

	const handleNext = () => {
		setSlideIndex((current) => (current >= maxSlideIndex ? 0 : current + 1));
	};

	return (
		<main className="home-main">
			<div className="home-main-inner">
				<section className="hero-banner">
					<img src="/imagenes/fondo.jpeg" alt="Welcome to RUKI" />
					<div className="hero-mask"></div>
					<h1>
						Welcome
						<br />
						to RUKI
					</h1>
				</section>

				<section className="category-grid" aria-label="Categorias">
					{categories.map((category) => (
						<article key={category.title} className="category-card">
							<img src={category.image} alt={category.title} />
							<div className="category-mask"></div>
							<h2>{category.title}</h2>
						</article>
					))}
				</section>

				<section className="products-section" aria-label="Nuevos productos" >
					<h3>NUEVOS PRODUCTOS</h3>

					<div className="carousel-wrap">
						<button type="button" className="carousel-btn" onClick={handlePrev} aria-label="Anterior">
							‹
						</button>

						<div className="carousel-viewport">
							<div
								className="carousel-track"
								style={{ transform: `translateX(-${(slideIndex * 100) / cardsPerView}%)` }}
							>
								{products.map((product) => (
									<article key={product.name} className="product-card">
										<img src={product.image} alt={product.name} />
										<div className="product-meta">
											<p className="product-name">{product.name}</p>
											<p className="product-price">{product.price}</p>
										</div>
									</article>
								))}
							</div>
						</div>

						<button type="button" className="carousel-btn" onClick={handleNext} aria-label="Siguiente">
							›
						</button>
					</div>

					<div className="carousel-dots">
						{Array.from({ length: maxSlideIndex + 1 }).map((_, index) => (
							<button
								key={`dot-${index}`}
								type="button"
								className={`dot ${slideIndex === index ? 'active' : ''}`}
								onClick={() => setSlideIndex(index)}
								aria-label={`Ir a la diapositiva ${index + 1}`}
							></button>
						))}
					</div>
				</section>
			</div>
		</main>
	);
}

export default PantallaInicio;
