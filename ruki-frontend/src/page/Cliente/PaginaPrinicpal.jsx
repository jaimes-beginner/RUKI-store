// Importaciones
import '../../App.css'

import NavbarUsuario from '../../components/usuario/navbar/NavabarUsuarios'
import FooterUsuario from '../../components/usuario/footer/FooterUsuario'
import Home from '../../components/usuario/home/PantallaInicio'

/*-------------------------------------------------*/

// Vista de la pagina principal del cliente usando los componentes
export function PaginaPrincipalCliente() {
	return (
		<>
			<NavbarUsuario />
			<Home />
			<FooterUsuario />
		</>
	)
}

