import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';

export function PagoExitoso() {
    const { clearCart } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId"); // Atrapamos el ID que manda RukiPay en la URL

    useEffect(() => {
        // Vaciamos el carrito local porque la compra ya se hizo
        clearCart();
    }, []);

    return (
        <div className="container mt-5 text-center" style={{fontFamily: "'Inter', sans-serif"}}>
            <i className="fas fa-check-circle fa-5x text-success mb-4"></i>
            <h1 className="fw-bolder">¡Pago Exitoso!</h1>
            <p className="lead text-muted">Tu compra se ha procesado correctamente.</p>
            {orderId && <p className="fw-bold">Número de Orden: #{orderId}</p>}
            
            <button className="btn btn-dark mt-4 px-4 py-2 rounded-3 fw-bold" onClick={() => navigate('/')}>
                Volver a la tienda
            </button>
        </div>
    );
}