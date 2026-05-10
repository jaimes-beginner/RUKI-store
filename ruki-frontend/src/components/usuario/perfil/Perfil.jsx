import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { obtenerMiPerfil, actualizarUsuario, crearDireccion, obtenerDireccionesPorUsuario } from '../../../services/UsuarioService';
import { Modal } from 'react-bootstrap';

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
        setTimeout(() => setToast({ ...toast, mostrar: false }), 3500);
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
            // Solo enviamos el password si el usuario escribió algo
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

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <i className="fas fa-circle-notch fa-spin fa-3x" style={{ color: '#1d1d1f' }}></i>
            </div>
        );
    }

    return (
        <div className="container mt-1 mb-5 position-relative" style={{ fontFamily: "'-apple-system', BlinkMacSystemFont, 'Inter', sans-serif", maxWidth: "900px" }}>
            
            {/* ESTILOS NATIVOS IOS / RUKI */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                body { background-color: #f5f5f7 !important; font-family: 'Inter', sans-serif !important; }
                
                .ios-card {
                    background: #ffffff;
                    border: 2px solid #e5e5ea;
                    border-radius: 16px;
                    transition: all 0.2s ease;
                }
                .ios-card:hover {
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
                }
                .ios-header {
                    border-bottom: 1.5px solid #e5e5ea;
                    padding: 12px 16px;
                    font-weight: 700;
                    color: #1d1d1f;
                    font-size: 14px;
                    letter-spacing: -0.01em;
                }
                .ios-label {
                    font-size: 11px;
                    font-weight: 700;
                    color: #86868b;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-bottom: 4px;
                }
                .ios-input {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 12px !important;
                    background: #fbfbfd;
                    border: 1.5px solid #d2d2d7;
                    border-radius: 10px;
                    color: #1d1d1f;
                    padding: 10px 12px;
                    transition: all 0.2s;
                }
                .ios-input:focus {
                    background: #ffffff;
                    border-color: #1d1d1f;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
                }
                .ios-input:disabled {
                    background: #e5e5ea;
                    color: #86868b;
                    cursor: not-allowed;
                }
                .ios-btn {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 12px;
                    font-weight: 600;
                    border-radius: 10px;
                    padding: 10px;
                    border: 1.5px solid #1d1d1f;
                    transition: all 0.2s;
                }
                .ios-btn-dark { background: #1d1d1f; color: #ffffff; }
                .ios-btn-dark:hover { background: #000000; color: #ffffff; }
                .ios-btn-outline { background: transparent; color: #1d1d1f; }
                .ios-btn-outline:hover { background: #f5f5f7; }
                
                .ios-badge {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 10px; font-weight: 700; padding: 4px 8px;
                    border-radius: 6px; border: 1.5px solid; display: inline-block;
                }
                .badge-customer { border-color: #86868b; color: #86868b; }
            `}</style>

            <div className="mb-4 border-bottom border-2 pb-3" style={{ borderColor: "#e5e5ea" }}>
                <h1 className="fw-bolder text-dark mb-1" style={{ letterSpacing: "-0.04em", fontSize: "2.5rem" }}>Mi Cuenta</h1>
                <p className="text-secondary fw-medium mb-0" style={{ color: "#86868b" }}>Gestiona tu <strong>perfil</strong> y <strong>direcciones</strong></p>
            </div>

            <div className="row g-4">
                {/* COLUMNA IZQUIERDA: INFORMACIÓN PERSONAL */}
                <div className="col-md-5">
                    <div className="ios-card">
                        <div className="ios-header d-flex justify-content-between align-items-center">
                            <div>
                                <i className="fas fa-user-circle me-2"></i> Información Personal
                            </div>
                            <button 
                                className="btn btn-link p-0 text-decoration-none fw-bold" 
                                style={{ fontSize: '12px', color: '#007AFF' }}
                                onClick={() => setEditMode(!editMode)}
                            >
                                {editMode ? 'Cancelar' : 'Editar'}
                            </button>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleUpdateProfile}>
                                <div className="mb-3">
                                    <label className="ios-label">Nombre</label>
                                    <input type="text" className="ios-input w-100" disabled={!editMode} required
                                           value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                                </div>
                                <div className="mb-3">
                                    <label className="ios-label">Apellido</label>
                                    <input type="text" className="ios-input w-100" disabled={!editMode} required
                                           value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                                </div>
                                <div className="mb-3">
                                    <label className="ios-label">Correo Electrónico</label>
                                    <input type="email" className="ios-input w-100" disabled value={perfil.email} />
                                    <div className="mt-1" style={{fontSize: "10px", color: "#86868b", fontWeight: "600"}}>
                                        <i className="fas fa-lock me-1"></i>No editable
                                    </div>
                                </div>
                                
                                {editMode && (
                                    <>
                                        <div className="mb-4 pt-3 border-top" style={{ borderColor: "#e5e5ea" }}>
                                            <label className="ios-label" style={{ color: '#007AFF' }}>Nueva Contraseña</label>
                                            <input type="password" className="ios-input w-100" placeholder="Dejar en blanco para conservar"
                                                   value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                        </div>
                                        <button type="submit" className="ios-btn ios-btn-dark w-100" disabled={actionLoading}>
                                            {actionLoading ? <><i className="fas fa-spinner fa-spin me-2"></i>GUARDANDO...</> : "GUARDAR CAMBIOS"}
                                        </button>
                                    </>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: DIRECCIONES */}
                <div className="col-md-7">
                    <div className="ios-card h-100 d-flex flex-column">
                        <div className="ios-header d-flex justify-content-between align-items-center">
                            <div>
                                <i className="fas fa-map-marker-alt me-2"></i> Mis Direcciones
                            </div>
                            <span className="ios-badge badge-customer" style={{ border: "none", background: "#f5f5f7" }}>
                                {direcciones.length} REGISTRADAS
                            </span>
                        </div>
                        <div className="card-body p-0 flex-grow-1">
                            {direcciones.length === 0 ? (
                                <div className="text-center py-5 text-muted fw-bold" style={{ fontSize: '13px' }}>
                                    <i className="fas fa-home fa-2x mb-2" style={{ color: '#d2d2d7' }}></i><br/>
                                    No tienes direcciones registradas.
                                </div>
                            ) : (
                                <div>
                                    {direcciones.map((dir, idx) => (
                                        <div key={dir.id} className="d-flex justify-content-between align-items-center p-3" 
                                             style={{ borderBottom: idx !== direcciones.length - 1 ? '1px solid #e5e5ea' : 'none' }}>
                                            <div>
                                                <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>{dir.street}</div>
                                                <div style={{ fontSize: "11px", color: "#86868b", fontWeight: "600" }}>
                                                    {dir.city}, {dir.region} {dir.referenceInfo ? ` • ${dir.referenceInfo}` : ''}
                                                </div>
                                            </div>
                                            <span className="ios-badge" style={{ background: '#f5f5f7', borderColor: '#e5e5ea', color: '#1d1d1f' }}>
                                                C.P: {dir.zipCode || 'N/A'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-top" style={{ borderColor: "#e5e5ea" }}>
                            <button className="ios-btn ios-btn-outline w-100" onClick={() => setShowAddressModal(true)}>
                                + AGREGAR NUEVA DIRECCIÓN
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL NUEVA DIRECCIÓN */}
            <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered contentClassName="border-0 rounded-4 shadow-lg">
                <div className="p-4" style={{ fontFamily: "'-apple-system', BlinkMacSystemFont, 'Inter', sans-serif" }}>
                    <h4 className="fw-bolder mb-4 text-center" style={{ color: '#1d1d1f', letterSpacing: '-0.02em' }}>Nueva Dirección</h4>
                    <form onSubmit={handleAddAddress}>
                        <div className="mb-3">
                            <label className="ios-label">Calle y Número</label>
                            <input type="text" className="ios-input w-100" required placeholder="Ej: Av. Providencia 1234"
                                   onChange={e => setAddressForm({...addressForm, street: e.target.value})} />
                        </div>
                        <div className="row g-2 mb-3">
                            <div className="col-6">
                                <label className="ios-label">Comuna / Ciudad</label>
                                <input type="text" className="ios-input w-100" required placeholder="Ej: Providencia"
                                       onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                            </div>
                            <div className="col-6">
                                <label className="ios-label">Región</label>
                                <input type="text" className="ios-input w-100" required placeholder="Ej: RM"
                                       onChange={e => setAddressForm({...addressForm, region: e.target.value})} />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="ios-label">Código Postal (Opcional)</label>
                            <input type="text" className="ios-input w-100" placeholder="Ej: 7500000"
                                   onChange={e => setAddressForm({...addressForm, zipCode: e.target.value})} />
                        </div>
                        <div className="mb-4">
                            <label className="ios-label">Referencias (Opcional)</label>
                            <textarea className="ios-input w-100" rows="2" placeholder="Ej: Casa esquina, portón negro..."
                                      onChange={e => setAddressForm({...addressForm, referenceInfo: e.target.value})}></textarea>
                        </div>
                        
                        <div className="d-flex gap-2">
                            <button type="button" className="ios-btn ios-btn-outline w-100" onClick={() => setShowAddressModal(false)}>
                                CANCELAR
                            </button>
                            <button type="submit" className="ios-btn ios-btn-dark w-100" disabled={actionLoading}>
                                {actionLoading ? <><i className="fas fa-spinner fa-spin me-2"></i>GUARDANDO</> : "GUARDAR"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* TOAST FLOTANTE */}
            <div className="toast-container position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1050 }}>
                <div className={`toast align-items-center bg-white ${toast.mostrar ? 'show' : 'hide'}`} 
                     role="alert" aria-live="assertive" aria-atomic="true" 
                     style={{ border: '3px solid #1d1d1f', borderRadius: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                    <div className="d-flex p-2">
                        <div className="toast-body fw-bold text-dark" style={{ fontSize: "12px" }}>
                            {toast.tipo === 'success' ? <i className="fas fa-check text-success me-2"></i> : <i className="fas fa-exclamation-triangle text-danger me-2"></i>}
                            {toast.mensaje}
                        </div>
                        <button type="button" className="btn-close me-2 m-auto" onClick={() => setToast({ ...toast, mostrar: false })}></button>
                    </div>
                </div>
            </div>

        </div>
    );
}