# MANUAL DE USUARIO TÉCNICO Y GUÍA DE INTEGRACIÓN (API & DEV GUIDE)

Este documento constituye la referencia técnica oficial del ecosistema de microservicios de **RUKI E-Commerce**. Está diseñado para que desarrolladores, arquitectos y equipos de DevOps comprendan la configuración, el consumo de la API y las reglas de negocio subyacentes del sistema.

---

## 1. GUÍA DE CONFIGURACIÓN Y ARRANQUE

### 1.1. Requisitos Previos
*   **Entorno de Ejecución:** Java Development Kit (JDK) 21.
*   **Gestor de Dependencias:** Maven 3.9+.
*   **Base de Datos:** PostgreSQL 15+ (Soportado nativamente vía Supabase con PgBouncer para Connection Pooling).
*   **Orquestación:** Docker y Docker Compose (Para despliegues locales o en la nube).
*   **Servicios de Terceros:** Cuentas activas en Stripe (Pasarela de Pagos) y Resend (Envío de correos transaccionales).

### 1.2. Variables de Entorno y Propiedades (`.env` / `application.yml`)
El sistema utiliza un enfoque *12-Factor App*, externalizando la configuración. Las siguientes variables deben estar presentes en el entorno del sistema o en el archivo `.env` de Docker Compose:

*   **Base de Datos:**
    *   `DB_URL`: URL JDBC de PostgreSQL (ej. `jdbc:postgresql://[host]:6543/postgres?prepareThreshold=0`).
    *   `DB_USER` / `DB_PASSWORD`: Credenciales de acceso.
*   **Seguridad y Red:**
    *   `JWT_SECRET`: Clave criptográfica Base64 (Mínimo 32 caracteres) para firmar los tokens HMAC-SHA256.
    *   `FRONTEND_URL`: Origen permitido para CORS (ej. `https://ruki-tienda.vercel.app`).
*   **Integraciones Externas:**
    *   `MAIL_USERNAME` / `MAIL_PASSWORD`: API Key de Resend.
    *   `STRIPE_SECRET_KEY`: Llave privada de la API de Stripe.
    *   `STRIPE_WEBHOOK_SECRET`: Llave de firma del Webhook de Stripe (Inicia con `whsec_`).
*   **Enrutamiento Interno (Feign):**
    *   `USER_SERVICE_URL` (`http://user-service:8080`)
    *   `PRODUCT_SERVICE_URL` (`http://product-service:8081`)
    *   `ORDER_SERVICE_URL` (`http://order-service:8082`)
    *   `PAYMENT_SERVICE_URL` (`http://payment-service:8083`)

### 1.3. Orden de Encendido
El sistema no utiliza un Servidor Eureka, delegando el descubrimiento a la red interna de Docker.
1.  **Base de Datos:** Asegurar conectividad con Supabase.
2.  **Microservicios Core:** Iniciar `user`, `product`, `order` y `payment` (El orden es indistinto gracias a la tolerancia a fallos de Feign, pero se recomienda iniciar `user` y `product` primero).
3.  **API Gateway:** Iniciar `ruki-gateway` (Puerto 8000). Todas las peticiones del frontend deben dirigirse exclusivamente a este puerto.

---

## 2. CATÁLOGO COMPLETO DE ENDPOINTS

*Nota: Todas las rutas asumen el prefijo del Gateway `/api-ruki`.*

### 2.1. Microservicio de Usuarios (User Service - Puerto 8080)

**Autenticación (`/auth`)**
*   `POST /auth/login`: Autentica al usuario.
    *   *Request:* `{"email": "user@ruki.com", "password": "Password1!"}`
    *   *Response (200 OK):* `{"token": "eyJ...", "user": {"id": 1, "email": "...", "role": "CUSTOMER", ...}}`
    *   *Errores:* `401 Unauthorized` (Credenciales inválidas).
*   `POST /auth/forgot-password`: Solicita recuperación de clave.
    *   *Request:* `{"email": "user@ruki.com"}`
    *   *Response (200 OK):* Mensaje genérico de éxito (Anti-Enumeración).
*   `POST /auth/reset-password`: Ejecuta el cambio de clave.
    *   *Request:* `{"token": "uuid-token", "newPassword": "NewPassword1!"}`

