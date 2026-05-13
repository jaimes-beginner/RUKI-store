import { LoginUsuario } from "../../components/auth/LoginUsuario";
import NavbarUsuario from "../../components/usuario/navbar/NavabarUsuarios";
import FooterUsuario from '../../components/usuario/footer/FooterUsuario'

/*-------------------------------------------------*/

// Vista de login de usuario usando los componentes
export function LoginUsuarioPage() {
	return (
		<>
			<NavbarUsuario />
			<LoginUsuario />
			<FooterUsuario />
		</>
	);
}
