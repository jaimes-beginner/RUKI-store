// Importaciones
import FooterUsuario from "../../components/usuario/footer/FooterUsuario";
import NavabarUsuarios from "../../components/usuario/navbar/NavabarUsuarios";
import { CrearUsuario } from "../../components/admin/gestion/CrearUsuario";

/*-------------------------------------------------*/

// Componente para crear un nuevo usuario en la vista de administrador
export function CrearUsuarioAdmin() {
	return (
		<>
			<NavabarUsuarios />
			<CrearUsuario />
			<FooterUsuario />
		</>
	);
}
