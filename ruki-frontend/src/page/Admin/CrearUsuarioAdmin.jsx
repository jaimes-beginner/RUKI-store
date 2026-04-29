// Importaciones
import { FooterAdmin } from "../../components/admin/footer/FooterAdmin";
import { NavbarAdmin } from "../../components/admin/navbar/NavbarAdmin";
import { CrearUsuario } from "../../components/admin/gestion/CrearUsuario";

/*-------------------------------------------------*/

// Componente para crear un nuevo usuario en la vista de administrador
export function CrearUsuarioAdmin() {
	return (
		<>
			<NavbarAdmin />
			<CrearUsuario />
			<FooterAdmin />
		</>
	);
}
