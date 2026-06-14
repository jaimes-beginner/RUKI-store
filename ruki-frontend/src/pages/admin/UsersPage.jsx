import { useState, useEffect } from "react";
import { obtenerUsuariosPaginados, crearUsuario, eliminarUsuario, actualizarUsuario, reactivarUsuario } from "@/services/UsuarioService"; 
import { motion, AnimatePresence } from "framer-motion";
import './UsersPage.css'; 

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

export default function UsersPage() {
    const Motion = motion;
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [usuarioToDelete, setUsuarioToDelete] = useState(null);
    const [showReactivateModal, setShowReactivateModal] = useState(false);
    const [usuarioToReactivate, setUsuarioToReactivate] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [formulario, setFormulario] = useState({ firstName: "", lastName: "", email: "", password: "" });

    useEffect(() => { cargarDatos(); }, [currentPage]);

    const cargarDatos = async () => {
        try {
            const data = await obtenerUsuariosPaginados(currentPage, 9);
            setUsuarios(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error cargando usuarios", error);
            setMensaje("Error al cargar la base de datos de usuarios.");
            setTimeout(() => setMensaje(""), 3500);
        }
    };

    const handleChange = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                const payload = { firstName: formulario.firstName, lastName: formulario.lastName };
                if (formulario.password.trim() !== "") payload.password = formulario.password;
                await actualizarUsuario(editingId, payload);
                setMensaje("¡Usuario actualizado con éxito!");
            } else {
                await crearUsuario(formulario);
                setMensaje("¡Usuario creado exitosamente!");
            }
            cancelarEdicion();
            cargarDatos();
        } catch (error) { setMensaje("Error: " + error.message); } 
        finally { setLoading(false); setTimeout(() => setMensaje(""), 3500); }
    };

    const handleEliminar = (id, nombre) => { setUsuarioToDelete({ id, nombre }); setShowDeleteModal(true); };
    const confirmarEliminar = async () => {
        if (!usuarioToDelete) return;
        try {
            await eliminarUsuario(usuarioToDelete.id);
            setMensaje(`Usuario #${usuarioToDelete.id} desactivado correctamente.`);
            cargarDatos();
        } catch (error) { setMensaje("Error al desactivar: " + error.message); } 
        finally { setShowDeleteModal(false); setUsuarioToDelete(null); setTimeout(() => setMensaje(""), 3500); }
    };

    const handleReactivar = (id, nombre) => { setUsuarioToReactivate({ id, nombre }); setShowReactivateModal(true); };
    const confirmarReactivar = async () => {
        if (!usuarioToReactivate) return;
        try {
            await reactivarUsuario(usuarioToReactivate.id);
            setMensaje(`Usuario #${usuarioToReactivate.id} reactivado correctamente.`);
            cargarDatos();
        } catch (error) { setMensaje("Error al reactivar: " + error.message); } 
        finally { setShowReactivateModal(false); setUsuarioToReactivate(null); setTimeout(() => setMensaje(""), 3500); }
    };

    const handleEditar = (usuario) => {
        setEditingId(usuario.id);
        setFormulario({ firstName: usuario.firstName || "", lastName: usuario.lastName || "", email: usuario.email || "", password: "" });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelarEdicion = () => { setEditingId(null); setFormulario({ firstName: "", lastName: "", email: "", password: "" }); };
    const formatearFecha = (fechaString) => {
        if (!fechaString) return '—';
        return new Date(fechaString).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="users-premium-wrapper">
            <div className="usr-glow-container">
                <div className="usr-glow-blob usr-blob-cyan"></div>
                <div className="usr-glow-blob usr-blob-purple"></div>
            </div>

            <div className="container py-4 position-relative">
                {/* CABECERA ALINEADA A LA IZQUIERDA */}
                <motion.header className="usr-page-header text-start" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="usr-title">Gestión de Usuarios</h1>
                    <p className="usr-subtitle">Administra los accesos y la comunidad de <strong>RUKI</strong>.</p>
                </motion.header>

                <div className="usr-toast-container">
                    <AnimatePresence>
                        {mensaje && (
                            <Motion.div initial={{ opacity: 0, scale: 0.9, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className={`usr-toast ${mensaje.includes("Error") ? "error" : "success"}`}>
                                <i className={`fas ${mensaje.includes("Error") ? "fa-exclamation-triangle" : "fa-check-circle"} me-2 fs-5`}></i>{mensaje}
                            </Motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {showDeleteModal && (
                        <div className="usr-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
                            <Motion.div className="usr-modal-content text-center" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                                <div className="mb-3">
                                    <div className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '64px', height: '64px', backgroundColor: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.3)' }}>
                                        <i className="fas fa-user-slash fa-2x" style={{ color: '#ff3b30' }}></i>
                                    </div>
                                    <h4 className="fw-bolder text-white mb-2">Desactivar usuario</h4>
                                    <p className="text-secondary mb-0">¿Deseas desactivar a {usuarioToDelete?.nombre || 'este usuario'}? Esta acción se puede revertir desde la base de datos.</p>
                                </div>
                                <div className="d-flex gap-2 mt-4">
                                    <button className="flex-fill usr-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                                    <button className="flex-fill usr-btn-primary" onClick={confirmarEliminar}>Confirmar</button>
                                </div>
                            </Motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showReactivateModal && (
                        <div className="usr-modal-backdrop" onClick={() => setShowReactivateModal(false)}>
                            <Motion.div className="usr-modal-content text-center" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                                <div className="mb-3">
                                    <div className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '64px', height: '64px', backgroundColor: 'rgba(48, 209, 88, 0.1)', border: '1px solid rgba(48, 209, 88, 0.3)' }}>
                                        <i className="fas fa-user-check fa-2x" style={{ color: '#30d158' }}></i>
                                    </div>
                                    <h4 className="fw-bolder text-white mb-2">Reactivar usuario</h4>
                                    <p className="text-secondary mb-0">¿Deseas devolverle el acceso al sistema a {usuarioToReactivate?.nombre}?</p>
                                </div>
                                <div className="d-flex gap-2 mt-4">
                                    <button className="flex-fill usr-btn-secondary" onClick={() => setShowReactivateModal(false)}>Cancelar</button>
                                    <button className="flex-fill usr-btn-primary" style={{ background: '#30d158', color: '#000' }} onClick={confirmarReactivar}>Reactivar</button>
                                </div>
                            </Motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <motion.div className="row g-4 align-items-start" variants={containerVariants} initial="hidden" animate="visible">
                    
                    {/* TARJETA DE FORMULARIO ALINEADA A LA IZQUIERDA */}
                    <motion.div className="col-lg-4" variants={cardVariants}>
                        <div className="usr-card text-start">
                            <div className="usr-card-header d-flex justify-content-between align-items-center">
                                <div><i className={`fas ${editingId ? 'fa-user-edit text-primary' : 'fa-user-plus'} me-2`}></i>{editingId ? "Editando Usuario" : "Nuevo Usuario"}</div>
                                {editingId && <span className="usr-badge badge-dark">ID: {editingId}</span>}
                            </div>
                            <div className="p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6 usr-input-group">
                                            <label>Nombre</label>
                                            <div className="usr-input-wrapper">
                                                <i className="fas fa-font input-icon"></i>
                                                <input type="text" name="firstName" className="usr-input w-100" required value={formulario.firstName} onChange={handleChange} placeholder="Ej: Juan" />
                                            </div>
                                        </div>
                                        <div className="col-6 usr-input-group">
                                            <label>Apellido</label>
                                            <div className="usr-input-wrapper">
                                                <i className="fas fa-id-card input-icon"></i>
                                                <input type="text" name="lastName" className="usr-input w-100" required value={formulario.lastName} onChange={handleChange} placeholder="Ej: Pérez" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="usr-input-group mb-3">
                                        <label>Correo Electrónico</label>
                                        <div className="usr-input-wrapper">
                                            <i className="fas fa-envelope input-icon"></i>
                                            <input type="email" name="email" className="usr-input w-100" required={!editingId} disabled={!!editingId} value={formulario.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
                                        </div>
                                        {editingId && <span className="usr-helper-text mt-2"><i className="fas fa-lock me-1"></i>El correo no se puede modificar.</span>}
                                    </div>
                                    <div className="usr-input-group mb-4">
                                        <label>Contraseña</label>
                                        <div className="usr-input-wrapper">
                                            <i className="fas fa-key input-icon"></i>
                                            <input type="password" name="password" className="usr-input w-100" required={!editingId} minLength="6" value={formulario.password} onChange={handleChange} placeholder={editingId ? "Dejar en blanco para conservar" : "Mín. 6 caracteres"} />
                                        </div>
                                        {!editingId && <span className="usr-helper-text mt-2">Rol <strong>CLIENTE</strong> por defecto.</span>}
                                    </div>
                                    <motion.button whileTap={{ scale: 0.95 }} type="submit" className="usr-btn-primary w-100" disabled={loading}>
                                        {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Procesando...</> : (editingId ? "Guardar Cambios" : "Crear Usuario")}
                                    </motion.button>
                                    {editingId && <motion.button whileTap={{ scale: 0.95 }} type="button" className="usr-btn-secondary w-100 mt-2" onClick={cancelarEdicion} disabled={loading}>Cancelar Edición</motion.button>}
                                </form>
                            </div>
                        </div>
                    </motion.div>

                    {/* TARJETA DE TABLA ALINEADA A LA IZQUIERDA */}
                    <motion.div className="col-lg-8" variants={cardVariants}>
                        <div className="usr-card h-100 d-flex flex-column text-start">
                            <div className="usr-card-header d-flex justify-content-between align-items-center">
                                <div><i className="fas fa-address-book me-2 opacity-50"></i> Base de Datos de Usuarios</div>
                                <span className="usr-badge badge-light-blue">{usuarios.length} REGISTROS</span>
                            </div>
                            <div className="usr-table-container flex-grow-1">
                                <table className="usr-table">
                                    <thead>
                                        <tr>
                                            <th className="ps-4 text-start">Usuario</th>
                                            <th className="text-start">Contacto</th>
                                            <th className="text-start">Registro</th>
                                            <th className="text-start">Rol</th>
                                            <th className="text-start">Estado</th>
                                            <th className="text-end pe-4">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {usuarios.map(u => {
                                                const roleStr = typeof u.role === 'object' ? u.role.name : u.role;
                                                const isAdmin = roleStr === 'ROLE_ADMIN' || roleStr === 'ADMIN';
                                                return (
                                                    <motion.tr key={u.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, backgroundColor: "#ff3b3020" }} className={editingId === u.id ? 'active-row' : ''}>
                                                        <td className="ps-4 text-start">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div>
                                                                    <div className="usr-item-name" style={{ fontSize: '11px' }}>{u.firstName} {u.lastName}</div>
                                                                    <div className="usr-item-id" style={{ fontSize: '9px' }}>ID Registro | {u.id}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="usr-text-muted text-start" style={{ fontSize: '11px' }}>{u.email}</td>
                                                        <td className="usr-text-muted text-start" style={{ fontSize: '11px' }}>{formatearFecha(u.createdAt)}</td>
                                                        <td className="text-start"><span className={`usr-badge ${isAdmin ? 'badge-dark' : 'badge-neutral'}`}>{isAdmin ? 'ADMINISTRADOR' : 'CLIENTE'}</span></td>
                                                        <td className="text-start"><span className={`usr-badge ${u.active ? 'badge-active' : 'badge-inactive'}`}>{u.active ? 'ACTIVO' : 'INACTIVO'}</span></td>
                                                        <td className="text-end pe-4">
                                                            <div className="d-flex justify-content-end gap-2">
                                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="usr-action-btn edit" onClick={() => handleEditar(u)} title="Editar Usuario"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></motion.button>
                                                                {u.active ? (
                                                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="usr-action-btn delete" onClick={() => handleEliminar(u.id, u.firstName)} title="Desactivar Usuario"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></motion.button>
                                                                ) : (
                                                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="usr-action-btn reactivate" onClick={() => handleReactivar(u.id, u.firstName)} title="Reactivar Usuario"><i className="fas fa-user-check"></i></motion.button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </AnimatePresence>
                                        {usuarios.length === 0 && <tr><td colSpan="6" className="text-center py-5"><div className="usr-empty-state"><i className="fas fa-users-slash mb-3"></i><p>No hay usuarios registrados en el sistema.</p></div></td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center align-items-center gap-3 p-3 border-top border-dark" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <button className="btn btn-sm btn-outline-light" disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)}><i className="fas fa-chevron-left"></i> Anterior</button>
                                    <span className="text-white fw-bold" style={{ fontSize: '12px' }}>Página {currentPage + 1} de {totalPages}</span>
                                    <button className="btn btn-sm btn-outline-light" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(prev => prev + 1)}>Siguiente <i className="fas fa-chevron-right"></i></button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}