import { useState, useEffect } from "react";
// 1. Importamos la función actualizarUsuario
import { obtenerUsuarios, crearUsuario, eliminarUsuario, actualizarUsuario } from "../../../services/UsuarioService"; 

export function UsuariosAdmin() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "success" });

    // 2. Nuevo estado para saber si estamos editando (guarda el ID del usuario)
    const [editingId, setEditingId] = useState(null);

    const [formulario, setFormulario] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
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
            mostrarToast("Error al cargar usuarios", "danger");
        }
    };

    const mostrarToast = (mensaje, tipo = "success") => {
        setToast({ mostrar: true, mensaje, tipo });
        setTimeout(() => setToast((prev) => ({ ...prev, mostrar: false })), 3500);
    };

    const handleChange = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    // 3. Lógica centralizada para CREAR o ACTUALIZAR
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if (editingId) {
                // MODO EDICIÓN: Armamos el payload solo con lo que permite UserUpdate
                const payload = {
                    firstName: formulario.firstName,
                    lastName: formulario.lastName,
                };
                
                // Solo enviamos la contraseña si el administrador escribió una nueva
                if (formulario.password.trim() !== "") {
                    payload.password = formulario.password;
                }

                await actualizarUsuario(editingId, payload);
                mostrarToast("Usuario actualizado con éxito");
            } else {
                // MODO CREACIÓN
                await crearUsuario(formulario);
                mostrarToast("Usuario creado con éxito");
            }
            
            // Limpiar todo y volver a modo creación
            cancelarEdicion();
            cargarDatos();
        } catch (error) {
            mostrarToast("Error: " + error.message, "danger");
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id, nombre) => {
        if (!window.confirm(`¿Estás seguro de que deseas desactivar al usuario "${nombre}"?`)) {
            return;
        }
        try {
            await eliminarUsuario(id);
            mostrarToast(`Usuario #${id} desactivado correctamente.`);
            cargarDatos();
        } catch (error) {
            mostrarToast("Error al desactivar: " + error.message, "danger");
        }
    };

    // 4. Función para cargar los datos en el formulario y entrar en Modo Edición
    const handleEditar = (usuario) => {
        setEditingId(usuario.id);
        setFormulario({
            firstName: usuario.firstName || "",
            lastName: usuario.lastName || "",
            email: usuario.email || "", 
            password: "" // La contraseña siempre se deja en blanco por seguridad
        });
        
        // Hacer scroll suave hacia arriba para que el admin vea el formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 5. Función para salir del Modo Edición
    const cancelarEdicion = () => {
        setEditingId(null);
        setFormulario({ firstName: "", lastName: "", email: "", password: "" });
    };

    return (
        <div className="container mt-2 position-relative" style={{ fontFamily: "'-apple-system', BlinkMacSystemFont, 'Inter', sans-serif" }}>
            
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
                    padding: 8px 12px;
                    transition: all 0.2s;
                }
                .ios-input:focus {
                    background: #ffffff;
                    border-color: #1d1d1f;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
                }
                /* Input deshabilitado */
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
                
                .ios-btn-icon {
                    background: #fbfbfd;
                    color: #1d1d1f;
                    border: 1.5px solid #e5e5ea;
                    border-radius: 8px;
                    width: 28px;
                    height: 28px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .ios-btn-icon:hover {
                    background: #1d1d1f;
                    color: #ffffff;
                    border-color: #1d1d1f;
                }
                
                .ios-table-wrapper {
                    border: 1.5px solid #e5e5ea;
                    border-radius: 12px;
                    max-height: 520px; 
                    overflow-y: auto;
                    overflow-x: auto;
                    background: #ffffff;
                }
                
                .ios-table-wrapper::-webkit-scrollbar { width: 6px; height: 6px; }
                .ios-table-wrapper::-webkit-scrollbar-track { background: transparent; margin: 4px; }
                .ios-table-wrapper::-webkit-scrollbar-thumb { background-color: #d2d2d7; border-radius: 10px; }
                .ios-table-wrapper::-webkit-scrollbar-thumb:hover { background-color: #86868b; }

                .ios-table { margin-bottom: 0; font-size: 12px; min-width: 600px; }
                .ios-table th {
                    position: sticky; top: 0; z-index: 2;
                    background: #fbfbfd; color: #86868b; font-weight: 600;
                    text-transform: uppercase; letter-spacing: 0.04em;
                    border-bottom: 1.5px solid #e5e5ea !important; padding: 10px 16px; white-space: nowrap; 
                }
                .ios-table td {
                    vertical-align: middle; border-bottom: 1px solid #e5e5ea;
                    padding: 10px 16px; color: #1d1d1f; white-space: nowrap; 
                }
                .ios-table tr:last-child td { border-bottom: none; }
                
                .ios-badge {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 10px; font-weight: 700; padding: 4px 8px;
                    border-radius: 6px; border: 1.5px solid; display: inline-block;
                }
                .badge-admin { border-color: #1d1d1f; background: #1d1d1f; color: #ffffff; }
                .badge-customer { border-color: #86868b; color: #86868b; }
            `}</style>


            <div className="mb-5 border-bottom border-2 pb-4" style={{ borderColor: "#e5e5ea" }}>
                <h1 className="fw-bolder text-dark mb-1" style={{ letterSpacing: "-0.04em", fontSize: "2.5rem" }}>Gestión de Usuarios</h1>
                <p className="text-secondary fw-medium mb-0" style={{ color: "#86868b" }}>Recopilación y gestión de <strong>usuarios</strong></p>
            </div>

            <div className="row g-4">
                {/* FORMULARIO DINÁMICO (CREAR / EDITAR) */}
                <div className="col-md-4">
                    <div className="ios-card">
                        <div className="ios-header d-flex justify-content-between align-items-center">
                            <div>
                                <i className={`fas ${editingId ? 'fa-user-edit' : 'fa-user-plus'} me-2`}></i> 
                                {editingId ? "Editar Usuario" : "Nuevo Usuario"}
                            </div>
                            {editingId && (
                                <span className="badge bg-dark text-white rounded-pill" style={{fontSize: "9px"}}>ID: {editingId}</span>
                            )}
                        </div>
                        <div className="card-body p-3">
                            <form onSubmit={handleSubmit}>
                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <label className="ios-label">Nombre</label>
                                        <input type="text" name="firstName" className="ios-input w-100" required 
                                               value={formulario.firstName} onChange={handleChange} placeholder="Ej: Juan" />
                                    </div>
                                    <div className="col-6">
                                        <label className="ios-label">Apellido</label>
                                        <input type="text" name="lastName" className="ios-input w-100" required 
                                               value={formulario.lastName} onChange={handleChange} placeholder="Ej: Pérez" />
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <label className="ios-label">Correo Electrónico</label>
                                    <input type="email" name="email" className="ios-input w-100" required={!editingId} disabled={!!editingId}
                                           value={formulario.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
                                    {editingId && <div className="mt-1" style={{fontSize: "10px", color: "#86868b", fontWeight: "600"}}><i className="fas fa-lock me-1"></i>El correo no se puede modificar.</div>}
                                </div>

                                <div className="mb-4">
                                    <label className="ios-label">Contraseña</label>
                                    {/* En edición NO es requerida. Si se deja en blanco, no se actualiza */}
                                    <input type="password" name="password" className="ios-input w-100" required={!editingId} minLength="6"
                                           value={formulario.password} onChange={handleChange} placeholder={editingId ? "Opcional (Dejar en blanco para conservar)" : "Mínimo 6 caracteres"} />
                                    {!editingId && <div className="mt-1 fw-bold" style={{fontSize: "10px", color: "#86868b"}}>Se asignará rol CUSTOMER por defecto.</div>}
                                </div>

                                <button type="submit" className="ios-btn ios-btn-dark w-100" disabled={loading}>
                                    {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>PROCESANDO...</> : (editingId ? "ACTUALIZAR USUARIO" : "CREAR USUARIO")}
                                </button>
                                
                                {/* Botón extra para cancelar la edición */}
                                {editingId && (
                                    <button type="button" className="ios-btn ios-btn-outline w-100 mt-2" onClick={cancelarEdicion} disabled={loading}>
                                        CANCELAR EDICIÓN
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                {/* TABLA DE USUARIOS */}
                <div className="col-md-8">
                    <div className="ios-card h-100 d-flex flex-column">
                        <div className="ios-header d-flex justify-content-between align-items-center">
                            <span>Base de Datos</span>
                            <span className="ios-badge badge-customer" style={{ border: "none", background: "#f5f5f7" }}>
                                {usuarios.length} REGISTROS
                            </span>
                        </div>
                        <div className="card-body p-3 flex-grow-1">
                            
                            <div className="ios-table-wrapper">
                                <table className="table table-borderless ios-table">
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Contacto</th>
                                            <th>Rol</th>
                                            <th className="text-end">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.map(u => {
                                            const roleStr = typeof u.role === 'object' ? u.role.name : u.role;
                                            const isAdmin = roleStr === 'ROLE_ADMIN' || roleStr === 'ADMIN';

                                            return (
                                                <tr key={u.id} style={{ backgroundColor: editingId === u.id ? '#f5f5f7' : 'transparent' }}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="d-flex justify-content-center align-items-center me-3 fw-bold" 
                                                                 style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e5e5ea', background: '#ffffff', color: '#1d1d1f', fontSize: '14px' }}>
                                                                {u.firstName ? u.firstName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold text-dark">{u.firstName} {u.lastName}</div>
                                                                <div style={{ fontSize: "10px", color: "#86868b", fontWeight: "600" }}>ID: {u.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="fw-semibold text-muted">
                                                        {u.email}
                                                    </td>
                                                    <td>
                                                        <span className={`ios-badge ${isAdmin ? 'badge-admin' : 'badge-customer'}`}>
                                                            {isAdmin ? 'ADMINISTRADOR' : 'CLIENTE'}
                                                        </span>
                                                    </td>
                                                    <td className="text-end">
                                                        <div className="d-flex justify-content-end gap-2">
                                                            <button type="button" className="ios-btn-icon" title="Editar Usuario" onClick={() => handleEditar(u)}>
                                                                <i className="fas fa-pen"></i>
                                                            </button>
                                                            <button type="button" className="ios-btn-icon" title="Desactivar Usuario" onClick={() => handleEliminar(u.id, u.firstName)}>
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {usuarios.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center py-5 text-muted fw-bold">
                                                    No hay usuarios registrados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>

            {/* TOAST FLOTANTE */}
            <div className="toast-container position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1050 }}>
                <div className={`toast align-items-center bg-white ${toast.mostrar ? 'show' : 'hide'}`} 
                     role="alert" aria-live="assertive" aria-atomic="true" 
                     style={{ border: '3px solid #1d1d1f', borderRadius: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                    <div className="d-flex p-2">
                        <div className="toast-body fw-bold text-dark" style={{ fontSize: "12px" }}>
                            {toast.tipo === 'success' ? <i className="fas fa-check me-2"></i> : <i className="fas fa-exclamation-triangle me-2"></i>}
                            {toast.mensaje}
                        </div>
                        <button type="button" className="btn-close me-2 m-auto" onClick={() => setToast({ ...toast, mostrar: false })}></button>
                    </div>
                </div>
            </div>

        </div>
    );
}