import '../../App.css'

import NavbarUsuario from '../../components/usuario/navbar/NavabarUsuarios'
import { Checkout } from '../../components/usuario/pagos/Checkout'
import FooterUsuario from '../../components/usuario/footer/FooterUsuario'

export function CheckoutPage() {
	return (
		<>
			<NavbarUsuario />
			<Checkout />
			<FooterUsuario />
		</>
	)
}
