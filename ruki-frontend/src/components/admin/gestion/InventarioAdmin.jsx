import { useState, useEffect } from "react";
import { obtenerCategoriasActivas, crearProducto, obtenerProductosActivos, eliminarProducto, actualizarProducto } from "../../../services/ProductoService";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '../../../config/SupabaseConfig';
import './InventarioAdmin.css';

/*
    Variantes para las animaciónes 
    de inventario
*/
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
            const arrayImagenes = formulario.imageUrls.split(",").map(img => img.trim()).filter(img => img !== "");
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
                setMensaje("¡Producto creado exitosamente!");
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

    const handleEliminar = async (id, nombreProducto) => {
        if (!window.confirm(`¿Estás seguro de eliminar permanentemente "${nombreProducto}"?`)) return;
        try {
            await eliminarProducto(id);
            setMensaje(`Producto #${id} eliminado del sistema.`);
            cargarDatos();
        } catch (error) {
            setMensaje("Error al eliminar: " + error.message);
        } finally {
            setTimeout(() => setMensaje(""), 3500);
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

    const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        setLoading(true);
        
        /*
            Creamos un nombre único para la imagen 
            para que no se sobrescriban
        */
        const fileName = `${Date.now()}-${file.name}`;
        
        /*
            Subimos el archivo al bucket llamado 
            'productos' que está en nuestro supabase
        */
        const { data, error } = await supabase.storage
            .from('productos') 
            .upload(fileName, file);

        if (error) throw error;

        /*
            Obtnener la URL pública de la 
            imagen recién subida
        */
        const { data: { publicUrl } } = supabase.storage
            .from('productos')
            .getPublicUrl(fileName);

        /*
            Actualizamos el formulario, añadiendo la nueva URL 
            al campo imageUrls. Si ya hay URLs, las separamos por coma
        */
        setFormulario(prev => ({
            ...prev,
            imageUrls: prev.imageUrls ? `${prev.imageUrls}, ${publicUrl}` : publicUrl
        }));

        setMensaje("Imagen subida con éxito");
    } catch (error) {
        setMensaje("Error al subir imagen: " + error.message);
    } finally {
        setLoading(false);
    }
};

    const cancelarEdicion = () => {
        setEditingId(null);
        setFormulario({ name: "", description: "", basePrice: "", stock: "", categoryId: "", imageUrls: "" });
    };

    return (
        <div className="inventory-premium-wrapper">

            {/* LUCES AMBIENTALES */}
            <div className="inv-ambient-blob inv-blob-1"></div>
            <div className="inv-ambient-blob inv-blob-2"></div>

            <div className="container py-4 position-relative" style={{ zIndex: 1 }}>
                
                <motion.header 
                    className="inv-page-header-glass"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="inv-title">Inventario Maestro</h1>
                    <p className="inv-subtitle">Gestiona tu catálogo de productos con la precisión de <strong>RUKI</strong>.</p>
                </motion.header>
                
                <div className="inv-toast-container">
                    <AnimatePresence>
                        {mensaje && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: -20 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                className={`inv-toast-glass ${mensaje.includes("Error") ? "error" : "success"}`}
                            >
                                <i className={`fas ${mensaje.includes("Error") ? "fa-exclamation-triangle" : "fa-check-circle"} me-2 fs-5`}></i>
                                {mensaje}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.div className="row g-4" variants={containerVariants} initial="hidden" animate="visible">
                    
                    {/* PANEL IZQUIERDO DEL FORMULARIO*/}
                    <motion.div className="col-lg-4" variants={cardVariants}>
                        <div className="inv-card-glass">
                            <div className="inv-card-header d-flex justify-content-between align-items-center">
                                <div>
                                    <i className={`fas ${editingId ? 'fa-pen-nib text-primary' : 'fa-magic text-success'} me-2`}></i>
                                    {editingId ? "Editando Producto" : "Crear Producto"}
                                </div>
                                {editingId && <span className="inv-badge badge-dark">ID: {editingId}</span>}
                            </div>
                            
                            <div className="p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="inv-input-group mb-3">
                                        <label>Nombre del Producto</label>
                                        <div className="inv-input-wrapper">
                                            <i className="fas fa-tag input-icon"></i>
                                            <input type="text" name="name" className="inv-input-glass w-100" required 
                                                   value={formulario.name} onChange={handleChange} placeholder="Ej: Camiseta Performance" />
                                        </div>
                                    </div>
                                    
                                    <div className="inv-input-group mb-3">
                                        <label>Descripción detallada</label>
                                        <div className="inv-input-wrapper">
                                            <i className="fas fa-align-left input-icon" style={{ top: "16px", transform: "none" }}></i>
                                            <textarea name="description" className="inv-input-glass w-100" rows="3" 
                                                      value={formulario.description} onChange={handleChange} placeholder="Materiales, uso..." />
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-6 inv-input-group">
                                            <label>Precio Base</label>
                                            <div className="inv-input-wrapper">
                                                <i className="fas fa-dollar-sign input-icon"></i>
                                                <input type="number" name="basePrice" className="inv-input-glass w-100" required 
                                                       value={formulario.basePrice} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="col-6 inv-input-group">
                                            <label>Stock</label>
                                            <div className="inv-input-wrapper">
                                                <i className="fas fa-cubes input-icon"></i>
                                                <input type="number" name="stock" className="inv-input-glass w-100" required 
                                                       value={formulario.stock} onChange={handleChange} min="0" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="inv-input-group mb-3">
                                        <label>Clasificación</label>
                                        <div className="inv-input-wrapper">
                                            <i className="fas fa-layer-group input-icon z-2"></i>
                                            <select name="categoryId" className="inv-input-glass inv-select-glass w-100" required 
                                                    value={formulario.categoryId} onChange={handleChange}>
                                                <option value="" disabled>Selecciona categoría...</option>
                                                {categorias.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="inv-input-group mb-4">
                                        <label>Subir Imágenes de Producto</label>
                                        <div className="inv-input-wrapper">

                                            {/* INPUT DEL ARCHIVO REAL */}
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleFileUpload}
                                                className="inv-input-glass w-100"
                                                style={{ paddingLeft: '16px' }} 
                                            />
                                        </div>
                                        <span className="inv-helper-text mt-2">
                                            Las URLs aparecerán abajo automáticamente.
                                        </span>

                                        {/* MANTENEMOS EL TEXTAREA PARA EDICIÓN MANUAL */}
                                        <textarea 
                                            name="imageUrls" 
                                            className="inv-input-glass w-100 mt-2" 
                                            rows="2" 
                                            readOnly 
                                            value={formulario.imageUrls} 
                                            placeholder="URLs generadas..."
                                        />
                                    </div>

                                    <motion.button whileTap={{ scale: 0.95 }} type="submit" className="inv-btn-primary w-100" disabled={loading}>
                                        {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Sincronizando...</> : (editingId ? "Guardar Cambios" : "Agregar al Catálogo")}
                                    </motion.button>
                                    
                                    {editingId && (
                                        <motion.button whileTap={{ scale: 0.95 }} type="button" className="inv-btn-secondary w-100 mt-2" onClick={cancelarEdicion} disabled={loading}>
                                            Cancelar Edición
                                        </motion.button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </motion.div>

                    {/* PANEL DERECHO, LA TABLA CON LOS DATOS */}
                    <motion.div className="col-lg-8" variants={cardVariants}>
                        <div className="inv-card-glass h-100 d-flex flex-column">
                            <div className="inv-card-header d-flex justify-content-between align-items-center">
                                <div><i className="fas fa-database me-2 text-secondary"></i> Base de Datos de Productos</div>
                                <span className="inv-badge badge-light-blue">{productos.length} REGISTROS</span>
                            </div>
                            
                            <div className="inv-table-container flex-grow-1">
                                <table className="inv-table">
                                    <thead>
                                        <tr>
                                            <th className="ps-4">Producto</th>
                                            <th>Categoría</th>
                                            <th>Precio</th>
                                            <th>Disponibilidad</th>
                                            <th className="text-end pe-4">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {productos.map(p => (
                                                <motion.tr 
                                                    key={p.id} 
                                                    layout
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, backgroundColor: "#ff3b3020" }}
                                                    className={editingId === p.id ? 'active-row' : ''}
                                                >
                                                    <td className="ps-4">
                                                        <div className="d-flex align-items-center gap-3">
                                                            {p.imageUrls && p.imageUrls.length > 0 ? (
                                                                <img src={p.imageUrls[0]} alt="" className="inv-avatar" />
                                                            ) : (
                                                                <div className="inv-avatar-fallback"><i className="fas fa-camera-retro"></i></div>
                                                            )}
                                                            <div>
                                                                <div className="inv-item-name">{p.name}</div>
                                                                <div className="inv-item-id">ID: {p.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="inv-text-muted">{p.category?.name || "Sin Asignar"}</td>
                                                    <td className="inv-item-price">${Number(p.basePrice).toLocaleString('es-CL')}</td>
                                                    <td>
                                                        {p.stock > 10 ? <span className="inv-status-dot ok">Óptimo ({p.stock})</span> : 
                                                         p.stock > 0 ? <span className="inv-status-dot warning">Bajo ({p.stock})</span> : 
                                                         <span className="inv-status-dot error blink">Agotado</span>}
                                                    </td>
                                                    <td className="text-end pe-4">
                                                        <div className="d-flex justify-content-end gap-2">
                                                            
                                                            {/* BOTÓN EDITAR CON SVG NATIVO */}
                                                            <motion.button 
                                                                whileHover={{ scale: 1.1 }} 
                                                                whileTap={{ scale: 0.9 }} 
                                                                className="inv-action-btn edit" 
                                                                onClick={() => handleEditar(p)}
                                                                title="Editar"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M12 20h9"></path>
                                                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                                                </svg>
                                                            </motion.button>
                                                            
                                                            {/* BOTÓN ELIMINAR CON SVG NATIVO */}
                                                            <motion.button 
                                                                whileHover={{ scale: 1.1 }} 
                                                                whileTap={{ scale: 0.9 }} 
                                                                className="inv-action-btn delete" 
                                                                onClick={() => handleEliminar(p.id, p.name)}
                                                                title="Eliminar"
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
                                            ))}
                                        </AnimatePresence>
                                        {productos.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5">
                                                    <div className="inv-empty-state">
                                                        <i className="fas fa-box-open mb-3"></i>
                                                        <p>El inventario está vacío actualmente.</p>
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