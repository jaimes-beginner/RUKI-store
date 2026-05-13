import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { obtenerMiPerfil, actualizarUsuario, crearDireccion, obtenerDireccionesPorUsuario } from '../../../services/UsuarioService';
import { Modal } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import './Perfil.css';

export function Perfil() {
    const { usuario } = useAuth();
    
    // Estados de datos
    const [perfil, setPerfil] = useState(null);
    const [direcciones, setDirecciones] = useState([]);
    
    // Estados de edición de perfil
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', password: '' });
    
    // Estados de nueva dirección
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressForm, setAddressForm] = useState({
        street: '', city: '', region: '', zipCode: '', referenceInfo: ''
    });

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Estado del Toast (Notificaciones)
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
                obtenerDireccionesPorUsuario(usuario.id)
            ]);
            setPerfil(profileData);
            setDirecciones(addressData);
            setFormData({ firstName: profileData.firstName, lastName: profileData.lastName, password: '' });
        } catch (err) {
            mostrarToast('Error al cargar los datos', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const updatePayload = { ...formData };
            if (!updatePayload.password) delete updatePayload.password;

            await actualizarUsuario(perfil.id, updatePayload);
            mostrarToast('Perfil actualizado con éxito', 'success');
            setEditMode(false);
            await cargarDatos();
        } catch (err) {
            mostrarToast(err.message || 'Error al actualizar', 'danger');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await crearDireccion({ ...addressForm, userId: perfil.id });
            mostrarToast('Dirección agregada', 'success');
            setShowAddressModal(false);
            setAddressForm({ street: '', city: '', region: '', zipCode: '', referenceInfo: '' });
            await cargarDatos();
        } catch (err) {
            mostrarToast(err.message || 'Error al agregar dirección', 'danger');
        } finally {
            setActionLoading(false);
        }
    };

    // Variantes de animación
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

    if (loading) {
        return (
            <div className="profile-loading-screen">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <i className="fas fa-circle-notch fa-spin fa-3x" style={{ color: '#0a84ff' }}></i>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="profile-main-wrapper">
            {/* LUCES AMBIENTALES ESTILO IOS */}
            <div className="profile-ambient-blob profile-blob-1"></div>
            <div className="profile-ambient-blob profile-blob-2"></div>

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
                                    <div className="mb-3">
                                        <label className="ios-label">Nombre</label>
                                        <input type="text" className="ios-input-glass w-100" disabled={!editMode} required
                                               value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="ios-label">Apellido</label>
                                        <input type="text" className="ios-input-glass w-100" disabled={!editMode} required
                                               value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="ios-label">Correo Electrónico</label>
                                        <input type="email" className="ios-input-glass w-100" disabled value={perfil.email} />
                                        <div className="input-helper-text mt-1">
                                            <i className="fas fa-lock me-1"></i>No editable
                                        </div>
                                    </div>
                                    
                                    <AnimatePresence>
                                        {editMode && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }} 
                                                animate={{ opacity: 1, height: 'auto' }} 
                                                exit={{ opacity: 0, height: 0 }}
                                                className="edit-mode-section"
                                            >
                                                <div className="mb-4 pt-3 border-top-subtle">
                                                    <label className="ios-label highlight-label">Nueva Contraseña</label>
                                                    <input type="password" className="ios-input-glass w-100" placeholder="Dejar en blanco para conservar"
                                                           value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                                </div>
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
                                            <motion.div key={dir.id} className="address-item" variants={listItemVariants}>
                                                <div>
                                                    <div className="address-street">{dir.street}</div>
                                                    <div className="address-details">
                                                        {dir.city}, {dir.region} {dir.referenceInfo ? ` • ${dir.referenceInfo}` : ''}
                                                    </div>
                                                </div>
                                                <span className="ios-badge-zipcode">
                                                    C.P: {dir.zipCode || 'N/A'}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                            
                            <div className="p-4 border-top-subtle">
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

                {/* MODAL NUEVA DIRECCIÓN CON GLASSMORPHISM */}
                <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered contentClassName="profile-modal-glass">
                    <div className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="modal-custom-title mb-0">Nueva Dirección</h4>
                            <button type="button" className="btn-close-glass" onClick={() => setShowAddressModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleAddAddress}>
                            <div className="mb-3">
                                <label className="ios-label">Calle y Número</label>
                                <input type="text" className="ios-input-glass w-100" required placeholder="Ej: Av. Providencia 1234"
                                       onChange={e => setAddressForm({...addressForm, street: e.target.value})} />
                            </div>
                            <div className="row g-3 mb-3">
                                <div className="col-6">
                                    <label className="ios-label">Comuna / Ciudad</label>
                                    <input type="text" className="ios-input-glass w-100" required placeholder="Ej: Providencia"
                                           onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                                </div>
                                <div className="col-6">
                                    <label className="ios-label">Región</label>
                                    <input type="text" className="ios-input-glass w-100" required placeholder="Ej: RM"
                                           onChange={e => setAddressForm({...addressForm, region: e.target.value})} />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="ios-label">Código Postal (Opcional)</label>
                                <input type="text" className="ios-input-glass w-100" placeholder="Ej: 7500000"
                                       onChange={e => setAddressForm({...addressForm, zipCode: e.target.value})} />
                            </div>
                            <div className="mb-4">
                                <label className="ios-label">Referencias (Opcional)</label>
                                <textarea className="ios-input-glass w-100" rows="2" placeholder="Ej: Casa esquina, portón negro..."
                                          onChange={e => setAddressForm({...addressForm, referenceInfo: e.target.value})}></textarea>
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

                {/* TOAST FLOTANTE ANIMADO */}
                <div className="profile-toast-container">
                    <AnimatePresence>
                        {toast.mostrar && (
                            <motion.div 
                                className="profile-ios-toast-glass"
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            >
                                <div className="d-flex p-2 align-items-center">
                                    <div className="toast-body-text">
                                        {toast.tipo === 'success' ? 
                                            <i className="fas fa-check-circle text-success me-2 fs-5 align-middle"></i> : 
                                            <i className="fas fa-exclamation-triangle text-danger me-2 fs-5 align-middle"></i>
                                        }
                                        {toast.mensaje}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}