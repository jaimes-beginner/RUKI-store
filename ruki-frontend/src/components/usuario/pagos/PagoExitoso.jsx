import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { motion } from 'framer-motion';
import './PagoExitoso.css';

export function PagoExitoso() {
    const { clearCart } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId"); 

    useEffect(() => {
        // Vaciamos el carrito local porque la compra ya se hizo
        clearCart();
    }, [clearCart]);

    // Variantes de animación para framer-motion
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { 
            opacity: 1, 
            scale: 1, 
            transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } 
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    const checkmarkVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: { 
            scale: 1, 
            opacity: 1, 
            transition: { type: "spring", stiffness: 200, damping: 15, delay: 0.2 } 
        }
    };

    return (
        <div className="success-page-wrapper">
            <motion.div 
                className="success-card shadow-sm"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div className="success-icon-wrapper mx-auto mb-4" variants={checkmarkVariants}>
                    <i className="fas fa-check"></i>
                </motion.div>
                
                <motion.h2 className="fw-bolder mb-3" variants={itemVariants}>
                    ¡Pago Exitoso!
                </motion.h2>
                
                <motion.p className="text-secondary mb-4 px-3" variants={itemVariants}>
                    Tu compra se ha procesado correctamente y ya estamos preparando tu pedido. Te enviaremos un correo con los detalles de envío.
                </motion.p>
                
                {orderId && (
                    <motion.div className="order-receipt-box mb-4 mx-auto" variants={itemVariants}>
                        <p className="receipt-label">NÚMERO DE ORDEN</p>
                        <p className="receipt-number">#{orderId}</p>
                    </motion.div>
                )}
                
                <motion.div className="d-flex flex-column gap-3 px-3" variants={itemVariants}>
                    <button className="checkout-btn-dark w-100 py-3" onClick={() => navigate('/productos')}>
                        Seguir comprando
                    </button>
                    <button className="ios-btn-outline w-100 py-3" onClick={() => navigate('/')}>
                        Volver al inicio
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}