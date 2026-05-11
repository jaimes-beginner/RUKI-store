import '../../App.css'

import NavbarUsuario from '../../components/usuario/navbar/NavabarUsuarios'
import { ProductoDetalle } from '../../components/usuario/producto-detalle/ProductoDetalle'
import FooterUsuario from '../../components/usuario/footer/FooterUsuario'

export function ProductoDetallePage() {
	return (
		<>
			<NavbarUsuario />
			<ProductoDetalle />
			<FooterUsuario />
		</>
	)
}

