import { useState, useEffect } from "react";
import { obtenerCategoriasActivas, crearProducto, obtenerProductosActivos, eliminarProducto, actualizarProducto } from "../../../services/ProductoService";

export function InventarioAdmin() {
    const [categorias, setCategorias] = useState([]);
    const [productos, setProductos] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [formulario, setFormulario] = useState({
        name: "",
        description: "",
        basePrice: "",
        stock: "",
        categoryId: "",
        imageUrls: ""
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [cats, prods] = await Promise.all([
                obtenerCategoriasActivas(),
                obtenerProductosActivos()
            ]);
            setCategorias(cats);
            setProductos(prods);
        } catch (error) {
            console.error("Error cargando inventario", error);
        }
    };

    const handleChange = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };


    /*
        Lógica Híbrida para poder actualizar y crear un producto
    */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Convertimos string a array limpio
            const arrayImagenes = formulario.imageUrls
                .split(",")
                .map(img => img.trim())
                .filter(img => img !== "");

            /*
                Iniciamos un Payload vacío
            */
            const payload = {};

            /*
                Solo agregamos las propiedades si realmente tienen datos
            */
            if (formulario.name.trim() !== "") {
                payload.name = formulario.name;
            }
            if (formulario.description.trim() !== "") {
                payload.description = formulario.description;
            }
            if (String(formulario.basePrice).trim() !== "") {
                payload.basePrice = Number(formulario.basePrice);
            }
            if (String(formulario.stock).trim() !== "") {
                payload.stock = Number(formulario.stock);
            }
            if (String(formulario.categoryId).trim() !== "") {
                payload.categoryId = Number(formulario.categoryId);
            }
            
            /*
                Solo enviamos el array de imágenes si tiene al menos 1 elemento
            */
            if (arrayImagenes.length > 0) {
                payload.imageUrls = arrayImagenes;
            }

            if (editingId) {

                /*
                    Modo edición de un producto
                */
                await actualizarProducto(editingId, payload);
                setMensaje(`¡Producto #${editingId} actualizado con éxito!`);
            } else {

                /*
                    Modo creación de un nuevo producto
                */
                await crearProducto(payload);
                setMensaje("¡Producto creado con éxito!");
            }
            
            cancelarEdicion();
            cargarDatos();
            
        } catch (error) {
            setMensaje("Error: " + error.message);
        } finally {
            setLoading(false);
            setTimeout(() => setMensaje(""), 3000);
        }
    };

    const handleEliminar = async (id, nombreProducto) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar "${nombreProducto}"?`)) {
            return;
        }
        try {
            await eliminarProducto(id);
            setMensaje(`Producto #${id} eliminado correctamente.`);
            cargarDatos();
        } catch (error) {
            setMensaje("Error al eliminar: " + error.message);
        } finally {
            setTimeout(() => setMensaje(""), 3000);
        }
    };

    // Cargar datos al formulario para editar
    const handleEditar = (producto) => {
        setEditingId(producto.id);
        setFormulario({
            name: producto.name || "",
            description: producto.description || "",
            basePrice: producto.basePrice || "",
            stock: producto.stock || "",
            categoryId: producto.category?.id || "",
            // Volvemos a juntar el array en un string separado por comas
            imageUrls: producto.imageUrls ? producto.imageUrls.join(", ") : ""
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Salir del modo edición
    const cancelarEdicion = () => {
        setEditingId(null);
        setFormulario({ name: "", description: "", basePrice: "", stock: "", categoryId: "", imageUrls: "" });
    };

    return (
        <div className="container mt-5 position-relative" style={{ fontFamily: "'-apple-system', BlinkMacSystemFont, 'Inter', sans-serif" }}>
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                body { background-color: #f5f5f7 !important; }
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
                    border-bottom: 1.5px solid #e5e5ea; padding: 12px 16px;
                    font-weight: 700; color: #1d1d1f; font-size: 14px; letter-spacing: -0.01em;
                }
                .ios-label {
                    font-size: 11px; font-weight: 700; color: #86868b;
                    text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px;
                }
                .ios-input {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 12px !important; background: #fbfbfd;
                    border: 1.5px solid #d2d2d7; border-radius: 10px;
                    color: #1d1d1f; padding: 8px 12px; transition: all 0.2s;
                }
                .ios-input:focus {
                    background: #ffffff; border-color: #1d1d1f;
                    outline: none; box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
                }
                .ios-btn {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 12px; font-weight: 600; border-radius: 10px;
                    padding: 10px; border: 1.5px solid #1d1d1f; transition: all 0.2s;
                }
                .ios-btn-dark { background: #1d1d1f; color: #ffffff; }
                .ios-btn-dark:hover { background: #000000; color: #ffffff; }
                .ios-btn-outline { background: transparent; color: #1d1d1f; }
                .ios-btn-outline:hover { background: #f5f5f7; }
                
                .ios-btn-icon {
                    background: #fbfbfd; color: #1d1d1f; border: 1.5px solid #e5e5ea;
                    border-radius: 8px; width: 28px; height: 28px;
                    display: inline-flex; align-items: center; justify-content: center;
                    font-size: 11px; transition: all 0.2s; cursor: pointer;
                }
                .ios-btn-icon:hover { background: #1d1d1f; color: #ffffff; border-color: #1d1d1f; }
                
                .ios-table-wrapper {
                    border: 1.5px solid #e5e5ea; border-radius: 12px;
                    max-height: 560px; overflow-y: auto; overflow-x: auto; background: #ffffff;
                }
                .ios-table-wrapper::-webkit-scrollbar { width: 6px; height: 6px; }
                .ios-table-wrapper::-webkit-scrollbar-track { background: transparent; margin: 4px; }
                .ios-table-wrapper::-webkit-scrollbar-thumb { background-color: #d2d2d7; border-radius: 10px; }
                .ios-table-wrapper::-webkit-scrollbar-thumb:hover { background-color: #86868b; }

                .ios-table { margin-bottom: 0; font-size: 12px; min-width: 600px; }
                .ios-table th {
                    position: sticky; top: 0; z-index: 2; background: #fbfbfd; color: #86868b;
                    font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
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
                .badge-ok { border-color: #1d1d1f; color: #1d1d1f; }
                .badge-low { border-color: #86868b; color: #86868b; }
                .badge-out { border-color: #1d1d1f; background: #1d1d1f; color: #ffffff; }
                
                @keyframes parpadeo { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                .parpadeo { animation: parpadeo 1.5s infinite; }
            `}</style>

            <div className="mb-5 border-bottom border-2 pb-4" style={{ borderColor: "#e5e5ea" }}>
                <h1 className="fw-bolder text-dark mb-1" style={{ letterSpacing: "-0.04em", fontSize: "2.5rem" }}>Gestión de Productos</h1>
                <p className="text-secondary fw-medium mb-0" style={{ color: "#86868b" }}>Recopilación de inventario y gestión de <strong>productos</strong></p>
            </div>
            
            {mensaje && (
                <div className="alert bg-white border border-dark text-dark fw-bold shadow-sm rounded-3 py-2 px-3 mb-4 d-flex align-items-center" style={{ fontSize: "12px" }}>
                    <i className="fas fa-info-circle me-2 fs-6"></i> {mensaje}
                </div>
            )}

            <div className="row g-4">
                {/* FORMULARIO DINÁMICO */}
                <div className="col-md-4">
                    <div className="ios-card">
                        <div className="ios-header d-flex justify-content-between align-items-center">
                            <div>
                                <i className={`fas ${editingId ? 'fa-pen' : 'fa-plus-circle'} me-2`}></i> 
                                {editingId ? "Editar Producto" : "Nuevo Producto"}
                            </div>
                            {editingId && (
                                <span className="badge bg-dark text-white rounded-pill" style={{fontSize: "9px"}}>ID: {editingId}</span>
                            )}
                        </div>
                        <div className="card-body p-3">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="ios-label">Nombre</label>
                                    <input type="text" name="name" className="ios-input w-100" required 
                                           value={formulario.name} onChange={handleChange} placeholder="Ej: Playera Básica" />
                                </div>
                                
                                <div className="mb-3">
                                    <label className="ios-label">Descripción</label>
                                    <textarea name="description" className="ios-input w-100" rows="2" 
                                              value={formulario.description} onChange={handleChange} placeholder="Detalles..." />
                                </div>

                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <label className="ios-label">Precio Base</label>
                                        <div className="position-relative">
                                            <span className="position-absolute top-50 start-0 translate-middle-y ms-2 fw-bold text-muted" style={{fontSize: "12px"}}>$</span>
                                            <input type="number" name="basePrice" className="ios-input w-100 ps-4" required 
                                                   value={formulario.basePrice} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="ios-label">Stock</label>
                                        <input type="number" name="stock" className="ios-input w-100" required 
                                               value={formulario.stock} onChange={handleChange} min="0" />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="ios-label">Categoría</label>
                                    <select name="categoryId" className="ios-input w-100" required 
                                            value={formulario.categoryId} onChange={handleChange}>
                                        <option value="" disabled>Selecciona una...</option>
                                        {categorias.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="ios-label">Imágenes (URLs)</label>
                                    <textarea name="imageUrls" className="ios-input w-100" rows="2" 
                                              placeholder="url1.jpg, url2.jpg" 
                                              value={formulario.imageUrls} onChange={handleChange} />
                                    <div className="mt-1 fw-bold" style={{fontSize: "10px", color: "#86868b"}}>Separadas por coma.</div>
                                </div>

                                <button type="submit" className="ios-btn ios-btn-dark w-100" disabled={loading}>
                                    {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>PROCESANDO</> : (editingId ? "ACTUALIZAR PRODUCTO" : "CREAR PRODUCTO")}
                                </button>
                                
                                {editingId && (
                                    <button type="button" className="ios-btn ios-btn-outline w-100 mt-2" onClick={cancelarEdicion} disabled={loading}>
                                        CANCELAR EDICIÓN
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                {/* TABLA DE PRODUCTOS */}
                <div className="col-md-8">
                    <div className="ios-card h-100 d-flex flex-column">
                        <div className="ios-header d-flex justify-content-between align-items-center">
                            <span>Catálogo Actual</span>
                            <span className="ios-badge badge-low" style={{ border: "none", background: "#f5f5f7" }}>
                                {productos.length} ITEMS
                            </span>
                        </div>
                        <div className="card-body p-3 flex-grow-1">
                            
                            <div className="ios-table-wrapper">
                                <table className="table table-borderless ios-table">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Categoría</th>
                                            <th>Precio</th>
                                            <th>Stock</th>
                                            <th className="text-end">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productos.map(p => (
                                            <tr key={p.id} style={{ backgroundColor: editingId === p.id ? '#f5f5f7' : 'transparent' }}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {p.imageUrls && p.imageUrls.length > 0 ? (
                                                            <img src={p.imageUrls[0]} alt={p.name} 
                                                                 style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e5ea' }} 
                                                                 className="me-2" />
                                                        ) : (
                                                            <div className="d-flex justify-content-center align-items-center me-2 fw-bold" 
                                                                 style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e5ea', backgroundColor: '#ffffff', color: '#1d1d1f', fontSize: '12px' }}>
                                                                {p.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="fw-bold">{p.name}</div>
                                                            <div style={{ fontSize: "10px", color: "#86868b", fontWeight: "600" }}>ID: {p.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="fw-semibold text-muted">
                                                    {p.category?.name || "—"}
                                                </td>
                                                <td className="fw-bold">
                                                    ${Number(p.basePrice).toLocaleString('es-CL')}
                                                </td>
                                                <td>
                                                    {p.stock > 10 ? (
                                                        <span className="ios-badge badge-ok">OK ({p.stock})</span>
                                                    ) : p.stock > 0 ? (
                                                        <span className="ios-badge badge-low">BAJO ({p.stock})</span>
                                                    ) : (
                                                        <span className="ios-badge badge-out parpadeo">AGOTADO</span>
                                                    )}
                                                </td>
                                                <td className="text-end">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button type="button" className="ios-btn-icon" title="Editar Producto" onClick={() => handleEditar(p)}>
                                                            <i className="fas fa-pen"></i>
                                                        </button>
                                                        <button type="button" className="ios-btn-icon" title="Eliminar Producto" onClick={() => handleEliminar(p.id, p.name)}>
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {productos.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-muted fw-bold">
                                                    No hay productos registrados en el inventario.
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
        </div>
    );
}