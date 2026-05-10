import { createContext, useContext, useState, useEffect, useMemo } from "react";

const CART_KEY = "ruki_cart";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    
    // 1. Inicializamos el estado leyendo el disco duro del navegador (localStorage)
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem(CART_KEY);
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Error al leer el carrito local:", error);
            return [];
        }
    });

    // 2. Efecto Espejo: Cada vez que 'cart' cambie, lo guardamos en localStorage
    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }, [cart]);

    // 3. Acción: Agregar un producto al carrito
    const addToCart = (product, quantity = 1) => {
        setCart((prevCart) => {
            // Buscamos si el producto ya está en el carrito
            const existingItem = prevCart.find(item => item.id === product.id);

            if (existingItem) {
                // Si existe, validamos que no supere el stock máximo y sumamos
                const newQuantity = existingItem.quantity + quantity;
                const finalQuantity = newQuantity > product.stock ? product.stock : newQuantity;
                
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: finalQuantity } : item
                );
            } else {
                // Si no existe, lo agregamos como nuevo item
                // Guardamos todo el objeto producto para poder mostrar su foto y nombre en la interfaz
                return [...prevCart, { ...product, quantity }];
            }
        });
    };

    // 4. Acción: Quitar un producto completamente del carrito
    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter(item => item.id !== productId));
    };

    // 5. Acción: Actualizar la cantidad de un producto específico (+ o -)
    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return; // No permitimos cantidades menores a 1 por esta vía

        setCart((prevCart) => 
            prevCart.map(item => {
                if (item.id === productId) {
                    // Protegemos que no pida más del stock disponible
                    const safeQuantity = newQuantity > item.stock ? item.stock : newQuantity;
                    return { ...item, quantity: safeQuantity };
                }
                return item;
            })
        );
    };

    // 6. Acción: Vaciar el carrito (Se usará después de una compra exitosa)
    const clearCart = () => {
        setCart([]);
    };

    // 7. Cálculos automáticos usando useMemo para no recalcular si no hay cambios
    const cartTotals = useMemo(() => {
        return cart.reduce(
            (totals, item) => {
                totals.count += item.quantity; // Total de items (Ej: 3 poleras)
                totals.amount += (item.basePrice * item.quantity); // Dinero total
                return totals;
            },
            { count: 0, amount: 0 }
        );
    }, [cart]);

    // Lo que este contexto expone a toda la aplicación
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

// Hook personalizado para usar el carrito fácilmente en cualquier componente
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart debe usarse dentro de un CartProvider");
    }
    return context;
}