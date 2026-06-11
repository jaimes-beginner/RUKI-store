import { useState, useEffect } from "react";
import { crearProducto, obtenerProductosAdminPaginados, desactivarProducto, reactivarProducto, actualizarProducto, obtenerCategoriasActivas } from "@/services/ProductoService"; // <-- Alias
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '@/config/SupabaseConfig'; 
import './InventoryPage.css';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

export default function InventoryPage() {
    const Motion = motion;
    const [categorias, setCategorias] = useState([]);
    const [productos, setProductos] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productoToDelete, setProductoToDelete] = useState(null);
    const [showReactivateModal, setShowReactivateModal] = useState(false);
    const [productoToReactivate, setProductoToReactivate] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [formulario, setFormulario] = useState({
        name: "", description: "", basePrice: "", categoryId: "", imageUrls: "",
        isSale: false, salePrice: "", variants: []
    });

    useEffect(() => { cargarDatos(); }, [currentPage]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [cats, prodsData] = await Promise.all([
                obtenerCategoriasActivas(),
                obtenerProductosAdminPaginados(currentPage, 10)
            ]);
            setCategorias(cats);
            setProductos(prodsData.content);
            setTotalPages(prodsData.totalPages);
        } catch (error) {
            console.error("Error cargando inventario", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormulario({ ...formulario, [e.target.name]: value });
    };

    const handleAddVariant = () => setFormulario(prev => ({ ...prev, variants: [...prev.variants, { size: "", stock: "" }] }));
    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formulario.variants];
        newVariants[index][field] = value;
        setFormulario({ ...formulario, variants: newVariants });
    };
    const handleRemoveVariant = (index) => {
        const newVariants = [...formulario.variants];
        newVariants.splice(index, 1);
        setFormulario({ ...formulario, variants: newVariants });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formulario.variants.length === 0) { setMensaje("Error: Debes añadir al menos una talla al producto."); return; }
        setLoading(true);
        try {
            const arrayImagenes = formulario.imageUrls.split(",").map(img => img.trim()).filter(img => img !== "");
            const payload = {};
            if (formulario.name.trim() !== "") payload.name = formulario.name;
            if (formulario.description.trim() !== "") payload.description = formulario.description;
            if (String(formulario.basePrice).trim() !== "") payload.basePrice = Number(formulario.basePrice);
            if (String(formulario.categoryId).trim() !== "") payload.categoryId = Number(formulario.categoryId);
            if (arrayImagenes.length > 0) payload.imageUrls = arrayImagenes;
            payload.isSale = formulario.isSale;
            if (formulario.isSale && String(formulario.salePrice).trim() !== "") payload.salePrice = Number(formulario.salePrice);
            payload.variants = formulario.variants.map(v => ({ size: v.size, stock: Number(v.stock) }));

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

    const handleEliminar = (id, nombreProducto) => { setProductoToDelete({ id, nombreProducto }); setShowDeleteModal(true); };
    const confirmarEliminar = async () => {
        if (!productoToDelete) return;
        try {
            await desactivarProducto(productoToDelete.id);
            setMensaje(`Producto #${productoToDelete.id} desactivado del sistema.`);
            cargarDatos();
        } catch (error) { setMensaje("Error al eliminar: " + error.message); } 
        finally { setShowDeleteModal(false); setProductoToDelete(null); setTimeout(() => setMensaje(""), 3500); }
    };

    const handleReactivar = (id, nombreProducto) => { setProductoToReactivate({ id, nombreProducto }); setShowReactivateModal(true); };
    const confirmarReactivar = async () => {
        if (!productoToReactivate) return;
        try {
            await reactivarProducto(productoToReactivate.id);
            setMensaje(`Producto #${productoToReactivate.id} reactivado con éxito.`);
            cargarDatos();
        } catch (error) { setMensaje("Error al reactivar: " + error.message); } 
        finally { setShowReactivateModal(false); setProductoToReactivate(null); setTimeout(() => setMensaje(""), 3500); }
    };

    const handleEditar = (producto) => {
        setEditingId(producto.id);
        setFormulario({
            name: producto.name || "", description: producto.description || "", basePrice: producto.basePrice || "",
            categoryId: producto.category?.id || "", imageUrls: producto.imageUrls ? producto.imageUrls.join(", ") : "",
            isSale: producto.sale || false, salePrice: producto.salePrice || "",
            variants: producto.variants ? producto.variants.map(v => ({ size: v.size, stock: v.stock })) : []
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setLoading(true);
            const fileName = `${Date.now()}-${file.name}`;
            const { error } = await supabase.storage.from('productos').upload(fileName, file);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('productos').getPublicUrl(fileName);
            setFormulario(prev => ({ ...prev, imageUrls: prev.imageUrls ? `${prev.imageUrls}, ${publicUrl}` : publicUrl }));
            setMensaje("Imagen subida con éxito");
        } catch (error) { setMensaje("Error al subir imagen: " + error.message); } 
        finally { setLoading(false); }
    };

    const cancelarEdicion = () => {
        setEditingId(null);
        setFormulario({ name: "", description: "", basePrice: "", categoryId: "", imageUrls: "", isSale: false, salePrice: "", variants: [] });
    };

    return (
        <div className="inventory-premium-wrapper">
            <div className="inv-glow-container">
                <div className="inv-glow-blob inv-blob-cyan"></div>
                <div className="inv-glow-blob inv-blob-purple"></div>
            </div>

            <div className="container py-4">
                <motion.header className="inv-page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="inv-title">Inventario Maestro</h1>
                    <p className="inv-subtitle">Gestiona tu catálogo de productos con la precisión de <strong>RUKI</strong>.</p>
                </motion.header>

                <div className="inv-toast-container">
                    <AnimatePresence>
                        {mensaje && (
                            <Motion.div initial={{ opacity: 0, scale: 0.9, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className={`inv-toast ${mensaje.includes("Error") ? "error" : "success"}`}>
                                <i className={`fas ${mensaje.includes("Error") ? "fa-exclamation-triangle" : "fa-check-circle"} me-2 fs-5`}></i>{mensaje}
                            </Motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {showDeleteModal && (
                        <div className="inv-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
                            <Motion.div className="inv-modal-content text-center" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                                <div className="mb-3">
                                    <div className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '64px', height: '64px', backgroundColor: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.3)' }}>
                                        <i className="fas fa-box-open fa-2x" style={{ color: '#ff3b30' }}></i>
                                    </div>
                                    <h4 className="fw-bolder text-white mb-2">Desactivar producto</h4>
                                    <p className="text-secondary mb-0">¿Deseas desactivar {productoToDelete?.nombreProducto || 'este producto'} del inventario?</p>
                                </div>
                                <div className="d-flex gap-2 mt-4">
                                    <button className="flex-fill inv-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                                    <button className="flex-fill inv-btn-primary" onClick={confirmarEliminar}>Confirmar</button>
                                </div>
                            </Motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showReactivateModal && (
                        <div className="inv-modal-backdrop" onClick={() => setShowReactivateModal(false)}>
                            <Motion.div className="inv-modal-content text-center" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                                <div className="mb-3">
                                    <div className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '64px', height: '64px', backgroundColor: 'rgba(48, 209, 88, 0.1)', border: '1px solid rgba(48, 209, 88, 0.3)' }}>
                                        <i className="fas fa-trash-restore fa-2x" style={{ color: '#30d158' }}></i>
                                    </div>
                                    <h4 className="fw-bolder text-white mb-2">Reactivar producto</h4>
                                    <p className="text-secondary mb-0">¿Deseas volver a poner a la venta {productoToReactivate?.nombreProducto}?</p>
                                </div>
                                <div className="d-flex gap-2 mt-4">
                                    <button className="flex-fill inv-btn-secondary" onClick={() => setShowReactivateModal(false)}>Cancelar</button>
                                    <button className="flex-fill inv-btn-primary" style={{ background: '#30d158', color: '#000' }} onClick={confirmarReactivar}>Reactivar</button>
                                </div>
                            </Motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <motion.div className="row g-4 align-items-start" variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div className="col-lg-4" variants={cardVariants}>
                        <div className="inv-card">
                            <div className="inv-card-header d-flex justify-content-between align-items-center">
                                <div><i className={`fas ${editingId ? 'fa-pen-nib text-primary' : 'fa-magic text-white'} me-2`}></i>{editingId ? "Editando Producto" : "Crear Producto"}</div>
                                {editingId && <span className="inv-badge badge-dark">ID: {editingId}</span>}
                            </div>
                            <div className="p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="inv-input-group mb-3">
                                        <label>Nombre del Producto</label>
                                        <div className="inv-input-wrapper">
                                            <i className="fas fa-tag input-icon"></i>
                                            <input type="text" name="name" className="inv-input w-100" required value={formulario.name} onChange={handleChange} placeholder="Ej: Camiseta Performance" />
                                        </div>
                                    </div>
                                    <div className="inv-input-group mb-3">
                                        <label>Clasificación</label>
                                        <div className="inv-input-wrapper">
                                            <i className="fas fa-layer-group input-icon z-2"></i>
                                            <select name="categoryId" className="inv-input inv-select w-100" required value={formulario.categoryId} onChange={handleChange}>
                                                <option value="" disabled>Selecciona categoría...</option>
                                                {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row g-3 mb-3">
                                        <div className="col-6 inv-input-group">
                                            <label>Precio Base</label>
                                            <div className="inv-input-wrapper">
                                                <i className="fas fa-dollar-sign input-icon"></i>
                                                <input type="number" name="basePrice" className="inv-input w-100" required value={formulario.basePrice} onChange={handleChange} min="1" />
                                            </div>
                                        </div>
                                        <div className="col-6 inv-input-group">
                                            <label className="d-flex align-items-center gap-2">
                                                <input type="checkbox" name="isSale" checked={formulario.isSale} onChange={handleChange} className="form-check-input mt-0" />
                                                <span className={formulario.isSale ? "text-danger fw-bold" : ""}>¡En Oferta!</span>
                                            </label>
                                            <div className="inv-input-wrapper mt-1">
                                                <i className="fas fa-tags input-icon text-danger"></i>
                                                <input type="number" name="salePrice" className="inv-input w-100 border-danger" value={formulario.salePrice} onChange={handleChange} placeholder={formulario.isSale ? "Precio rebajado" : "N/A"} disabled={!formulario.isSale} required={formulario.isSale} min="1" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="inv-input-group mb-3 p-3 rounded-3" style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <label className="mb-0 text-white fw-bold"><i className="fas fa-ruler me-2"></i>Tallas y Stock</label>
                                            <motion.button type="button" className="inv-btn-add" onClick={handleAddVariant} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><i className="fas fa-plus me-1"></i> Añadir</motion.button>
                                        </div>
                                        <AnimatePresence>
                                            {formulario.variants.map((v, index) => (
                                                <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className="d-flex gap-2 mb-2 align-items-center">
                                                    <select className="inv-input inv-select w-50 p-2" style={{ fontSize: '13px', minHeight: '35px', paddingLeft: '12px', paddingRight: '28px' }} value={v.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} required>
                                                        <option value="" disabled>Talla...</option>
                                                        <option value="XS">XS</option><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option><option value="Única">Única</option>
                                                    </select>
                                                    <input type="number" className="inv-input w-50 p-2" style={{ fontSize: '13px', minHeight: '35px', paddingLeft: '12px' }} placeholder="Cant." value={v.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} min="0" required />
                                                    <button type="button" className="btn btn-sm btn-outline-danger p-2 d-flex align-items-center justify-content-center" style={{ borderRadius: '10px' }} onClick={() => handleRemoveVariant(index)}><i className="fas fa-times"></i></button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {formulario.variants.length === 0 && <small className="text-secondary d-block text-center mt-2" style={{ fontSize: '11px' }}>Agrega tallas para activar el producto.</small>}
                                    </div>

                                    <div className="inv-input-group mb-3">
                                        <label>Descripción detallada</label>
                                        <div className="inv-input-wrapper">
                                            <i className="fas fa-align-left input-icon" style={{ top: "16px", transform: "none" }}></i>
                                            <textarea name="description" className="inv-input w-100" rows="2" value={formulario.description} onChange={handleChange} placeholder="Materiales, uso..." />
                                        </div>
                                    </div>

                                    <div className="inv-input-group mb-4">
                                        <label>Subir Imágenes de Producto</label>
                                        <div className="inv-input-wrapper">
                                            <input type="file" accept="image/*" onChange={handleFileUpload} className="inv-input w-100" style={{ paddingLeft: '16px' }} />
                                        </div>
                                        <textarea name="imageUrls" className="inv-input w-100 mt-2" rows="1" readOnly value={formulario.imageUrls} placeholder="Las URLs aparecerán aquí..." style={{ fontSize: '11px' }} />
                                    </div>

                                    <motion.button whileTap={{ scale: 0.95 }} type="submit" className="inv-btn-primary w-100" disabled={loading}>
                                        {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Procesando...</> : (editingId ? "Guardar Cambios" : "Agregar al Catálogo")}
                                    </motion.button>
                                    {editingId && <motion.button whileTap={{ scale: 0.95 }} type="button" className="inv-btn-secondary w-100 mt-2" onClick={cancelarEdicion} disabled={loading}>Cancelar Edición</motion.button>}
                                </form>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div className="col-lg-8" variants={cardVariants}>
                        <div className="inv-card h-100 d-flex flex-column">
                            <div className="inv-card-header d-flex justify-content-between align-items-center">
                                <div><i className="fas fa-database me-2 opacity-75"></i> Base de Datos de Productos</div>
                                <span className="inv-badge badge-light-blue">{productos.length} REGISTROS</span>
                            </div>
                            <div className="inv-table-container flex-grow-1">
                                <table className="inv-table">
                                    <thead>
                                        <tr>
                                            <th className="ps-4">Producto</th><th>Categoría</th><th>Precio</th><th>Stock Total</th><th>Estado</th><th className="text-end pe-4">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {productos.map(p => (
                                                <motion.tr key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, backgroundColor: "#ff3b3020" }} className={editingId === p.id ? 'active-row' : ''}>
                                                    <td className="ps-4">
                                                        <div className="d-flex align-items-center gap-3 text-start">
                                                            {p.imageUrls && p.imageUrls.length > 0 ? <img src={p.imageUrls[0]} alt="" className="inv-avatar" /> : <div className="inv-avatar-fallback"><i className="fas fa-camera-retro"></i></div>}
                                                            <div className="d-flex flex-column align-items-start">
                                                                <div className="inv-item-name" style={{ fontSize: '11px' }}>{p.name}</div>
                                                                <div className="inv-item-id">ID: {p.id}{p.variants && p.variants.length > 0 && <span className="inv-item-variants">&nbsp;• Tallas: {p.variants.map(v => v.size).join(', ')}</span>}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="inv-text-muted" style={{ fontSize: '11px' }}>{p.category?.name || "Sin Asignar"}</td>
                                                    <td>
                                                        {p.sale || p.isSale ? (
                                                            <div><span className="inv-item-price text-danger d-block" >${Number(p.salePrice).toLocaleString('es-CL')}</span><span className="text-decoration-line-through text-secondary small">${Number(p.basePrice).toLocaleString('es-CL')}</span></div>
                                                        ) : <span className="inv-item-price">${Number(p.basePrice).toLocaleString('es-CL')}</span>}
                                                    </td>
                                                    <td>
                                                        {p.stock > 10 ? <span className="inv-status-dot ok">Óptimo ({p.stock})</span> : p.stock > 0 ? <span className="inv-status-dot warning">Bajo ({p.stock})</span> : <span className="inv-status-dot error">Agotado</span>}
                                                    </td>
                                                    <td><span className={`inv-badge ${p.active ? 'badge-active' : 'badge-inactive'}`}>{p.active ? 'ACTIVO' : 'INACTIVO'}</span></td>
                                                    <td className="text-end pe-4">
                                                        <div className="d-flex justify-content-end gap-2">
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="inv-action-btn edit" onClick={() => handleEditar(p)} title="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></motion.button>
                                                            {p.active ? (
                                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="inv-action-btn delete" onClick={() => handleEliminar(p.id, p.name)} title="Desactivar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></motion.button>
                                                            ) : (
                                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="inv-action-btn reactivate" onClick={() => handleReactivar(p.id, p.name)} title="Reactivar"><i className="fas fa-trash-restore"></i></motion.button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                        {productos.length === 0 && <tr><td colSpan="6" className="text-center py-5"><div className="inv-empty-state"><i className="fas fa-box-open mb-3"></i><p>El inventario está vacío actualmente.</p></div></td></tr>}
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