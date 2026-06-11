import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { resetPassword } from "@/services/AuthService"; 
import "./LoginPage.css"; 

const REGEX_CONTRASENA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) { setError("No se detectó un token de seguridad válido."); return; }
        if (!REGEX_CONTRASENA.test(passwords.newPassword)) { setError("La contraseña no cumple el formato de seguridad."); return; }
        if (passwords.newPassword !== passwords.confirmPassword) { setError("Las contraseñas no coinciden."); return; }

        setLoading(true);
        setError("");

        try {
            const respuesta = await resetPassword(token, passwords.newPassword);
            setMensaje(respuesta);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.message || "Error al actualizar la contraseña.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="login-main-wrapper d-flex justify-content-center align-items-center">
                <div className="login-glow-container"><div className="login-glow-blob login-blob-1"></div></div>
                <div className="ios-alert-glass alert-error-glass p-4 text-center" style={{ zIndex: 1, maxWidth: '400px' }}>
                    <h3><i className="fas fa-lock text-danger mb-3"></i></h3>
                    <h5 className="text-white">Acceso Inválido</h5>
                    <p className="text-muted">No se encontró un token de recuperación en la URL.</p>
                    <button onClick={() => navigate("/login")} className="ios-btn-back w-100 mt-3">Ir al Login</button>
                </div>
            </div>
        );
    }

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
                >
                    <div className="text-center mb-4">
                        <div className="login-icon-glass mx-auto mb-3"><i className="fas fa-key"></i></div>
                        <h2 className="login-title">Nueva Contraseña</h2>
                        <p className="login-subtitle">Ingresa una contraseña segura</p>
                    </div>

                    <AnimatePresence>
                        {mensaje && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 24 }} className="ios-alert-glass alert-success-glass">
                                <i className="fas fa-check-circle me-2"></i> {mensaje} Redirigiendo...
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
                            <div className="ios-input-group mb-3">
                                <label>Nueva Contraseña</label>
                                <div className="ios-input-wrapper">
                                    <i className="fas fa-lock input-icon"></i>
                                    <input type="password" className="ios-input-field" placeholder="••••••••" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} required />
                                </div>
                            </div>

                            <div className="ios-input-group mb-4">
                                <label>Confirmar Contraseña</label>
                                <div className="ios-input-wrapper">
                                    <i className="fas fa-check-double input-icon"></i>
                                    <input type="password" className="ios-input-field" placeholder="••••••••" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} required />
                                </div>
                            </div>

                            <div className="d-grid gap-3">
                                <motion.button whileTap={!loading ? { scale: 0.96 } : {}} type="submit" className="ios-btn-login" disabled={loading}>
                                    {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Guardando...</> : "Actualizar Contraseña"}
                                </motion.button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
}