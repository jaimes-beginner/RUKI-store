import NavbarUsuario from "../../components/usuario/navbar/NavabarUsuarios";
import { ForgotPassword } from "../../components/auth/ForgotPassword";
import FooterUsuario from '../../components/usuario/footer/FooterUsuario';

export function ForgotPasswordPage() {
	return (
		<>
			<NavbarUsuario />
			<ForgotPassword />
			<FooterUsuario />
		</>
	);
}