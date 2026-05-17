import NavbarUsuario from "../../components/usuario/navbar/NavabarUsuarios";
import { ResetPassword } from "../../components/auth/ResetPassword";
import FooterUsuario from '../../components/usuario/footer/FooterUsuario';

export function ResetPasswordPage() {
	return (
		<>
			<NavbarUsuario />
			<ResetPassword />
			<FooterUsuario />
		</>
	);
}