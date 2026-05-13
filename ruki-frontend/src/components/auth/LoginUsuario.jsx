import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import "./LoginUsuario.css"; // <-- NUEVO ARCHIVO DE ESTILOS

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredenciales(prev => ({ ...prev, [name]: value }));
        
        const error = validarCampo(name, value);
        setErrores(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
            const data = await login(credenciales.correo, credenciales.password);
            
            setMensaje("Acceso concedido. Redirigiendo...");

            setTimeout(() => {
                const rol = data?.user?.role || data?.rol;
                const roleName = typeof rol === 'object' ? rol.name : String(rol);
                const isAdmin = roleName === "1" || roleName.includes("ADMIN");

                if (isAdmin) {
                    navigate("/admin/reporte-dashboard", { replace: true });
                } else {
                    navigate("/", { replace: true });
                }
            }, 1000);

        } catch (error) {
            console.error("ERROR DE AUTENTICACIÓN:", error);
            setMensaje(error.message || "Credenciales incorrectas.");
            setLoading(false);
        }
    };

    return (
        <div className="login-main-wrapper">
            {/* LUCES AMBIENTALES DE FONDO */}
            <div className="login-ambient-blob login-blob-1"></div>
            <div className="login-ambient-blob login-blob-2"></div>

            <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', position: 'relative', zIndex: 1 }}>
                <motion.div 
                    className="ios-login-card-glass w-100" 
                    style={{ maxWidth: "420px" }}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <div className="text-center mb-4">
                        {/* Pequeño logo o icono flotante */}
                        <div className="login-icon-glass mx-auto mb-3">
                            <i className="fas fa-user-lock"></i>
                        </div>
                        <h2 className="login-title">Bienvenido a RUKI</h2>
                        <p className="login-subtitle">Ingresa tus credenciales para continuar</p>
                    </div>

                    <AnimatePresence>
                        {mensaje && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className={`ios-alert-glass ${mensaje.includes("concedido") ? "alert-success-glass" : "alert-error-glass"}`}
                            >
                                {mensaje.includes("concedido") ? <i className="fas fa-check-circle me-2"></i> : <i className="fas fa-exclamation-circle me-2"></i>}
                                {mensaje}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="ios-input-group mb-3">
                            <label>Correo Electrónico</label>
                            <div className="ios-input-wrapper">
                                <i className="fas fa-envelope input-icon"></i>
                                <input
                                    type="email"
                                    name="correo"
                                    placeholder="nombre@gmail.com"
                                    className={`ios-input-field ${errores.correo ? "is-invalid" : credenciales.correo && !errores.correo ? "is-valid" : ""}`}
                                    value={credenciales.correo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <AnimatePresence>
                                {errores.correo && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="input-error-text">
                                        {errores.correo}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="ios-input-group mb-4">
                            <label>Contraseña</label>
                            <div className="ios-input-wrapper">
                                <i className="fas fa-lock input-icon"></i>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    className={`ios-input-field ${errores.password ? "is-invalid" : credenciales.password && !errores.password ? "is-valid" : ""}`}
                                    value={credenciales.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <AnimatePresence>
                                {errores.password && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="input-error-text">
                                        {errores.password}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="d-grid gap-3">
                            <motion.button 
                                whileTap={!loading ? { scale: 0.96 } : {}} 
                                type="submit" 
                                className="ios-btn-login" 
                                disabled={loading}
                            >
                                {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Verificando...</> : "Iniciar Sesión"}
                            </motion.button>
                            <motion.button 
                                whileTap={{ scale: 0.96 }}
                                type="button" 
                                onClick={() => navigate("/")} 
                                className="ios-btn-back"
                            >
                                Volver al inicio
                            </motion.button>
                        </div>
                    </form>

                    <div className="login-footer">
                        <small>
                            ¿No tienes una cuenta? <Link to="/crear-usuario" className="login-link">Regístrate ahora</Link>
                        </small>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}