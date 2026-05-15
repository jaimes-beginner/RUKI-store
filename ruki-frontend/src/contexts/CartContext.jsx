import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

const CART_KEY = "ruki_cart";
const CartContext = createContext(null);

export function CartProvider({ children }) {
    
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem(CART_KEY);
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Error al leer el carrito local:", error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }, [cart]);

    const addToCart = (producto, cantidad = 1) => {
        setCart(prevCart => {
            const size = producto.selectedSize || 'Única';
            const uniqueCartId = `${producto.id}-${size}`;
            
            const itemExistente = prevCart.find(item => item.uniqueId === uniqueCartId);

            if (itemExistente) {
                return prevCart.map(item => 
                    item.uniqueId === uniqueCartId 
                        ? { ...item, cantidad: item.cantidad + cantidad }
                        : item
                );
            } else {
                const precio = producto.cartPrice !== undefined 
                    ? producto.cartPrice 
                    : (producto.sale ? producto.salePrice : producto.basePrice);

                return [...prevCart, { 
                    ...producto, 
                    selectedSize: size,
                    uniqueId: uniqueCartId, 
                    cantidad: cantidad,
                    precioFinal: Number(precio)
                }];
            }
        });
    };

    const removeFromCart = (uniqueId) => {
        setCart((prevCart) => prevCart.filter(item => item.uniqueId !== uniqueId));
    };

    const updateQuantity = (uniqueId, newQuantity) => {
        if (newQuantity < 1) return;

        setCart((prevCart) => 
            prevCart.map(item => {
                if (item.uniqueId === uniqueId) {
                    const variantStock = item.variants?.find(v => v.size === item.selectedSize)?.stock;
                    const maxStock = variantStock !== undefined ? variantStock : item.stock;
                    
                    const safeQuantity = newQuantity > maxStock ? maxStock : newQuantity;
                    return { ...item, cantidad: safeQuantity };
                }
                return item;
            })
        );
    };

    /* La función limpia y protegida contra bucles infinitos */
    const clearCart = useCallback(() => {
        setCart(prevCart => prevCart.length === 0 ? prevCart : []);
    }, []);

    const cartTotals = useMemo(() => {
        return cart.reduce(
            (totals, item) => {
                const precioSeguro = Number(item.precioFinal) || Number(item.basePrice) || 0;
                const cantidadSegura = Number(item.cantidad) || 1;

                totals.count += cantidadSegura; 
                totals.amount += (precioSeguro * cantidadSegura);
                return totals;
            },
            { count: 0, amount: 0 }
        );
    }, [cart]);

    const value = {
        cart,
        cartCount: cartTotals.count,
        cartTotalAmount: cartTotals.amount,
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