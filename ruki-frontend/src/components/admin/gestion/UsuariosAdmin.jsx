import { useState, useEffect } from "react";
import { obtenerUsuarios, crearUsuario, eliminarUsuario, actualizarUsuario } from "../../../services/UsuarioService"; 
import { motion, AnimatePresence } from "framer-motion";
import './UsuariosAdmin.css';

/*
    Variantes para las animaciónes 
    de los usuarios
*/
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export function UsuariosAdmin() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [editingId, setEditingId] = useState(null);

    const [formulario, setFormulario] = useState({
        firstName: "", lastName: "", email: "", password: ""
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const data = await obtenerUsuarios();
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando usuarios", error);
            setMensaje("Error al cargar la base de datos de usuarios.");
            setTimeout(() => setMensaje(""), 3500);
        }
    };

    const handleChange = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if (editingId) {
                const payload = {
                    firstName: formulario.firstName,
                    lastName: formulario.lastName,
                };
                if (formulario.password.trim() !== "") {
                    payload.password = formulario.password;
                }

                await actualizarUsuario(editingId, payload);
                setMensaje("¡Usuario actualizado con éxito!");
            } else {
                await crearUsuario(formulario);
                setMensaje("¡Usuario creado exitosamente!");
            }
            
            cancelarEdicion();
            cargarDatos();
        } catch (error) {
            setMensaje("Error: " + error.message);
        } finally {
            setLoading(false);
            setTimeout(() => setMensaje(""), 3500);
        }
    };

    const handleEliminar = async (id, nombre) => {
        if (!window.confirm(`¿Estás seguro de que deseas desactivar al usuario "${nombre}"?`)) return;
        try {
            await eliminarUsuario(id);
            setMensaje(`Usuario #${id} desactivado correctamente.`);
            cargarDatos();
        } catch (error) {
            setMensaje("Error al desactivar: " + error.message);
        } finally {
            setTimeout(() => setMensaje(""), 3500);
        }
    };

    const handleEditar = (usuario) => {
        setEditingId(usuario.id);
        setFormulario({
            firstName: usuario.firstName || "",
            lastName: usuario.lastName || "",
            email: usuario.email || "", 
            password: "" 
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelarEdicion = () => {
        setEditingId(null);
        setFormulario({ firstName: "", lastName: "", email: "", password: "" });
    };

    return (
        <div className="users-premium-wrapper">

            {/* LUCES AMBIENTALES */}
            <div className="usr-ambient-blob usr-blob-1"></div>
            <div className="usr-ambient-blob usr-blob-2"></div>

            <div className="container py-4 position-relative" style={{ zIndex: 1 }}>
                
                <motion.header 
                    className="usr-page-header-glass"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="usr-title">Gestión de Usuarios</h1>
                    <p className="usr-subtitle">Administra los accesos y la comunidad de <strong>RUKI</strong>.</p>
                </motion.header>
                
                <div className="usr-toast-container">
                    <AnimatePresence>
                        {mensaje && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: -20 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                className={`usr-toast-glass ${mensaje.includes("Error") ? "error" : "success"}`}
                            >
                                <i className={`fas ${mensaje.includes("Error") ? "fa-exclamation-triangle" : "fa-check-circle"} me-2 fs-5`}></i>
                                {mensaje}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.div className="row g-4" variants={containerVariants} initial="hidden" animate="visible">
                    
                    {/* PANEL IZQUIERDO CON EL FORMULARIO */}
                    <motion.div className="col-lg-4" variants={cardVariants}>
                        <div className="usr-card-glass">
                            <div className="usr-card-header d-flex justify-content-between align-items-center">
                                <div>
                                    <i className={`fas ${editingId ? 'fa-user-edit text-primary' : 'fa-user-plus text-success'} me-2`}></i>
                                    {editingId ? "Editando Usuario" : "Nuevo Usuario"}
                                </div>
                                {editingId && <span className="usr-badge badge-dark">ID: {editingId}</span>}
                            </div>
                            
                            <div className="p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6 usr-input-group">
                                            <label>Nombre</label>
                                            <div className="usr-input-wrapper">
                                                <i className="fas fa-font input-icon"></i>
                                                <input type="text" name="firstName" className="usr-input-glass w-100" required 
                                                       value={formulario.firstName} onChange={handleChange} placeholder="Ej: Juan" />
                                            </div>
                                        </div>
                                        <div className="col-6 usr-input-group">
                                            <label>Apellido</label>
                                            <div className="usr-input-wrapper">
                                                <i className="fas fa-id-card input-icon"></i>
                                                <input type="text" name="lastName" className="usr-input-glass w-100" required 
                                                       value={formulario.lastName} onChange={handleChange} placeholder="Ej: Pérez" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="usr-input-group mb-3">
                                        <label>Correo Electrónico</label>
                                        <div className="usr-input-wrapper">
                                            <i className="fas fa-envelope input-icon"></i>
                                            <input type="email" name="email" className="usr-input-glass w-100" required={!editingId} disabled={!!editingId}
                                                   value={formulario.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
                                        </div>
                                        {editingId && <span className="usr-helper-text mt-2"><i className="fas fa-lock me-1"></i>El correo no se puede modificar.</span>}
                                    </div>

                                    <div className="usr-input-group mb-4">
                                        <label>Contraseña</label>
                                        <div className="usr-input-wrapper">
                                            <i className="fas fa-key input-icon"></i>
                                            <input type="password" name="password" className="usr-input-glass w-100" required={!editingId} minLength="6"
                                                   value={formulario.password} onChange={handleChange} placeholder={editingId ? "Dejar en blanco para conservar" : "Mín. 6 caracteres"} />
                                        </div>
                                        {!editingId && <span className="usr-helper-text mt-2">Rol <strong>CLIENTE</strong> por defecto.</span>}
                                    </div>

                                    <motion.button whileTap={{ scale: 0.95 }} type="submit" className="usr-btn-primary w-100" disabled={loading}>
                                        {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>PROCESANDO...</> : (editingId ? "Guardar Cambios" : "Crear Usuario")}
                                    </motion.button>
                                    
                                    {editingId && (
                                        <motion.button whileTap={{ scale: 0.95 }} type="button" className="usr-btn-secondary w-100 mt-2" onClick={cancelarEdicion} disabled={loading}>
                                            Cancelar Edición
                                        </motion.button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </motion.div>

                    {/* PANEL DERECHO CON LA TABLA DE DATOS */}
                    <motion.div className="col-lg-8" variants={cardVariants}>
                        <div className="usr-card-glass h-100 d-flex flex-column">
                            <div className="usr-card-header d-flex justify-content-between align-items-center">
                                <div><i className="fas fa-address-book me-2 text-secondary"></i> Base de Datos de Usuarios</div>
                                <span className="usr-badge badge-light-blue">{usuarios.length} REGISTROS</span>
                            </div>
                            
                            <div className="usr-table-container flex-grow-1">
                                <table className="usr-table">
                                    <thead>
                                        <tr>
                                            <th className="ps-4">Usuario</th>
                                            <th>Contacto</th>
                                            <th>Rol</th>
                                            <th className="text-end pe-4">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {usuarios.map(u => {
                                                const roleStr = typeof u.role === 'object' ? u.role.name : u.role;
                                                const isAdmin = roleStr === 'ROLE_ADMIN' || roleStr === 'ADMIN';

                                                return (
                                                    <motion.tr 
                                                        key={u.id} 
                                                        layout
                                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, backgroundColor: "#ff3b3020" }}
                                                        className={editingId === u.id ? 'active-row' : ''}
                                                    >
                                                        <td className="ps-4">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div className="usr-avatar-fallback">
                                                                    {u.firstName ? u.firstName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="usr-item-name">{u.firstName} {u.lastName}</div>
                                                                    <div className="usr-item-id">ID: {u.id}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="usr-text-muted">{u.email}</td>
                                                        <td>
                                                            <span className={`usr-badge ${isAdmin ? 'badge-dark' : 'badge-neutral'}`}>
                                                                {isAdmin ? 'ADMINISTRADOR' : 'CLIENTE'}
                                                            </span>
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            <div className="d-flex justify-content-end gap-2">

                                                                {/* BOTÓN PARA EDITAR */}
                                                                <motion.button 
                                                                    whileHover={{ scale: 1.1 }} 
                                                                    whileTap={{ scale: 0.9 }} 
                                                                    className="usr-action-btn edit" 
                                                                    onClick={() => handleEditar(u)}
                                                                    title="Editar Usuario"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d="M12 20h9"></path>
                                                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                                                    </svg>
                                                                </motion.button>
                                                                
                                                                {/* BOTÓN PARA ELIMINAR */}
                                                                <motion.button 
                                                                    whileHover={{ scale: 1.1 }} 
                                                                    whileTap={{ scale: 0.9 }} 
                                                                    className="usr-action-btn delete" 
                                                                    onClick={() => handleEliminar(u.id, u.firstName)}
                                                                    title="Desactivar Usuario"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                                                    </svg>
                                                                </motion.button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </AnimatePresence>
                                        {usuarios.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center py-5">
                                                    <div className="usr-empty-state">
                                                        <i className="fas fa-users-slash mb-3"></i>
                                                        <p>No hay usuarios registrados en el sistema.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
}