**Gestión de Usuarios (`/users`)**
*   `POST /users/create`: Registro público.
    *   *Request:* `{"email": "...", "password": "...", "firstName": "...", "lastName": "..."}`
    *   *Response (200 OK):* Objeto `UserResponse`.
    *   *Errores:* `409 Conflict` (Email ya registrado).
*   `GET /users/me`: Obtiene el perfil del token actual. (Requiere JWT).
*   `PUT /users/update/{id}`: Actualiza perfil. (Requiere JWT + Propiedad del recurso).
*   `PUT /users/delete/{id}`: Baja lógica del usuario. (Requiere JWT + Propiedad).
*   `GET /users/admin/paged?page=0&size=9`: Lista usuarios paginados. (Requiere `ROLE_ADMIN`).
*   `PUT /users/reactivate/{id}`: Restaura usuario inactivo. (Requiere `ROLE_ADMIN`).

**Gestión de Direcciones (`/addresses`)**
*   `POST /addresses/create`: Crea dirección.
    *   *Request:* `{"userId": 1, "street": "...", "city": "...", "region": "...", "zipCode": "..."}`
*   `GET /addresses/user/{userId}/active`: Lista direcciones activas del usuario.
*   `PUT /addresses/delete/{addressId}`: Baja lógica de la dirección.

### 2.2. Microservicio de Productos (Product Service - Puerto 8081)

**Catálogo Público (`/products` y `/categories`)**
*   `GET /categories/active`: Lista categorías disponibles.
*   `GET /products/filter?categoryId=1&size=M&sort=newest&page=0`: Búsqueda dinámica multicriterio.
    *   *Response (200 OK):* `{"content": [{...}], "pageNumber": 0, "totalPages": 5, "last": false}`
*   `GET /products/new-arrivals`: Últimos productos creados.
*   `GET /products/sale`: Productos con flag `isSale = true`.
*   `GET /products/{id}`: Detalle de un producto.

**Gestión de Inventario (Requiere `ROLE_ADMIN`)**
*   `POST /products/create`: Crea producto con variantes.
    *   *Request:* `{"name": "...", "basePrice": 10000, "categoryId": 1, "variants": [{"size": "M", "stock": 10}]}`
*   `PUT /products/update/{id}`: Actualiza producto y recalcula stock total.
*   `PUT /products/delete/{id}`: Baja lógica del producto.

**Endpoints Internos (S2S - Requieren Autenticación)**
*   `PUT /products/{id}/discount-stock?quantity=2&size=M`: Resta inventario.
    *   *Errores:* `409 Conflict` (Stock insuficiente).
*   `PUT /products/{id}/add-stock?quantity=2&size=M`: Suma inventario (Rollback).

### 2.3. Microservicio de Pedidos (Order Service - Puerto 8082)

**Gestión de Compras (`/orders`)**
*   `POST /orders/create`: Crea un pedido online.
    *   *Headers:* `Authorization: Bearer ...`, `Idempotency-Key: <UUID>`
    *   *Request:* `{"shippingAddressId": 1, "items": [{"productId": 100, "quantity": 2, "size": "M"}]}`
    *   *Response (200 OK):* `{"id": 500, "status": "PENDING", "totalAmount": 23800, ...}`
    *   *Errores:* `409 Conflict` (Petición duplicada o sin stock).
*   `POST /orders/physical`: Crea venta de mostrador (POS). Estado directo a `DELIVERED`. (Requiere `ROLE_ADMIN`).
*   `GET /orders/me`: Historial de compras del usuario.
*   `PUT /orders/me/{id}/cancel`: Cancela pedido propio (Solo si está `PENDING`).
*   `PUT /orders/admin/{id}/status?status=SHIPPED`: Actualiza estado logístico. (Requiere `ROLE_ADMIN`).

**Endpoints Internos (S2S)**
*   `PUT /orders/{id}/status?status=PAID`: Webhook interno llamado por Payment Service.

### 2.4. Microservicio de Pagos (Payment Service - Puerto 8083)

