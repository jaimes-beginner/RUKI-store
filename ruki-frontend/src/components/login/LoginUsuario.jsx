// Importaciones
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/*-------------------------------------------------*/

// Renderiza un formulario de login
export function LoginUsuario() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [correo, setCorreo] = useState("");
	const [password, setPassword] = useState("");
	const [errores, setErrores] = useState({});
	const [mensaje, setMensaje] = useState(null);
	const [loading, setLoading] = useState(false);

	// Validacion de Correo
	useEffect(() => {
		const regexCorreo = /^[\w.-]+@gmail\.com$/;
		if (!correo.trim()) {
			setErrores((prev) => ({ ...prev, correo: "El correo es obligatorio." }));
		} else if (!regexCorreo.test(correo)) {
			setErrores((prev) => ({ ...prev, correo: "Solo se permiten correos Gmail." }));
		} else {
			setErrores((prev) => ({ ...prev, correo: "" }));
		}
	}, [correo]);

	// Validacion de Contraseña
	useEffect(() => {
		const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
		if (!password.trim()) {
			setErrores((prev) => ({ ...prev, contrasena: "La contraseña es obligatoria." }));
		} else if (!regexContrasena.test(password)) {
			setErrores((prev) => ({ ...prev, contrasena: "La contraseña no cumple con el formato requerido." }));
		} else {
			setErrores((prev) => ({ ...prev, contrasena: "" }));
		}
	}, [password]);

	// Maneja el envio del formulario de login.
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Verificamos si hay campos vacios antes de enviar
		if (!correo || !password) {
			setMensaje("Por favor completa todos los campos.");
			return;
		}

		if (errores.correo || errores.contrasena) {
			setMensaje("Corrige los errores antes de continuar.");
			return;
		}

		setLoading(true);
		setMensaje(null);

		try {
			const datosUsuario = await login(correo, password);

			setMensaje("Inicio de sesion exitoso. Redirigiendo...");

			// Logica de Redireccion basada en el ROL
			setTimeout(() => {
				const idRol = datosUsuario?.rol?.id || datosUsuario?.rol;
				console.log("Rol detectado para redireccion:", idRol);

				if (idRol === 1) {
					navigate("/admin/crear-usuario");
				} else {
					navigate("/");
				}
			}, 1500);
		} catch (error) {
			console.error("ERROR AL INICIAR SESION:", error);
			const errorMsg =
				error?.message ||
				error.response?.data?.message ||
				error.response?.data ||
				"Correo o contraseña incorrectos.";

			setMensaje(typeof errorMsg === "string" ? errorMsg : "Error de autenticacion");
			setLoading(false); // Detiene la carga solo si hay error
		}
	};

	return (
		<div className="container mt-5 mb-5" style={{ maxWidth: "450px" }}>
			<div className="card rounded border-dark shadow">
				<div className="py-3 d-flex justify-content-center rounded-top">
					<h2 className="m-0" style={{ color: "#000" }}>Iniciar sesion</h2>
				</div>
				<div className="card-body">
					{mensaje && (
						<div className={`alert ${mensaje.includes("exitoso") ? "alert-success" : "alert-danger"} small py-2 text-center`}>
							{mensaje}
						</div>
					)}
					<form onSubmit={handleSubmit}>
						<div className="mb-3">
							<label className="form-label fw-bold small">Correo *</label>
							<input
								type="email"
								name="correo"
								value={correo}
								onChange={(e) => setCorreo(e.target.value)}
								className={`form-control form-control-sm ${errores.correo ? "is-invalid" : correo ? "is-valid" : ""}`}
								placeholder="ejemplo@gmail.com"
							/>
							{errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
						</div>
						<div className="mb-3">
							<label className="form-label fw-bold small">Contraseña *</label>
							<input
								type="password"
								name="contrasena"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className={`form-control form-control-sm ${errores.contrasena ? "is-invalid" : password ? "is-valid" : ""}`}
								placeholder="********"
							/>
							{errores.contrasena && (
								<div className="invalid-feedback" style={{ fontSize: "0.75rem" }}>
									{errores.contrasena}
								</div>
							)}
						</div>
						<div className="d-grid gap-2">
							<button type="submit" className="btn btn-dark" disabled={loading}>
								{loading ? <span><i className="fas fa-spinner fa-spin me-2"></i>Ingresando...</span> : "Ingresar"}
							</button>
							<button type="button" onClick={() => navigate("/")} className="btn btn-secondary">
								Volver al inicio
							</button>
						</div>
					</form>
					<div className="text-center mt-3">
						<small>
							No tienes una cuenta? <Link to="/registro">Registrate aqui</Link>
						</small>
					</div>
				</div>
			</div>
		</div>
	);
}
