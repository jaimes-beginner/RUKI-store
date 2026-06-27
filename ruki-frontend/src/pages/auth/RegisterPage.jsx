import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registrarUsuario } from "@/services/AuthService"; 
import { motion, AnimatePresence } from "framer-motion";
import "./RegisterPage.css"; 

const REGEX_CORREO = /^[\w.-]+@(gmail\.com|ruki\.com|test\.com)$/i;
const REGEX_CONTRASENA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export default function RegisterPage() {
    const navigate = useNavigate();
    
    // Estado limpio, solo lo esencial
    const [usuario, setUsuario] = useState({
        firstName: "", 
        lastName: "", 
        correo: "", 
        contrasena: ""
    });
    
    const [errores, setErrores] = useState({});
    const [mensaje, setMensaje] = useState(null);
    const [loading, setLoading] = useState(false);

    const validarCampo = (name, value) => {
        let errorMsg = "";
        switch (name) {
            case "firstName": if (!value.trim()) errorMsg = "El nombre es obligatorio."; break;
            case "lastName": if (!value.trim()) errorMsg = "El apellido es obligatorio."; break;
            case "correo":
                if (!value.trim()) errorMsg = "El correo es obligatorio.";
                else if (!REGEX_CORREO.test(value)) errorMsg = "Solo se aceptan correos @gmail.com.";
                break;
            case "contrasena":
                if (!value.trim()) errorMsg = "La contraseña es obligatoria.";
                else if (!REGEX_CONTRASENA.test(value)) errorMsg = "Mín. 8 caracteres, mayúscula, minúscula, número y especial.";
                break;
            default: break;
        }
        return errorMsg;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario(prev => ({ ...prev, [name]: value }));
        setErrores(prev => ({ ...prev, [name]: validarCampo(name, value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nuevosErrores = {};
        let tieneErrores = false;

        Object.keys(usuario).forEach((key) => {
            const error = validarCampo(key, usuario[key]);
            nuevosErrores[key] = error;
            if (error) tieneErrores = true;
        });

        setErrores(nuevosErrores);

        if (tieneErrores) {
            setMensaje({ texto: "Corrige los errores en rojo antes de continuar.", tipo: "error" });
            setTimeout(() => setMensaje(null), 3500);
            return;
        }

        setLoading(true);
        try {
            // Payload limpio, exactamente lo que pide el backend
            await registrarUsuario({
                email: usuario.correo,
                password: usuario.contrasena,
                firstName: usuario.firstName,
                lastName: usuario.lastName
            });
            
            setMensaje({ texto: "Usuario creado con éxito. Redirigiendo...", tipo: "success" });
            setTimeout(() => navigate("/login"), 1500); 
        } catch (error) {
            setMensaje({ texto: "Error: " + error.message, tipo: "error" });
            setLoading(false);
        }
    };

    return (
        <div className="register-main-wrapper">
            <div className="register-glow-container">
                <div className="register-ambient-blob register-blob-1"></div>
                <div className="register-ambient-blob register-blob-2"></div>
            </div>

            <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '85vh', position: 'relative', zIndex: 1 }}>
                <motion.div 
                    className="ios-register-card-glass w-100" 
                    style={{ maxWidth: "500px" }} // Tarjeta más angosta y elegante
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <div className="text-center mb-4">
                        <div className="register-icon-glass mx-auto mb-3"><i className="fas fa-user-plus"></i></div>
                        <h2 className="register-title">Únete a RUKI</h2>
                        <p className="register-subtitle">Crea tu cuenta y eleva tu performance</p>
                    </div>

                    <AnimatePresence>
                        {mensaje && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className={`ios-alert-glass ${mensaje.tipo === "success" ? "alert-success-glass" : "alert-error-glass"}`}
                            >
                                {mensaje.tipo === "success" ? <i className="fas fa-check-circle me-2"></i> : <i className="fas fa-exclamation-circle me-2"></i>}
                                {mensaje.texto}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="row g-3 mb-3">
                            <div className="col-md-6 ios-input-group">
                                <label>Nombre *</label>
                                <div className="ios-input-wrapper">
                                    <i className="fas fa-user input-icon"></i>
                                    <input type="text" name="firstName" placeholder="Ej: Juan" value={usuario.firstName} onChange={handleChange} className={`ios-input-field ${errores.firstName ? "is-invalid" : usuario.firstName ? "is-valid" : ""}`} />
                                </div>
                                <AnimatePresence>{errores.firstName && <motion.div initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-5}} className="input-error-text">{errores.firstName}</motion.div>}</AnimatePresence>
                            </div>
                            <div className="col-md-6 ios-input-group">
                                <label>Apellido *</label>
                                <div className="ios-input-wrapper">
                                    <i className="fas fa-id-badge input-icon"></i>
                                    <input type="text" name="lastName" placeholder="Ej: Pérez" value={usuario.lastName} onChange={handleChange} className={`ios-input-field ${errores.lastName ? "is-invalid" : usuario.lastName ? "is-valid" : ""}`} />
                                </div>
                                <AnimatePresence>{errores.lastName && <motion.div initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-5}} className="input-error-text">{errores.lastName}</motion.div>}</AnimatePresence>
                            </div>
                        </div>

                        <div className="ios-input-group mb-3">
                            <label>Correo Electrónico *</label>
                            <div className="ios-input-wrapper">
                                <i className="fas fa-envelope input-icon"></i>
                                <input type="email" name="correo" placeholder="nombre@gmail.com" value={usuario.correo} onChange={handleChange} className={`ios-input-field ${errores.correo ? "is-invalid" : usuario.correo && !errores.correo ? "is-valid" : ""}`} />
                            </div>
                            <AnimatePresence>{errores.correo && <motion.div initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-5}} className="input-error-text">{errores.correo}</motion.div>}</AnimatePresence>
                        </div>
                        
                        <div className="ios-input-group mb-4">
                            <label>Contraseña *</label>
                            <div className="ios-input-wrapper">
                                <i className="fas fa-lock input-icon"></i>
                                <input type="password" name="contrasena" placeholder="••••••••" value={usuario.contrasena} onChange={handleChange} className={`ios-input-field ${errores.contrasena ? "is-invalid" : usuario.contrasena && !errores.contrasena ? "is-valid" : ""}`} />
                            </div>
                            <AnimatePresence>{errores.contrasena && <motion.div initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-5}} className="input-error-text">{errores.contrasena}</motion.div>}</AnimatePresence>
                        </div>

                        <div className="d-flex flex-column gap-3 pt-2">
                            <motion.button 
                                whileTap={!loading ? { scale: 0.96 } : {}} 
                                type="submit" 
                                className="ios-btn-register w-100" 
                                disabled={loading}
                            >
                                {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Guardando...</> : "Crear Cuenta"}
                            </motion.button>
                            <motion.button 
                                whileTap={{ scale: 0.96 }}
                                type="button" 
                                onClick={() => navigate(-1)} 
                                className="ios-btn-back w-100"
                            >
                                Cancelar
                            </motion.button>
                        </div>
                    </form>

                    <div className="register-footer">
                        <small>
                            ¿Ya tienes una cuenta? <Link to="/login" className="register-link">Inicia sesión aquí</Link>
                        </small>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}