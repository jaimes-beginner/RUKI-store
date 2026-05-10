import '../../App.css'

import NavbarUsuario from '../../components/usuario/navbar/NavabarUsuarios'
import FooterUsuario from '../../components/usuario/footer/FooterUsuario'
import Productos from '../../components/usuario/productos/Productos'

export function PaginaProductosCliente() {
	return (
		<>
			<NavbarUsuario />
			<Productos />
			<FooterUsuario />
		</>
	)
}
