// Importaciones
import NavabarUsuarios from "../../components/usuario/navbar/NavabarUsuarios";
import { RegistrarUsuario } from "../../components/auth/RegistrarUsuario";
import FooterUsuario from '../../components/usuario/footer/FooterUsuario'

/*-------------------------------------------------*/

// Componente para crear un nuevo usuario en la vista de administrador
export function RegistrarUsuarioPage() {
	return (
		<>
			<NavabarUsuarios />
			<RegistrarUsuario />
			<FooterUsuario />
		</>
	);
}
