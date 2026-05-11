import '../../App.css'

import NavbarUsuario from '../../components/usuario/navbar/NavabarUsuarios'
import { MisPedidos } from '../../components/usuario/mis-pedidos/MisPedidos'
import FooterUsuario from '../../components/usuario/footer/FooterUsuario'

export function MisPedidosPage() {
	return (
		<>
			<NavbarUsuario />
			<MisPedidos />
			<FooterUsuario />
		</>
	)
}

