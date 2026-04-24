// Importaciones
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registrarUsuario } from "../../../services/AuthService";

/*-------------------------------------------------*/

// Renderiza un formulario de creacion alineado al DTO UserCreate del backend.
export function CrearUsuario() {
	const navigate = useNavigate();
	const [usuario, setUsuario] = useState({
		firstName: "",
		lastName: "",
		correo: "",
		contrasena: "",
	});
	const [errores, setErrores] = useState({});
	const [mensaje, setMensaje] = useState(null);
	const [loading, setLoading] = useState(false);

	// Actualiza el estado del formulario en cada cambio de input.
	const handleChange = (e) => {
		const { name, value } = e.target;
		setUsuario({ ...usuario, [name]: value });
		setErrores({ ...errores, [name]: "" });
	};

	// Navega de vuelta al listado de usuarios.
	const handleCancelar = () => navigate("/usuarios-admin");

	// Validacion de nombre
	useEffect(() => {
		if (!usuario.firstName.trim()) {
			setErrores((prev) => ({ ...prev, firstName: "El nombre es obligatorio." }));
		} else if (usuario.firstName.length > 100) {
			setErrores((prev) => ({ ...prev, firstName: "Maximo 100 caracteres." }));
		} else {
			setErrores((prev) => ({ ...prev, firstName: "" }));
		}
	}, [usuario.firstName]);

	// Validacion de apellido
	useEffect(() => {
		if (!usuario.lastName.trim()) {
			setErrores((prev) => ({ ...prev, lastName: "El apellido es obligatorio." }));
		} else if (usuario.lastName.length > 100) {
			setErrores((prev) => ({ ...prev, lastName: "Maximo 100 caracteres." }));
		} else {
			setErrores((prev) => ({ ...prev, lastName: "" }));
		}
	}, [usuario.lastName]);

	// Validacion de correo
	useEffect(() => {
		const regexCorreo = /^[\w.-]+@gmail\.com$/;
		if (!usuario.correo.trim()) {
			setErrores((prev) => ({ ...prev, correo: "El correo es obligatorio." }));
		} else if (usuario.correo.length > 100) {
			setErrores((prev) => ({ ...prev, correo: "Maximo 100 caracteres." }));
		} else if (!regexCorreo.test(usuario.correo)) {
			setErrores((prev) => ({ ...prev, correo: "Solo se aceptan correos @gmail.com." }));
		} else {
			setErrores((prev) => ({ ...prev, correo: "" }));
		}
	}, [usuario.correo]);

	// Validacion de contrasena
	useEffect(() => {
		const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
		if (!usuario.contrasena.trim()) {
			setErrores((prev) => ({ ...prev, contrasena: "La contrasena es obligatoria." }));
		} else if (!regexContrasena.test(usuario.contrasena)) {
			setErrores((prev) => ({ ...prev, contrasena: "Minimo 8 caracteres, mayuscula, minuscula, numero y caracter especial." }));
		} else {
			setErrores((prev) => ({ ...prev, contrasena: "" }));
		}
	}, [usuario.contrasena]);

	// Maneja el envio del formulario
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (Object.values(errores).some((err) => err !== "")) {
			setMensaje("Corrige los errores antes de continuar.");
			return;
		}
		setLoading(true);
		try {
			await registrarUsuario({
				email: usuario.correo,
				password: usuario.contrasena,
				firstName: usuario.firstName,
				lastName: usuario.lastName,
			});
			setMensaje("Usuario creado con exito.");
			setTimeout(() => navigate("/usuarios-admin"), 1500);
		} catch (error) {
			console.error("ERROR AL CREAR USUARIO:", error);
			setMensaje("Error al crear el usuario, revisa los datos.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mt-5 mb-5" style={{ maxWidth: "600px" }}>
			<div className="card rounded border-dark shadow">
				<div className="py-3 d-flex justify-content-center rounded-top">
					<h2 className="m-0">Crear nuevo usuario</h2>
				</div>
				<div className="card-body">
					{mensaje && <div className="alert alert-info small py-2 text-center">{mensaje}</div>}
					<form onSubmit={handleSubmit}>
						<div className="mb-2">
							<label htmlFor="firstName" className="form-label fw-bold small">Nombre *</label>
							<input
								id="firstName"
								type="text"
								name="firstName"
								value={usuario.firstName}
								onChange={handleChange}
								className={`form-control form-control-sm ${errores.firstName ? "is-invalid" : "is-valid"}`}
							/>
							{errores.firstName && <div className="invalid-feedback">{errores.firstName}</div>}
						</div>
						<div className="mb-2">
							<label htmlFor="lastName" className="form-label fw-bold small">Apellido *</label>
							<input
								id="lastName"
								type="text"
								name="lastName"
								value={usuario.lastName}
								onChange={handleChange}
								className={`form-control form-control-sm ${errores.lastName ? "is-invalid" : "is-valid"}`}
							/>
							{errores.lastName && <div className="invalid-feedback">{errores.lastName}</div>}
						</div>
						<div className="row">
							<div className="mb-2 col-md-6">
								<label htmlFor="correo" className="form-label fw-bold small">Correo *</label>
								<input
									id="correo"
									type="email"
									name="correo"
									value={usuario.correo}
									onChange={handleChange}
									className={`form-control form-control-sm ${errores.correo ? "is-invalid" : "is-valid"}`}
								/>
								{errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
							</div>
							<div className="mb-2 col-md-6">
								<label htmlFor="contrasena" className="form-label fw-bold small">Contrasena *</label>
								<input
									id="contrasena"
									type="password"
									name="contrasena"
									value={usuario.contrasena}
									onChange={handleChange}
									className={`form-control form-control-sm ${errores.contrasena ? "is-invalid" : "is-valid"}`}
								/>
								{errores.contrasena && <div className="invalid-feedback">{errores.contrasena}</div>}
							</div>
						</div>
						<div className="d-flex gap-2 pt-3 justify-content-center">
							<button type="button" onClick={handleCancelar} className="btn btn-sm btn-danger">Cancelar</button>
							<button type="submit" className="btn btn-sm btn-dark" disabled={loading}>
								{loading ? "Guardando..." : "Crear usuario"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
