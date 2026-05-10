import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { crearPedido } from '../../../services/PedidoService'; 
import { crearLinkDePago } from '../../../services/PagoService';
import { obtenerDireccionesPorUsuario } from '../../../services/UsuarioService';

export function Checkout() {
    const { cart, cartTotalAmount } = useCart();
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const [direcciones, setDirecciones] = useState([]);
    const [direccionSeleccionada, setDireccionSeleccionada] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar las direcciones del usuario al entrar
    useEffect(() => {
        if (!usuario) {
            navigate('/login'); // Si no está logueado, lo mandamos al login
            return;
        }

        const cargarDirecciones = async () => {
            try {
                // Obtenemos las direcciones del backend
                const data = await obtenerDireccionesPorUsuario(usuario.id);
                setDirecciones(data);
                if (data.length > 0) {
                    setDireccionSeleccionada(data[0].id); // Seleccionamos la primera por defecto
                }
            } catch (err) {
                console.error("No se pudieron cargar las direcciones:", err);
            }
        };
        cargarDirecciones();
    }, [usuario, navigate]);

    const handlePagar = async () => {
        if (cart.length === 0) {
            setError("Tu carrito está vacío.");
            return;
        }
        if (!direccionSeleccionada) {
            setError("Debes seleccionar una dirección de envío.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Armamos el DTO exactamente como lo espera tu backend (OrderCreate)
            const orderData = {
                shippingAddressId: parseInt(direccionSeleccionada),
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            // 2. Creamos la orden en el microservicio de Pedidos
            const nuevaOrden = await crearPedido(orderData);

            // 3. Con el ID de la orden, pedimos el link de pago al microservicio de Pagos
            const pagoData = await crearLinkDePago(nuevaOrden.id);

            // 4. Redirigimos al usuario a RukiPay (La URL que devuelve el backend)
            window.location.href = pagoData.url;

        } catch (err) {
            setError(err.message || "Ocurrió un error al procesar tu compra.");
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container mt-5 text-center" style={{fontFamily: "'Inter', sans-serif"}}>
                <h2>Tu carrito está vacío</h2>
                <button className="btn btn-dark mt-3" onClick={() => navigate('/productos')}>Volver a la tienda</button>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5" style={{ maxWidth: "800px", fontFamily: "'Inter', sans-serif" }}>
            <h2 className="fw-bolder mb-4">Finalizar Compra</h2>
            
            {error && <div className="alert alert-danger fw-bold small">{error}</div>}

            <div className="row gap-4">
                {/* COLUMNA IZQUIERDA: Dirección y Datos */}
                <div className="col-md-7">
                    <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
                        <h5 className="fw-bold mb-3">Dirección de Envío</h5>
                        {direcciones.length === 0 ? (
                            <div className="alert alert-warning small">
                                No tienes direcciones registradas. Por favor, agrega una en tu perfil antes de comprar.
                            </div>
                        ) : (
                            <select 
                                className="form-select" 
                                value={direccionSeleccionada} 
                                onChange={(e) => setDireccionSeleccionada(e.target.value)}
                            >
                                <option value="">Selecciona una dirección...</option>
                                {direcciones.map(dir => (
                                    <option key={dir.id} value={dir.id}>
                                        {dir.direccion}, {dir.comuna}, {dir.region}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: Resumen del Carrito */}
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 rounded-4 p-4">
                        <h5 className="fw-bold mb-3">Resumen</h5>
                        <ul className="list-group list-group-flush mb-3">
                            {cart.map(item => (
                                <li key={item.id} className="list-group-item d-flex justify-content-between px-0 small">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span className="fw-bold">${(item.basePrice * item.quantity).toLocaleString('es-CL')}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="d-flex justify-content-between border-top pt-3 mb-4 fw-bolder fs-5">
                            <span>Total</span>
                            <span>${cartTotalAmount.toLocaleString('es-CL')}</span>
                        </div>
                        
                        <button 
                            className="btn w-100 fw-bold py-3" 
                            style={{ backgroundColor: '#1d1d1f', color: 'white', borderRadius: '12px' }}
                            onClick={handlePagar}
                            disabled={loading || direcciones.length === 0}
                        >
                            {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Conectando al banco...</> : "PAGAR CON RUKIPAY"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}