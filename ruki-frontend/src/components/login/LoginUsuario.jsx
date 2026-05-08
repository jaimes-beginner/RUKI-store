import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const REGEX_CORREO = /^[\w.-]+@(gmail\.com|ruki\.com|test\.com)$/i;
const REGEX_CONTRASENA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export function LoginUsuario() {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const [credenciales, setCredenciales] = useState({
        correo: "",
        password: ""
    });
    
    const [errores, setErrores] = useState({});
    const [mensaje, setMensaje] = useState(null);
    const [loading, setLoading] = useState(false);

    // 1. VALIDACIÓN CENTRALIZADA (Sin useEffect)
    const validarCampo = (name, value) => {
        let errorMsg = "";
        if (name === "correo") {
            if (!value.trim()) errorMsg = "El correo es obligatorio.";
            else if (!REGEX_CORREO.test(value)) errorMsg = "Formato de correo no válido.";
        }
        if (name === "password") {
            if (!value.trim()) errorMsg = "La contraseña es obligatoria.";
            else if (!REGEX_CONTRASENA.test(value)) errorMsg = "La contraseña no cumple el formato de seguridad.";
        }
        return errorMsg;
    };

    // 2. MANEJADOR DE CAMBIOS INTELIGENTE
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredenciales(prev => ({ ...prev, [name]: value }));
        
        // Validar en tiempo real mientras escribe
        const error = validarCampo(name, value);
        setErrores(prev => ({ ...prev, [name]: error }));
    };

    // 3. ENVÍO DE FORMULARIO Y REDIRECCIÓN POR ROL
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar antes de intentar el login
        const errorCorreo = validarCampo("correo", credenciales.correo);
        const errorPass = validarCampo("password", credenciales.password);

        if (errorCorreo || errorPass) {
            setErrores({ correo: errorCorreo, password: errorPass });
            setMensaje("Revisa los campos marcados en rojo.");
            return;
        }

        setLoading(true);
        setMensaje(null);

        try {
            // Llamamos a la función login del contexto
            const data = await login(credenciales.correo, credenciales.password);
            
            setMensaje("Acceso concedido. Redirigiendo...");

            // LÓGICA DE REDIRECCIÓN PROFESIONAL (Basada en el ROL del Backend)
            // Soportamos si el rol viene como ID (1), string (ADMIN) o el objeto completo
            setTimeout(() => {
                const rol = data?.user?.role || data?.rol;
                const roleName = typeof rol === 'object' ? rol.name : String(rol);
                
                const isAdmin = roleName === "1" || roleName.includes("ADMIN");

                if (isAdmin) {
                    navigate("/admin/reporte-dashboard");
                } else {
                    navigate("/");
                }
            }, 1000);

        } catch (error) {
            console.error("ERROR DE AUTENTICACIÓN:", error);
            setMensaje(error.message || "Credenciales incorrectas.");
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5 mb-5" style={{ maxWidth: "480px", fontFamily: "'Inter', sans-serif" }}>
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                
                .ios-login-card {
                    background: #ffffff;
                    border: 1.5px solid #161616;
                    border-radius: 20px;
                    padding: 40px;
                }.ios-login-card:hover {
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
                }
                .login-title {
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    color: #1d1d1f;
                    font-size: 28px;
                }
                .ios-input-group label {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #86868b;
                    margin-bottom: 6px;
                }
                .ios-input-field {
                    border: 1.5px solid #d2d2d7;
                    border-radius: 12px;
                    padding: 12px 16px;
                    font-size: 14px;
                    transition: all 0.2s ease;
                }
                .ios-input-field:focus {
                    border-color: #1d1d1f;
                    box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
                    outline: none;
                }
                .ios-btn-login {
                    background: #1d1d1f;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 14px;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                .ios-btn-login:hover { background: #000; }
                .ios-btn-login:disabled { background: #d2d2d7; cursor: not-allowed; }
            `}</style>

            <div className="ios-login-card">
                <div className="text-center mb-4">
                    <h2 className="login-title">Bienvenido a RUKI</h2>
                    <p className="text-muted small">Ingresa tus credenciales para continuar</p>
                </div>

                {mensaje && (
                    <div className={`alert ${mensaje.includes("concedido") ? "alert-dark" : "alert-danger"} py-2 small text-center fw-bold rounded-3 mb-4`}>
                        {mensaje}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="ios-input-group mb-3 d-flex flex-column">
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            name="correo"
                            placeholder="nombre@gmail.com"
                            className={`ios-input-field ${errores.correo ? "is-invalid" : credenciales.correo ? "is-valid" : ""}`}
                            value={credenciales.correo}
                            onChange={handleChange}
                            required
                        />
                        {errores.correo && <div className="invalid-feedback fw-bold" style={{fontSize: '10px'}}>{errores.correo}</div>}
                    </div>

                    <div className="ios-input-group mb-4 d-flex flex-column">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            className={`ios-input-field ${errores.password ? "is-invalid" : credenciales.password ? "is-valid" : ""}`}
                            value={credenciales.password}
                            onChange={handleChange}
                            required
                        />
                        {errores.password && <div className="invalid-feedback fw-bold" style={{fontSize: '10px'}}>{errores.password}</div>}
                    </div>

                    <div className="d-grid gap-2">
                        <button type="submit" className="ios-btn-login" disabled={loading}>
                            {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Verificando...</> : "Iniciar Sesión"}
                        </button>
                        <button type="button" onClick={() => navigate("/")} className="btn btn-link text-dark text-decoration-none fw-bold small">
                            Volver al inicio
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4 border-top pt-3" style={{ borderColor: '#f5f5f7' }}>
                    <small className="text-muted">
                        ¿No tienes una cuenta? <Link to="/crear-usuario" className="text-dark fw-bold">Regístrate ahora</Link>
                    </small>
                </div>
            </div>
        </div>
    );
}