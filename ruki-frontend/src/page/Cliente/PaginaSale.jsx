import '../../App.css'

import NavbarNew from '../../components/usuario/newarrivals/NavabarNew'
import FooterUsuario from '../../components/usuario/footer/FooterUsuario'
import Sales from '../../components/usuario/oferta/Sales'

export function PaginaSaleCliente() {
	return (
		<>
			<NavbarNew />
			<Sales />
			<FooterUsuario />
		</>
	)
}
