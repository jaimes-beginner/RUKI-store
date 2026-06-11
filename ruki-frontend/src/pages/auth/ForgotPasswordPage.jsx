import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { forgotPassword } from "@/services/AuthService"; 
import "./LoginPage.css";

const REGEX_CORREO = /^[\w.-]+@(gmail\.com|ruki\.com|test\.com)$/i;

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [correo, setCorreo] = useState("");
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!correo.trim()) {
            setError("El correo es obligatorio.");
            return;
        } else if (!REGEX_CORREO.test(correo)) {
            setError("Formato de correo no válido.");
            return;
        }

        setLoading(true);
        setError("");
        setMensaje(null);

        try {
            const respuesta = await forgotPassword(correo);
            setMensaje(respuesta); 
        } catch (err) {
            setError(err.message || "Error al solicitar la recuperación.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-main-wrapper">
            <div className="login-glow-container">
                <div className="login-glow-blob login-blob-1"></div>
                <div className="login-glow-blob login-blob-2"></div>
            </div>

            <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', position: 'relative', zIndex: 1 }}>
                <motion.div 
                    className="ios-login-card-glass w-100" 
                    style={{ maxWidth: "420px" }}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <div className="text-center mb-4">
                        <div className="login-icon-glass mx-auto mb-3"><i className="fas fa-envelope-open-text"></i></div>
                        <h2 className="login-title">Recuperar Clave</h2>
                        <p className="login-subtitle">Te enviaremos un enlace de acceso</p>
                    </div>

                    <AnimatePresence>
                        {mensaje && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 24 }} className="ios-alert-glass alert-success-glass">
                                <i className="fas fa-check-circle me-2"></i> {mensaje}
                            </motion.div>
                        )}
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 24 }} className="ios-alert-glass alert-error-glass">
                                <i className="fas fa-exclamation-circle me-2"></i> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!mensaje && (
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="ios-input-group mb-4">
                                <label>Correo Electrónico</label>
                                <div className="ios-input-wrapper">
                                    <i className="fas fa-envelope input-icon"></i>
                                    <input type="email" placeholder="nombre@gmail.com" className={`ios-input-field ${error ? "is-invalid" : ""}`} value={correo} onChange={(e) => { setCorreo(e.target.value); setError(""); }} required />
                                </div>
                            </div>

                            <div className="d-grid gap-3">
                                <motion.button whileTap={!loading ? { scale: 0.96 } : {}} type="submit" className="ios-btn-login" disabled={loading}>
                                    {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Enviando...</> : "Enviar enlace"}
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={() => navigate("/login")} className="ios-btn-back">
                                    Volver al Login
                                </motion.button>
                            </div>
                        </form>
                    )}

                    {mensaje && (
                        <div className="d-grid mt-4">
                            <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={() => navigate("/login")} className="ios-btn-back">
                                Volver al Login
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}