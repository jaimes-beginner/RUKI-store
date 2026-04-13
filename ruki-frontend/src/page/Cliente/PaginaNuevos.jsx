// Importaciones
import '../../App.css'

import NavbarNew from '../../components/usuario/newarrivals/NavabarNew'
import FooterUsuario from '../../components/usuario/footer/FooterUsuario'
import NewArriivals from '../../components/usuario/newarrivals/NewArriivals'

/*-------------------------------------------------*/

// Vista de la pagina de nuevos productos del cliente usando los componentes
export function PaginaNuevosCliente() {
	return (
		<>
			<NavbarNew />
			<NewArriivals />
			<FooterUsuario />
		</>
	)
}

