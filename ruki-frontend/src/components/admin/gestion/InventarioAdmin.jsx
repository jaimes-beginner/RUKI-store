import { useState, useEffect } from "react";
import { obtenerCategoriasActivas, crearProducto, obtenerProductosActivos, eliminarProducto, actualizarProducto } from "../../../services/ProductoService";
import { motion, AnimatePresence } from "framer-motion";
import './InventarioAdmin.css';

// --- VARIANTES DE ANIMACIÓN ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export function InventarioAdmin() {
    const [categorias, setCategorias] = useState([]);
    const [productos, setProductos] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [formulario, setFormulario] = useState({
        name: "", description: "", basePrice: "", stock: "", categoryId: "", imageUrls: ""
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [cats, prods] = await Promise.all([
                obtenerCategoriasActivas(), obtenerProductosActivos()
            ]);
            setCategorias(cats); setProductos(prods);
        } catch (error) {
            console.error("Error cargando inventario", error);
        }
    };

    const handleChange = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const arrayImagenes = formulario.imageUrls
                .split(",")
                .map(img => img.trim())
                .filter(img => img !== "");

            const payload = {};
            if (formulario.name.trim() !== "") payload.name = formulario.name;
            if (formulario.description.trim() !== "") payload.description = formulario.description;
            if (String(formulario.basePrice).trim() !== "") payload.basePrice = Number(formulario.basePrice);
            if (String(formulario.stock).trim() !== "") payload.stock = Number(formulario.stock);
            if (String(formulario.categoryId).trim() !== "") payload.categoryId = Number(formulario.categoryId);
            if (arrayImagenes.length > 0) payload.imageUrls = arrayImagenes;

            if (editingId) {
                await actualizarProducto(editingId, payload);
                setMensaje(`¡Producto #${editingId} actualizado con éxito!`);
            } else {
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
        if (!window.confirm(`¿Estás seguro de que deseas eliminar "${nombreProducto}"?`)) return;
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

    const handleEditar = (producto) => {
        setEditingId(producto.id);
        setFormulario({
            name: producto.name || "",
            description: producto.description || "",
            basePrice: producto.basePrice || "",
            stock: producto.stock || "",
            categoryId: producto.category?.id || "",
            imageUrls: producto.imageUrls ? producto.imageUrls.join(", ") : ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelarEdicion = () => {
        setEditingId(null);
        setFormulario({ name: "", description: "", basePrice: "", stock: "", categoryId: "", imageUrls: "" });
    };

    return (
        <div className="admin-inventory-wrapper">
            <div className="container px-4 px-md-5 py-4 position-relative" style={{ zIndex: 1 }}>
                
                {/* ENCABEZADO */}
                <motion.div 
                    className="admin-dashboard-header"
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                >
                    <h1 className="admin-title">Gestión de Inventario</h1>
                    <p className="admin-subtitle">Actualiza, crea y administra el <strong>catálogo de productos</strong>.</p>
                </motion.div>
                
                {/* ALERTA (TOAST) */}
                <div className="toast-container-admin">
                    <AnimatePresence>
                        {mensaje && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                className={`admin-alert-glass ${mensaje.includes("Error") ? "error" : "success"} mb-4`}
                            >
                                <i className={`fas ${mensaje.includes("Error") ? "fa-exclamation-triangle" : "fa-check-circle"} me-2 fs-6`}></i> 
                                {mensaje}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.div className="row g-4" variants={containerVariants} initial="hidden" animate="visible">
                    
                    {/* COLUMNA IZQUIERDA: FORMULARIO DINÁMICO */}
                    <motion.div className="col-lg-4" variants={cardVariants}>
                        <div className="admin-card-glass h-100">
                            <div className="admin-header-glass d-flex justify-content-between align-items-center">
                                <div>
                                    <i className={`fas ${editingId ? 'fa-pen text-primary' : 'fa-plus-circle text-success'} me-2`}></i> 
                                    {editingId ? "Editar Producto" : "Nuevo Producto"}
                                </div>
                                {editingId && (
                                    <span className="admin-badge badge-dark">ID: {editingId}</span>
                                )}
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="admin-input-group mb-3">
                                        <label className="admin-label">Nombre</label>
                                        <input type="text" name="name" className="admin-input-glass w-100" required 
                                               value={formulario.name} onChange={handleChange} placeholder="Ej: Playera Básica" />
                                    </div>
                                    
                                    <div className="admin-input-group mb-3">
                                        <label className="admin-label">Descripción</label>
                                        <textarea name="description" className="admin-input-glass w-100" rows="3" 
                                                  value={formulario.description} onChange={handleChange} placeholder="Detalles técnicos y material..." />
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-6 admin-input-group">
                                            <label className="admin-label">Precio Base</label>
                                            <div className="position-relative">
                                                <span className="input-currency-symbol">$</span>
                                                <input type="number" name="basePrice" className="admin-input-glass w-100 ps-4" required 
                                                       value={formulario.basePrice} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="col-6 admin-input-group">
                                            <label className="admin-label">Stock Actual</label>
                                            <input type="number" name="stock" className="admin-input-glass w-100" required 
                                                   value={formulario.stock} onChange={handleChange} min="0" />
                                        </div>
                                    </div>

                                    <div className="admin-input-group mb-3">
                                        <label className="admin-label">Categoría</label>
                                        <div className="position-relative">
                                            <select name="categoryId" className="admin-select-glass w-100" required 
                                                    value={formulario.categoryId} onChange={handleChange}>
                                                <option value="" disabled>Selecciona una...</option>
                                                {categorias.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="admin-input-group mb-4">
                                        <label className="admin-label">Imágenes (URLs)</label>
                                        <textarea name="imageUrls" className="admin-input-glass w-100" rows="2" 
                                                  placeholder="https://img1.jpg, https://img2.jpg" 
                                                  value={formulario.imageUrls} onChange={handleChange} />
                                        <div className="input-helper-text">Múltiples URLs separadas por coma.</div>
                                    </div>

                                    <motion.button whileTap={{ scale: 0.95 }} type="submit" className="admin-btn-solid w-100" disabled={loading}>
                                        {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>PROCESANDO</> : (editingId ? "ACTUALIZAR PRODUCTO" : "CREAR PRODUCTO")}
                                    </motion.button>
                                    
                                    {editingId && (
                                        <motion.button whileTap={{ scale: 0.95 }} type="button" className="admin-btn-outline w-100 mt-2" onClick={cancelarEdicion} disabled={loading}>
                                            CANCELAR EDICIÓN
                                        </motion.button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </motion.div>

                    {/* COLUMNA DERECHA: TABLA DE PRODUCTOS */}
                    <motion.div className="col-lg-8" variants={cardVariants}>
                        <div className="admin-card-glass h-100 d-flex flex-column">
                            <div className="admin-header-glass d-flex justify-content-between align-items-center">
                                <span>Catálogo Actual</span>
                                <span className="admin-badge badge-neutral">
                                    {productos.length} ÍTEMS
                                </span>
                            </div>
                            <div className="card-body p-0 flex-grow-1">
                                <div className="admin-table-wrapper-large">
                                    <table className="table table-borderless admin-table mb-0">
                                        <thead>
                                            <tr>
                                                <th className="ps-4">Producto</th>
                                                <th>Categoría</th>
                                                <th>Precio</th>
                                                <th>Stock</th>
                                                <th className="text-end pe-4">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productos.map(p => (
                                                <tr key={p.id} className={`admin-table-row ${editingId === p.id ? 'is-editing' : ''}`}>
                                                    <td className="ps-4">
                                                        <div className="d-flex align-items-center">
                                                            {p.imageUrls && p.imageUrls.length > 0 ? (
                                                                <img src={p.imageUrls[0]} alt={p.name} className="product-mini-thumb" />
                                                            ) : (
                                                                <div className="product-mini-placeholder">
                                                                    {p.name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="product-table-name">{p.name}</div>
                                                                <div className="product-table-id">ID: {p.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="product-table-category">
                                                        {p.category?.name || "—"}
                                                    </td>
                                                    <td className="product-table-price">
                                                        ${Number(p.basePrice).toLocaleString('es-CL')}
                                                    </td>
                                                    <td>
                                                        {p.stock > 10 ? (
                                                            <span className="admin-badge badge-ok">OK ({p.stock})</span>
                                                        ) : p.stock > 0 ? (
                                                            <span className="admin-badge badge-low">BAJO ({p.stock})</span>
                                                        ) : (
                                                            <span className="admin-badge badge-out parpadeo">AGOTADO</span>
                                                        )}
                                                    </td>
                                                    <td className="text-end pe-4">
                                                        <div className="d-flex justify-content-end gap-2">
                                                            <button type="button" className="admin-icon-btn edit" title="Editar Producto" onClick={() => handleEditar(p)}>
                                                                <i className="fas fa-pen"></i>
                                                            </button>
                                                            <button type="button" className="admin-icon-btn delete" title="Eliminar Producto" onClick={() => handleEliminar(p.id, p.name)}>
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {productos.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-5">
                                                        <div className="empty-state-text">
                                                            <i className="fas fa-box-open fs-2 mb-2 d-block text-muted"></i>
                                                            No hay productos registrados en el inventario.
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}