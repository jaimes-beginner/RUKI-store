import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "./AuthContext"; 

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { usuario, isAuthenticated } = useAuth();
    
    const cartKey = useMemo(() => {
        return (isAuthenticated && usuario && usuario.id) 
            ? `ruki_cart_user_${usuario.id}` 
            : "ruki_cart_guest"; 
    }, [isAuthenticated, usuario]);

    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem(cartKey);
            return savedCart ? JSON.parse(savedCart) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(cartKey);
            setCart(savedCart ? JSON.parse(savedCart) : []);
        } catch {
            setCart([]);
        }
    }, [cartKey]); 


    const addToCart = (producto, cantidad = 1) => {
        setCart(prevCart => {
            const size = producto.selectedSize || 'Única';
            const uniqueCartId = `${producto.id}-${size}`;
            const itemExistente = prevCart.find(item => item.uniqueId === uniqueCartId);

            let newCart;
            if (itemExistente) {
                newCart = prevCart.map(item => 
                    item.uniqueId === uniqueCartId 
                        ? { ...item, cantidad: item.cantidad + cantidad }
                        : item
                );
            } else {
                const precio = producto.cartPrice !== undefined 
                    ? producto.cartPrice 
                    : (producto.sale ? producto.salePrice : producto.basePrice);

                newCart = [...prevCart, { 
                    ...producto, 
                    selectedSize: size,
                    uniqueId: uniqueCartId, 
                    cantidad: cantidad,
                    precioFinal: Number(precio)
                }];
            }
            
            // GUARDADO INSTANTÁNEO
            localStorage.setItem(cartKey, JSON.stringify(newCart));
            return newCart;
        });
    };

    const removeFromCart = (uniqueId) => {
        setCart(prevCart => {
            const newCart = prevCart.filter(item => item.uniqueId !== uniqueId);
            // GUARDADO INSTANTÁNEO
            localStorage.setItem(cartKey, JSON.stringify(newCart));
            return newCart;
        });
    };

    const updateQuantity = (uniqueId, newQuantity) => {
        if (newQuantity < 1) return;

        setCart(prevCart => {
            const newCart = prevCart.map(item => {
                if (item.uniqueId === uniqueId) {
                    const variantStock = item.variants?.find(v => v.size === item.selectedSize)?.stock;
                    const maxStock = variantStock !== undefined ? variantStock : item.stock;
                    const safeQuantity = newQuantity > maxStock ? maxStock : newQuantity;
                    return { ...item, cantidad: safeQuantity };
                }
                return item;
            });
            // GUARDADO INSTANTÁNEO
            localStorage.setItem(cartKey, JSON.stringify(newCart));
            return newCart;
        });
    };


    const clearCart = useCallback(() => {
        setCart([]); 
        localStorage.setItem(cartKey, JSON.stringify([]));  // Sobrescribe con vacío
        localStorage.removeItem("ruki_cart_guest");         // Limpia basura de invitado por si acaso
    }, [cartKey]);



    const cartTotals = useMemo(() => {
        const totalesBasicos = cart.reduce(
            (totals, item) => {
                const precioSeguro = Number(item.precioFinal) || Number(item.basePrice) || 0;
                const cantidadSegura = Number(item.cantidad) || 1;

                totals.count += cantidadSegura; 
                totals.amount += (precioSeguro * cantidadSegura);
                return totals;
            },
            { count: 0, amount: 0 }
        );

        const subtotalNeto = totalesBasicos.amount;
        const ivaAmount = Math.round(subtotalNeto * 0.19); 
        const totalAmount = subtotalNeto + ivaAmount;

        return {
            count: totalesBasicos.count,
            subtotal: subtotalNeto,
            iva: ivaAmount,
            totalAmount: totalAmount
        };
    }, [cart]);

    const value = {
        cart,
        cartCount: cartTotals.count,
        cartTotalAmount: cartTotals.totalAmount,
        cartSubtotal: cartTotals.subtotal,
        cartIva: cartTotals.iva,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart debe usarse dentro de un CartProvider");
    }
    return context;
}