// Importaciones
import '../../App.css'

import NavbarUsuario from '../../components/usuario/navbar/NavabarUsuarios'
import { Perfil } from '../../components/usuario/perfil/Perfil'
import FooterUsuario from '../../components/usuario/footer/FooterUsuario'

export function PerfilPage() {
	return (
		<>
			<NavbarUsuario />
			<Perfil />
			<FooterUsuario />
		</>
	)
}

