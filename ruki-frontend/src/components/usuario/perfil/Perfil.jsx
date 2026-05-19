import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { obtenerMiPerfil, actualizarUsuario, crearDireccion, obtenerDireccionesActivasPorUsuario, eliminarDireccion } from '../../../services/UsuarioService';
import { Modal } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import './Perfil.css';
import { regiones } from '../../../data/Regiones';

export function Perfil() {
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const [perfil, setPerfil] = useState(null);
    const [direcciones, setDirecciones] = useState([]);

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '' });

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressForm, setAddressForm] = useState({
        street: '', city: '', region: '', zipCode: '', referenceInfo: ''
    });

    // Estados para el Modal de Eliminación (Glassmorphism)
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });

    const mostrarToast = (mensaje, tipo) => {
        setToast({ mostrar: true, mensaje, tipo });
        setTimeout(() => setToast(prev => ({ ...prev, mostrar: false })), 3500);
    };

    useEffect(() => {
        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cargarDatos = async () => {
        try {
            const [profileData, addressData] = await Promise.all([
                obtenerMiPerfil(),
                obtenerDireccionesActivasPorUsuario(usuario.id) // Usando el endpoint de Soft Delete
            ]);
            setPerfil(profileData);
            setDirecciones(addressData);
            setFormData({ firstName: profileData.firstName, lastName: profileData.lastName });
        } catch (err) {
            mostrarToast('Error al cargar los datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const updatePayload = { ...formData };
            await actualizarUsuario(perfil.id, updatePayload);
            mostrarToast('Perfil actualizado con éxito', 'success');
            setEditMode(false);
            await cargarDatos();
        } catch (err) {
            mostrarToast(err.message || 'Error al actualizar', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await crearDireccion({ ...addressForm, userId: perfil.id });
            mostrarToast('Dirección agregada con éxito', 'success');
            setShowAddressModal(false);
            setAddressForm({ street: '', city: '', region: '', zipCode: '', referenceInfo: '' });
            await cargarDatos();
        } catch (err) {
            mostrarToast(err.message || 'Error al agregar dirección', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Nueva función consolidada para confirmar la eliminación
    const confirmDeleteAddress = async () => {
        if (!addressToDelete) return;
        setActionLoading(true);
        try {
            await eliminarDireccion(addressToDelete);
            mostrarToast('Dirección eliminada correctamente', 'success');
            setShowDeleteModal(false); // Cerramos el modal rojo
            setAddressToDelete(null);  // Limpiamos el ID seleccionado
            await cargarDatos();       // Refrescamos la UI
        } catch (err) {
            mostrarToast(err.message || 'Error al eliminar dirección', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] } }
    };

    const listItemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    const comunasDisponibles = regiones.find(r => r.nombre === addressForm.region)?.comunas || [];

    return (
        <div className="profile-main-wrapper">

            {/* LUCES DE FONDO DE PERFIL */}
            <div className="profile-glow-container">
                <div className="profile-glow-blob profile-blob-blue"></div>
                <div className="profile-glow-blob profile-blob-purple"></div>
            </div>

            <div className="container mt-5 mb-5 position-relative" style={{ zIndex: 1 }}>

                {/* CABECERA */}
                <motion.div
                    className="profile-page-header-glass"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1>Mi Cuenta</h1>
                    <p>Gestiona tu <strong>perfil</strong> y tus <strong>direcciones de envío</strong>.</p>
                </motion.div>

                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                            <i className="fas fa-circle-notch fa-spin fa-3x mb-3" style={{ color: '#0a84ff' }}></i>
                            <p className="text-secondary fw-semibold">Sincronizando tus datos...</p>
                        </motion.div>
                    </div>
                ) : (
                    <motion.div
                        className="row g-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* COLUMNA IZQUIERDA: INFORMACIÓN PERSONAL */}
                        <motion.div className="col-md-5" variants={cardVariants}>
                            <div className="profile-card-glass h-100">
                                <div className="profile-header-glass d-flex justify-content-between align-items-center">
                                    <div>
                                        <i className="fas fa-user-circle me-2" style={{ color: '#0a84ff' }}></i>
                                        Información Personal
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="btn-edit-toggle"
                                        onClick={() => setEditMode(!editMode)}
                                    >
                                        {editMode ? 'Cancelar' : 'Editar'}
                                    </motion.button>
                                </div>
                                <div className="card-body p-4">
                                    <form onSubmit={handleUpdateProfile}>
                                        <div className="ios-input-group mb-3">
                                            <label className="ios-label">Nombre</label>
                                            <div className="ios-input-wrapper">
                                                <i className="fas fa-user input-icon"></i>
                                                <input type="text" className="ios-input-glass w-100" disabled={!editMode} required
                                                    value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="ios-input-group mb-3">
                                            <label className="ios-label">Apellido</label>
                                            <div className="ios-input-wrapper">
                                                <i className="fas fa-id-badge input-icon"></i>
                                                <input type="text" className="ios-input-glass w-100" disabled={!editMode} required
                                                    value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="ios-input-group mb-3">
                                            <label className="ios-label">Correo Electrónico</label>
                                            <div className="ios-input-wrapper">
                                                <i className="fas fa-envelope input-icon"></i>
                                                <input type="email" className="ios-input-glass w-100" disabled value={perfil.email} />
                                            </div>
                                            <div className="input-helper-text mt-1">
                                                <i className="fas fa-lock me-1"></i>No editable por seguridad
                                            </div>
                                        </div>

                                        {/* RECUPERAR CONTRASEÑA */}
                                        <div className="ios-input-group mb-4 mt-4 pt-4 border-top border-dark" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                                            <label className="ios-label">Seguridad</label>
                                            <motion.button
                                                type="button"
                                                whileTap={{ scale: 0.95 }}
                                                className="ios-btn ios-btn-outline w-100 d-flex justify-content-center align-items-center"
                                                onClick={() => navigate('/forgot-password')}
                                            >
                                                <i className="fas fa-key me-2"></i> Cambiar mi contraseña
                                            </motion.button>
                                            <div className="input-helper-text mt-2 text-center opacity-75">
                                                Te enviaremos un enlace seguro a tu correo.
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {editMode && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    <motion.button
                                                        whileTap={{ scale: 0.95 }}
                                                        type="submit"
                                                        className="ios-btn ios-btn-dark w-100"
                                                        disabled={actionLoading}
                                                    >
                                                        {actionLoading ? <><i className="fas fa-spinner fa-spin me-2"></i>GUARDANDO...</> : "GUARDAR CAMBIOS"}
                                                    </motion.button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </form>
                                </div>
                            </div>
                        </motion.div>

                        {/* COLUMNA DERECHA: DIRECCIONES */}
                        <motion.div className="col-md-7" variants={cardVariants}>
                            <div className="profile-card-glass h-100 d-flex flex-column">
                                <div className="profile-header-glass d-flex justify-content-between align-items-center">
                                    <div>
                                        <i className="fas fa-map-marker-alt me-2" style={{ color: '#ff3b30' }}></i>
                                        Mis Direcciones
                                    </div>
                                    <span className="ios-badge-glass-subtle">
                                        {direcciones.length} REGISTRADAS
                                    </span>
                                </div>

                                <div className="card-body p-0 flex-grow-1">
                                    {direcciones.length === 0 ? (
                                        <div className="empty-address-state">
                                            <div className="empty-icon-glass">
                                                <i className="fas fa-home fa-2x"></i>
                                            </div>
                                            <p>No tienes direcciones registradas.</p>
                                        </div>
                                    ) : (
                                        <motion.div className="address-list" variants={containerVariants} initial="hidden" animate="visible">
                                            {direcciones.map((dir) => (
                                                <motion.div key={dir.id} className="address-item d-flex justify-content-between align-items-center" variants={listItemVariants}>
                                                    <div>
                                                        <div className="address-street">{dir.street}</div>
                                                        <div className="address-details">
                                                            {dir.city}, {dir.region} {dir.referenceInfo ? ` • ${dir.referenceInfo}` : ''}
                                                        </div>
                                                        <div className="mt-1">
                                                            <span className="ios-badge-zipcode">
                                                                C.P: {dir.zipCode || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* BOTÓN ELIMINAR -> ACTIVA MODAL */}
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="btn btn-sm btn-outline-danger border-0 d-flex justify-content-center align-items-center"
                                                        style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(255, 59, 48, 0.1)' }}
                                                        onClick={() => {
                                                            setAddressToDelete(dir.id);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        disabled={actionLoading}
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </motion.button>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>

                                <div className="p-4 border-top border-dark" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        className="ios-btn ios-btn-outline w-100"
                                        onClick={() => setShowAddressModal(true)}
                                    >
                                        <i className="fas fa-plus me-2"></i> AGREGAR NUEVA DIRECCIÓN
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* MODAL: NUEVA DIRECCIÓN */}
                <Modal
                    show={showAddressModal}
                    onHide={() => setShowAddressModal(false)}
                    centered
                    backdrop="static"
                    contentClassName="profile-modal-glass"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    ></motion.div>
                    <div className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="modal-custom-title mb-0">Nueva Dirección</h4>
                            <button type="button" className="btn-close-glass" onClick={() => setShowAddressModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleAddAddress}>
                            <div className="ios-input-group mb-3">
                                <label className="ios-label">Calle y Número *</label>
                                <div className="ios-input-wrapper">
                                    <i className="fas fa-route input-icon"></i>
                                    <input type="text" className="ios-input-glass w-100" required placeholder="Ej: Av. Providencia 1234"
                                        value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} />
                                </div>
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-6 ios-input-group">
                                    <label className="ios-label">Región *</label>
                                    <div className="ios-input-wrapper">
                                        <i className="fas fa-map input-icon"></i>
                                        <select
                                            className="ios-select-glass w-100"
                                            required
                                            value={addressForm.region}
                                            onChange={e => setAddressForm({ ...addressForm, region: e.target.value, city: '' })}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {regiones.map(r => (
                                                <option key={r.nombre} value={r.nombre}>{r.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-6 ios-input-group">
                                    <label className="ios-label">Comuna *</label>
                                    <div className="ios-input-wrapper">
                                        <i className="fas fa-city input-icon"></i>
                                        <select
                                            className="ios-select-glass w-100"
                                            required
                                            disabled={!addressForm.region}
                                            value={addressForm.city}
                                            onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                        >
                                            <option value="" style={{ color: '#a1a1a6', background: '#111111' }}>Seleccionar...</option>
                                            {comunasDisponibles.map((c, i) => (
                                                <option key={i} value={c} style={{ color: '#ffffff', background: '#111111' }}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="ios-input-group mb-3">
                                <label className="ios-label">Código Postal (Opcional)</label>
                                <div className="ios-input-wrapper">
                                    <i className="fas fa-mail-bulk input-icon"></i>
                                    <input type="text" className="ios-input-glass w-100" placeholder="Ej: 7500000"
                                        value={addressForm.zipCode} onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })} />
                                </div>
                            </div>
                            <div className="ios-input-group mb-4">
                                <label className="ios-label">Referencias (Opcional)</label>
                                <textarea className="ios-input-glass w-100" rows="2" placeholder="Ej: Casa esquina, portón negro..."
                                    style={{ resize: 'none', paddingLeft: '16px' }}
                                    value={addressForm.referenceInfo} onChange={e => setAddressForm({ ...addressForm, referenceInfo: e.target.value })}></textarea>
                            </div>

                            <div className="d-flex gap-2">
                                <motion.button whileTap={{ scale: 0.95 }} type="button" className="ios-btn ios-btn-outline w-100" onClick={() => setShowAddressModal(false)}>
                                    CANCELAR
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="ios-btn ios-btn-dark w-100" disabled={actionLoading}>
                                    {actionLoading ? <><i className="fas fa-spinner fa-spin me-2"></i>GUARDANDO</> : "GUARDAR"}
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </Modal>

                {/* MODAL: CONFIRMACIÓN ELIMINAR DIRECCIÓN (GLASS/DANGER) */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered contentClassName="profile-modal-glass border-danger-glass">
                    <div className="p-4 text-center">
                        <div className="mb-4">
                            <div className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '64px', height: '64px', backgroundColor: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.3)' }}>
                                <i className="fas fa-exclamation-triangle fa-2x" style={{ color: '#ff3b30' }}></i>
                            </div>
                            <h4 className="modal-custom-title mb-2">¿Eliminar Dirección?</h4>
                            <p className="text-secondary small mb-0" style={{ color: '#a1a1a6' }}>
                                Esta acción no se puede deshacer. La dirección ya no estará disponible para futuros pedidos.
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <motion.button whileTap={{ scale: 0.95 }} type="button" className="ios-btn ios-btn-outline w-100" onClick={() => setShowDeleteModal(false)}>
                                CANCELAR
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                className="ios-btn w-100 border-0"
                                style={{ backgroundColor: '#ff3b30', color: '#ffffff' }}
                                disabled={actionLoading}
                                onClick={confirmDeleteAddress}
                            >
                                {actionLoading ? <><i className="fas fa-spinner fa-spin me-2"></i>ELIMINANDO</> : "SÍ, ELIMINAR"}
                            </motion.button>
                        </div>
                    </div>
                </Modal>

                {/* TOAST NOTIFICACIONES */}
                <div className="profile-toast-container">
                    <AnimatePresence>
                        {toast.mostrar && (
                            <motion.div
                                className={`profile-ios-toast-glass ${toast.tipo === 'error' ? 'error' : 'success'}`}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            >
                                {toast.tipo === 'success' ?
                                    <i className="fas fa-check-circle text-success me-3 fs-5"></i> :
                                    <i className="fas fa-exclamation-triangle text-danger me-3 fs-5"></i>
                                }
                                <div>{toast.mensaje}</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}