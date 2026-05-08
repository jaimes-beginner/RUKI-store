import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrarUsuario } from "../../contexts/AuthContext";
import { regiones } from "../../data/Regiones";

const REGEX_CORREO = /^[\w.-]+@(gmail\.com|ruki\.com|test\.com)$/i;
const REGEX_CONTRASENA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export function LoginUsuario() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState({
        firstName: "",
        lastName: "",
        correo: "",
        contrasena: "",
        region: "",
        comuna: "",
        direccion: "",
    });
    
    const [errores, setErrores] = useState({});
    const [mensaje, setMensaje] = useState(null);
    const [loading, setLoading] = useState(false);

    // LÓGICA: VALIDACIÓN CENTRALIZADA
    const validarCampo = (name, value, formState) => {
        let errorMsg = "";
        
        switch (name) {
            case "firstName":
                if (!value.trim()) errorMsg = "El nombre es obligatorio.";
                else if (value.length > 100) errorMsg = "Máximo 100 caracteres.";
                break;
            case "lastName":
                if (!value.trim()) errorMsg = "El apellido es obligatorio.";
                else if (value.length > 100) errorMsg = "Máximo 100 caracteres.";
                break;
            case "correo":
                if (!value.trim()) errorMsg = "El correo es obligatorio.";
                else if (value.length > 100) errorMsg = "Máximo 100 caracteres.";
                else if (!REGEX_CORREO.test(value)) errorMsg = "Solo se aceptan correos @gmail.com.";
                break;
            case "contrasena":
                if (!value.trim()) errorMsg = "La contraseña es obligatoria.";
                else if (!REGEX_CONTRASENA.test(value)) errorMsg = "Mínimo 8 caracteres, mayúscula, minúscula, número y caracter especial.";
                break;
            case "direccion":
                if (!value.trim()) errorMsg = "La dirección es obligatoria.";
                else if (value.length > 200) errorMsg = "Máximo 200 caracteres.";
                break;
            case "region":
                if (!value) errorMsg = "La región es obligatoria.";
                else {
                    const existe = regiones.some((r) => r.nombre === value);
                    if (!existe) errorMsg = "Región inválida.";
                }
                break;
            case "comuna":
                if (!value) errorMsg = "La comuna es obligatoria.";
                else {
                    const regionObj = regiones.find((r) => r.nombre === formState.region);
                    const valida = regionObj?.comunas.includes(value);
                    if (!valida) errorMsg = "Comuna inválida para la región seleccionada.";
                }
                break;
            default:
                break;
        }
        return errorMsg;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let nuevosValores = { ...usuario, [name]: value };
        
        if (name === 'region') {
            nuevosValores.comuna = '';
        }

        setUsuario(nuevosValores);

        const errorDelCampo = validarCampo(name, value, nuevosValores);
        
        setErrores((prev) => ({
            ...prev,
            [name]: errorDelCampo,
            ...(name === 'region' ? { comuna: validarCampo('comuna', '', nuevosValores) } : {})
        }));
    };

    const handleCancelar = () => navigate("/");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const nuevosErrores = {};
        let tieneErrores = false;

        Object.keys(usuario).forEach((key) => {
            const error = validarCampo(key, usuario[key], usuario);
            nuevosErrores[key] = error;
            if (error) tieneErrores = true;
        });

        setErrores(nuevosErrores);

        if (tieneErrores) {
            setMensaje("Corrige los errores en rojo antes de continuar.");
            setTimeout(() => setMensaje(null), 3000);
            return;
        }

        setLoading(true);
        try {
            await registrarUsuario({
                email: usuario.correo,
                password: usuario.contrasena,
                firstName: usuario.firstName,
                lastName: usuario.lastName,
                address: {
                    region: usuario.region,
                    comuna: usuario.comuna,
                    direccion: usuario.direccion,
                },
            });
            setMensaje("Usuario creado con éxito.");
            
            setTimeout(() => navigate("/login"), 1500); 
            
        } catch (error) {
            console.error("ERROR AL CREAR USUARIO:", error);
            setMensaje("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5 mb-5" style={{ maxWidth: "600px" }}>
            <div className="card rounded border-dark shadow">
                <div className="py-3 d-flex justify-content-center rounded-top">
                    <h2 className="m-0" style={{ color: "#000" }}>Nuevo usuario</h2>
                </div>
                <div className="card-body">
                    {mensaje && <div className="alert alert-info small py-2 text-center fw-bold">{mensaje}</div>}
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="row">
                            <div className="mb-2 col-md-6">
                                <label htmlFor="firstName" className="form-label fw-bold small">Nombre *</label>
                                <input
                                    id="firstName"
                                    type="text"
                                    name="firstName"
                                    value={usuario.firstName}
                                    onChange={handleChange}
                                    className={`form-control form-control-sm ${errores.firstName ? "is-invalid" : usuario.firstName ? "is-valid" : ""}`}
                                />
                                {errores.firstName && <div className="invalid-feedback">{errores.firstName}</div>}
                            </div>
                            <div className="mb-2 col-md-6">
                                <label htmlFor="lastName" className="form-label fw-bold small">Apellido *</label>
                                <input
                                    id="lastName"
                                    type="text"
                                    name="lastName"
                                    value={usuario.lastName}
                                    onChange={handleChange}
                                    className={`form-control form-control-sm ${errores.lastName ? "is-invalid" : usuario.lastName ? "is-valid" : ""}`}
                                />
                                {errores.lastName && <div className="invalid-feedback">{errores.lastName}</div>}
                            </div>
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
                                    className={`form-control form-control-sm ${errores.correo ? "is-invalid" : usuario.correo ? "is-valid" : ""}`}
                                />
                                {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
                            </div>
                            <div className="mb-2 col-md-6">
                                <label htmlFor="contrasena" className="form-label fw-bold small">Contraseña *</label>
                                <input
                                    id="contrasena"
                                    type="password"
                                    name="contrasena"
                                    value={usuario.contrasena}
                                    onChange={handleChange}
                                    className={`form-control form-control-sm ${errores.contrasena ? "is-invalid" : usuario.contrasena ? "is-valid" : ""}`}
                                />
                                {errores.contrasena && <div className="invalid-feedback">{errores.contrasena}</div>}
                            </div>
                        </div>

                        <div className="mb-2">
                            <label htmlFor="direccion" className="form-label fw-bold small">Dirección *</label>
                            <input
                                id="direccion"
                                type="text"
                                name="direccion"
                                value={usuario.direccion}
                                onChange={handleChange}
                                className={`form-control form-control-sm ${errores.direccion ? "is-invalid" : usuario.direccion ? "is-valid" : ""}`}
                            />
                            {errores.direccion && <div className="invalid-feedback">{errores.direccion}</div>}
                        </div>

                        <div className="row">
                            <div className="mb-2 col-md-6">
                                <label htmlFor="region" className="form-label fw-bold small">Región *</label>
                                <select
                                    id="region"
                                    name="region"
                                    value={usuario.region}
                                    onChange={handleChange}
                                    className={`form-select form-select-sm ${errores.region ? "is-invalid" : usuario.region ? "is-valid" : ""}`}
                                >
                                    <option value="">Selecciona una región</option>
                                    {regiones.map((r, idx) => (
                                        <option key={idx} value={r.nombre}>{r.nombre}</option>
                                    ))}
                                </select>
                                {errores.region && <div className="invalid-feedback">{errores.region}</div>}
                            </div>
                            <div className="mb-2 col-md-6">
                                <label htmlFor="comuna" className="form-label fw-bold small">Comuna *</label>
                                <select
                                    id="comuna"
                                    name="comuna"
                                    value={usuario.comuna}
                                    onChange={handleChange}
                                    className={`form-select form-select-sm ${errores.comuna ? "is-invalid" : usuario.comuna ? "is-valid" : ""}`}
                                    disabled={!usuario.region}
                                >
                                    <option value="">Selecciona una comuna</option>
                                    {(regiones.find(r => r.nombre === usuario.region)?.comunas || []).map((c, i) => (
                                        <option key={i} value={c}>{c}</option>
                                    ))}
                                </select>
                                {errores.comuna && <div className="invalid-feedback">{errores.comuna}</div>}
                            </div>
                        </div>

                        <div className="d-flex gap-2 pt-3 justify-content-center">
                            <button type="button" onClick={handleCancelar} className="btn btn-sm btn-danger px-4">Cancelar</button>
                            <button type="submit" className="btn btn-sm btn-dark px-4" disabled={loading}>
                                {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Guardando...</> : "Guardar Registro"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}