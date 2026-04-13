import '../../App.css'

import NavbarNew from '../../components/usuario/newarrivals/NavabarNew'
import FooterUsuario from '../../components/usuario/footer/FooterUsuario'
import Productos from '../../components/usuario/productos/Productos'

export function PaginaProductosCliente() {
	return (
		<>
			<NavbarNew />
			<Productos />
			<FooterUsuario />
		</>
	)
}
