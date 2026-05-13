import '../../App.css'

import NavbarUsuario from '../../components/usuario/navbar/NavabarUsuarios'
import FooterUsuario from '../../components/usuario/footer/FooterUsuario'
import Sales from '../../components/usuario/oferta/Sales'

export function PaginaSaleCliente() {
	return (
		<>
			<NavbarUsuario />
			<Sales />
			<FooterUsuario />
		</>
	)
}
