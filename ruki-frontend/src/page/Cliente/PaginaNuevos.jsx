import '../../App.css'

import NavbarUsuario from '../../components/usuario/navbar/NavabarUsuarios'
import FooterUsuario from '../../components/usuario/footer/FooterUsuario'
import NewArrivals from '../../components/usuario/newarrivals/NewArriivals'



export function PaginaNuevosCliente() {
	return (
		<>
			<NavbarUsuario />
			<NewArrivals />
			<FooterUsuario />
		</>
	)
}