**Integración Stripe (`/payments`)**
*   `POST /payments/create?orderId=500`: Genera sesión de pago.
    *   *Response (200 OK):* `{"url": "https://checkout.stripe.com/..."}`
*   `POST /payments/webhook`: Recibe eventos de Stripe.
    *   *Headers:* `Stripe-Signature: ...`
    *   *Request:* Payload crudo de Stripe.
    *   *Errores:* `400 Bad Request` (Firma inválida).

---

## 3. REGLAS DE NEGOCIO Y CASOS DE USO DEL SISTEMA

### 3.1. Flujo de Registro y Autenticación
1.  El cliente envía sus datos a `POST /users/create`. El `UserServiceImpl` verifica que el email no exista (`existsByEmail`). Si existe, lanza `ResourceConflictException` (409).
2.  Si es válido, encripta la contraseña usando `BCryptPasswordEncoder`, asigna el rol `CUSTOMER` por defecto y guarda en PostgreSQL.
3.  Para iniciar sesión, el cliente llama a `POST /auth/login`. El `AuthenticationManager` valida el hash.
4.  El `AuthService` inyecta el `userId` y los `roles` en los *claims* del token y lo firma con HMAC-SHA256. El sistema es 100% *Stateless*; el token es la única prueba de identidad.

### 3.2. Flujo Completo de Compra Exitosa (Saga Coreografiada)
1.  **Protección de Idempotencia:** El frontend genera un UUID y lo envía en el header `Idempotency-Key`. El `IdempotencyFilter` del Order Service lo guarda en BD. Si el cliente hace doble clic, el filtro detecta el UUID duplicado y aborta con 409.
2.  **Orquestación:** `OrderServiceImpl` recibe el carrito. Itera sobre los ítems y llama síncronamente a `ProductClient.discountStock()` vía OpenFeign.
3.  **Reserva:** El Product Service valida el stock de la variante específica. Si hay, lo resta y retorna 200 OK.
4.  **Creación:** Order Service calcula el IVA (19%), guarda la orden como `PENDING` y retorna el ID al frontend.
5.  **Pago:** El frontend llama a Payment Service. Este consulta el total a Order Service, crea una sesión en Stripe y guarda un `PaymentRecord` en `PENDING`.
6.  **Confirmación (Webhook):** El cliente paga. Stripe llama a `/payments/webhook`. Payment Service valida la firma criptográfica, actualiza su registro a `SUCCESS` y llama a Order Service para cambiar la orden a `PAID`.
7.  **Notificación:** Order Service dispara un hilo secundario (`@Async`) que usa `HttpClient` para enviar la boleta vía Resend API.

### 3.3. Escenarios de Excepción y Compensación
*   **Fallo por Falta de Stock (Rollback Manual):** Si el cliente pide 3 productos, el sistema descuenta el 1ro y el 2do, pero el 3ro no tiene stock, el Product Service lanza 409. El bloque `catch` del Order Service intercepta el error, itera sobre los productos ya procesados y llama a `ProductClient.addStock()` para devolverlos a la bodega, garantizando la consistencia de datos.
*   **Carrito Abandonado (Cron Job de Limpieza):** Si el cliente llega a Stripe pero cierra la pestaña, el inventario queda "secuestrado" en estado `PENDING`.
    *   El `OrderCleanupScheduler` se ejecuta cada 5 minutos (`@Scheduled`).
    *   Busca IDs de órdenes `PENDING` con más de 30 minutos de antigüedad usando una transacción de solo lectura (`readOnly = true`).
    *   Por cada orden, ejecuta `rollbackAbandonedOrder` de forma asíncrona (`@Async`).
    *   El `FeignClientInterceptor` detecta que no hay un usuario HTTP activo, genera un **Token JWT de Sistema** con rol `ADMIN` al vuelo, y llama a Product Service para devolver el stock. Finalmente, marca la orden como `CANCELLED`.
*   **Fallo de Red (Trazabilidad):** Si un microservicio no responde, el Gateway lanza un `504 Gateway Timeout`. Gracias al `CorrelationIdFilter`, se inyecta un `X-Correlation-ID` en el MDC de los logs, permitiendo a los desarrolladores rastrear la petición exacta a través de todos los contenedores en DigitalOcean.
