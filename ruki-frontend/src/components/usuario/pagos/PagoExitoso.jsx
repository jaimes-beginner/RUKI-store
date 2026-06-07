import React, { useEffect } from 'react';
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
        /*
            Vaciamos el carrito al cargar la pantalla de éxito
        */
        clearCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /*
        Variantes de animación 
        para framer-motion
    */
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
        <main className="success-page-wrapper">
            
            {/* LUCES AMBIENTALES DE ÉXITO */}
            <div className="success-glow-container">
                <div className="success-glow-blob blob-success-green"></div>
                <div className="success-glow-blob blob-success-cyan"></div>
            </div>

            <motion.div 
                className="success-card"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div className="success-icon-wrapper mx-auto mb-4" variants={checkmarkVariants}>
                    {/* SVG NATIVO PARA EL CHECK DE EXITO */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </motion.div>
                
                <motion.h2 className="fw-bolder text-white mb-3" variants={itemVariants}>
                    ¡Pago Exitoso!
                </motion.h2>
                
                <motion.p className="mb-4 px-3" style={{ color: '#a1a1a6', fontWeight: '500' }} variants={itemVariants}>
                    Tu compra se ha procesado correctamente y ya estamos preparando tu pedido. Te enviaremos un correo con los detalles de envío.
                </motion.p>
                
                {orderId && (
                    <motion.div className="order-receipt-box mb-4 mx-auto" variants={itemVariants}>
                        <p className="receipt-label">NÚMERO DE ORDEN</p>
                        <p className="receipt-number">#{orderId}</p>
                    </motion.div>
                )}
                
                <motion.div className="d-flex flex-column gap-3 px-3 mt-4" variants={itemVariants}>
                    <button className="success-btn-primary w-100" onClick={() => navigate('/productos')}>
                        Seguir comprando
                    </button>
                    <button className="success-btn-outline w-100" onClick={() => navigate('/')}>
                        Volver al inicio
                    </button>
                </motion.div>
            </motion.div>
        </main>
    );
}

export default PagoExitoso;