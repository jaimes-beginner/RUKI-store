import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "./AuthContext"; // IMPORTANTE: Importamos para saber quién está logueado

const CartContext = createContext(null);

export function CartProvider({ children }) {
    /*
        Obtenemos el usuario actual
    */
    const { usuario, isAuthenticated } = useAuth();
    
    /*
        Generamos una llave de carrito 
        única basada en el usuario
    */
    const cartKey = useMemo(() => {
        if (isAuthenticated && usuario && usuario.id) {

            /*
                Carrito privado del usuario
            */
            return `ruki_cart_user_${usuario.id}`; 
        }

        /*
            Carrito público (invitado)
        */
        return "ruki_cart_guest"; 
    }, [isAuthenticated, usuario]);

    /*
        Inicializamos el estado del carrito 
        LEYENDO de la llave correcta
    */
    const [cart, setCart] = useState([]);

    /*
        Cada vez que cambie de usuario (o inicie 
        sesión), cargamos SU carrito correspondiente
    */
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(cartKey);
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            } else {

                /*
                    Si este usuario no tiene carrito 
                    guardado, arranca vacío
                */
                setCart([]); 
            }
        } catch (error) {
            console.error("Error al leer el carrito local:", error);
            setCart([]);
        }

    /*
        El useEffect se dispara cuando la llave 
        cambia (cuando alguien hace login/logout)
    */
    }, [cartKey]); 

    /*
        Cada vez que el carrito cambie (agrega, quita 
        items), guardamos en la llave correcta
    */
    useEffect(() => {
        
        /*
            Evitamos guardar un array vacío sobreescribiendo 
            algo por error durante la carga inicial
        */
        localStorage.setItem(cartKey, JSON.stringify(cart));
    }, [cart, cartKey]);

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

    const clearCart = useCallback(() => {

        /*
            Simplemente lo vaciamos
        */
        setCart([]); 
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