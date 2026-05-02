import { LoginUsuario } from "../../components/login/LoginUsuario";
import NavbarUsuario from "../../components/usuario/navbar/NavabarUsuarios";

/*-------------------------------------------------*/

// Vista de login de usuario usando los componentes
export function Login() {
	return (
		<>
			<NavbarUsuario />
			<LoginUsuario />
		</>
	);
}
