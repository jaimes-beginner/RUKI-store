import '../../App.css'

import NavbarUsuario from '../../components/usuario/navbar/NavabarUsuarios'
import { PagoExitoso } from '../../components/usuario/pagos/PagoExitoso'
import FooterUsuario from '../../components/usuario/footer/FooterUsuario'

export function PagoExitosoPage() {
	return (
		<>
			<NavbarUsuario />
			<PagoExitoso />
			<FooterUsuario />
		</>
	)
}
