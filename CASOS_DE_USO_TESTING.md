# 📋 CASOS DE USO - Sistema Floristería Sacuanjoche

**Versión:** 1.0  
**Fecha:** 2024  
**Propósito:** Documento de casos de uso para testing del sistema completo

---

## 📑 Índice

1. [Usuarios No Autenticados (Visitantes)](#1-usuarios-no-autenticados-visitantes)
2. [Clientes](#2-clientes)
3. [Empleados](#3-empleados)
4. [Administradores](#4-administradores)
5. [Casos de Uso Transversales](#5-casos-de-uso-transversales)

---

## 1. USUARIOS NO AUTENTICADOS (VISITANTES)

### 1.1 Navegación en Landing Page

#### CU-001: Visualizar Landing Page
**Prioridad:** Alta  
**Actor:** Visitante  
**Precondiciones:** Usuario no autenticado

**Pasos:**
1. Acceder a la URL raíz del sistema (`/`)
2. Verificar que se carga la landing page
3. Verificar que se muestran las siguientes secciones:
   - Hero con imagen de flor y texto principal
   - Sección de Servicios
   - Galería de imágenes
   - Sección "Historia"
   - Sección de Contacto

**Resultado Esperado:**
- La landing page carga correctamente
- Todas las secciones son visibles
- Las animaciones funcionan sin errores
- El diseño es responsive (móvil, tablet, desktop)

**Casos de Prueba:**
- ✅ CU-001.1: Verificar carga en desktop (1920x1080)
- ✅ CU-001.2: Verificar carga en tablet (768x1024)
- ✅ CU-001.3: Verificar carga en móvil (375x667)
- ✅ CU-001.4: Verificar que las animaciones respetan `prefers-reduced-motion`

---

#### CU-002: Navegar entre secciones de la Landing Page
**Prioridad:** Alta  
**Actor:** Visitante

**Pasos:**
1. Hacer clic en el menú de navegación
2. Hacer clic en "Inicio" → Verificar scroll a sección Hero
3. Hacer clic en "Servicios" → Verificar scroll a sección Servicios
4. Hacer clic en "Galería" → Verificar scroll a sección Galería
5. Hacer clic en "Historia" → Verificar scroll a sección Historia
6. Hacer clic en "Contacto" → Verificar scroll a sección Contacto

**Resultado Esperado:**
- El scroll es suave (smooth scroll)
- La navegación funciona correctamente
- El header se mantiene visible durante el scroll

---

#### CU-003: Explorar Catálogo Público
**Prioridad:** Alta  
**Actor:** Visitante

**Pasos:**
1. Acceder a `/catalogo` o hacer clic en "Catálogo" del menú
2. Verificar que se muestran los arreglos florales
3. Verificar que hay paginación si hay más de 12 arreglos
4. Verificar que cada arreglo muestra:
   - Imagen
   - Nombre
   - Precio
   - Botón "Ver Detalles" o similar

**Resultado Esperado:**
- El catálogo carga correctamente
- Los arreglos se muestran en grid responsive
- La paginación funciona

---

#### CU-004: Filtrar Arreglos en Catálogo
**Prioridad:** Media  
**Actor:** Visitante

**Pasos:**
1. Acceder a `/catalogo`
2. Usar el campo de búsqueda para buscar por nombre
3. Filtrar por rango de precios (mínimo y máximo)
4. Filtrar por tipo de flor
5. Filtrar por forma de arreglo
6. Combinar múltiples filtros
7. Limpiar filtros

**Resultado Esperado:**
- Los filtros se aplican correctamente
- Los resultados se actualizan en tiempo real
- La paginación se resetea al cambiar filtros
- El botón "Limpiar filtros" funciona

**Casos de Prueba:**
- ✅ CU-004.1: Búsqueda con texto que existe
- ✅ CU-004.2: Búsqueda con texto que no existe
- ✅ CU-004.3: Filtro de precio mínimo mayor que máximo (debe mostrar error)
- ✅ CU-004.4: Combinar búsqueda + filtro de precio + filtro de flor

---

#### CU-005: Ordenar Arreglos en Catálogo
**Prioridad:** Media  
**Actor:** Visitante

**Pasos:**
1. Acceder a `/catalogo`
2. Seleccionar ordenamiento por precio (ascendente)
3. Seleccionar ordenamiento por precio (descendente)
4. Seleccionar ordenamiento por nombre (A-Z)
5. Seleccionar ordenamiento por nombre (Z-A)

**Resultado Esperado:**
- Los arreglos se ordenan correctamente según el criterio seleccionado
- El ordenamiento se mantiene al cambiar de página

---

### 1.2 Registro y Autenticación

#### CU-006: Registrarse como Cliente
**Prioridad:** Alta  
**Actor:** Visitante

**Pasos:**
1. Acceder a `/register` o hacer clic en "Registrarse"
2. Completar el formulario con:
   - Email válido
   - Contraseña (mínimo 8 caracteres)
   - Confirmar contraseña
   - Datos personales (nombre, apellido, teléfono, etc.)
3. Aceptar términos y condiciones (si aplica)
4. Hacer clic en "Registrarse"

**Resultado Esperado:**
- El usuario se registra exitosamente
- Se muestra mensaje de éxito
- El usuario es redirigido al login o directamente autenticado
- Se crea el perfil de cliente en el sistema

**Casos de Prueba:**
- ✅ CU-006.1: Registro con email válido
- ✅ CU-006.2: Registro con email duplicado (debe mostrar error)
- ✅ CU-006.3: Registro con contraseña menor a 8 caracteres (debe mostrar error)
- ✅ CU-006.4: Registro con contraseñas que no coinciden (debe mostrar error)
- ✅ CU-006.5: Registro con campos obligatorios vacíos (debe mostrar errores)

---

#### CU-007: Iniciar Sesión
**Prioridad:** Alta  
**Actor:** Visitante / Cliente / Empleado / Admin

**Pasos:**
1. Acceder a `/login`
2. Ingresar email válido
3. Ingresar contraseña correcta
4. Hacer clic en "Iniciar Sesión"

**Resultado Esperado:**
- El usuario inicia sesión exitosamente
- Se muestra mensaje de bienvenida
- El usuario es redirigido según su rol:
  - Cliente → Landing page o carrito
  - Empleado/Admin → Panel administrativo (`/admin`)

**Casos de Prueba:**
- ✅ CU-007.1: Login con credenciales correctas (cliente)
- ✅ CU-007.2: Login con credenciales correctas (empleado)
- ✅ CU-007.3: Login con credenciales correctas (admin)
- ✅ CU-007.4: Login con email incorrecto (debe mostrar error)
- ✅ CU-007.5: Login con contraseña incorrecta (debe mostrar error)
- ✅ CU-007.6: Login con cuenta bloqueada (debe mostrar mensaje de bloqueo)
- ✅ CU-007.7: Múltiples intentos fallidos (debe bloquear cuenta temporalmente)

---

#### CU-008: Recuperar Contraseña
**Prioridad:** Baja  
**Actor:** Visitante

**Nota:** Verificar si esta funcionalidad está implementada

**Pasos:**
1. Acceder a `/login`
2. Hacer clic en "¿Olvidaste tu contraseña?"
3. Ingresar email registrado
4. Verificar que se envía email de recuperación

**Resultado Esperado:**
- Se envía email con link de recuperación
- El link permite restablecer la contraseña

---

## 2. CLIENTES

### 2.1 Gestión de Carrito de Compras

#### CU-009: Agregar Arreglo al Carrito
**Prioridad:** Alta  
**Actor:** Cliente autenticado

**Precondiciones:** Usuario autenticado como cliente

**Pasos:**
1. Navegar a `/catalogo`
2. Hacer clic en un arreglo para ver detalles
3. Seleccionar cantidad (si aplica)
4. Hacer clic en "Agregar al Carrito"
5. Verificar que aparece notificación de éxito
6. Verificar que el contador del carrito se actualiza

**Resultado Esperado:**
- El arreglo se agrega al carrito
- Se muestra notificación de éxito
- El contador del carrito muestra el número correcto
- El carrito persiste entre sesiones

**Casos de Prueba:**
- ✅ CU-009.1: Agregar un arreglo por primera vez
- ✅ CU-009.2: Agregar el mismo arreglo múltiples veces (debe incrementar cantidad)
- ✅ CU-009.3: Agregar arreglo sin estar autenticado (debe redirigir a login)

---

#### CU-010: Ver Carrito de Compras
**Prioridad:** Alta  
**Actor:** Cliente autenticado

**Pasos:**
1. Acceder a `/carrito` o hacer clic en el icono del carrito
2. Verificar que se muestran todos los arreglos agregados
3. Verificar que se muestra:
   - Imagen del arreglo
   - Nombre
   - Precio unitario
   - Cantidad
   - Subtotal por item
   - Total del carrito

**Resultado Esperado:**
- El carrito muestra todos los items correctamente
- Los cálculos de subtotales y total son correctos
- El diseño es responsive

---

#### CU-011: Modificar Cantidad en Carrito
**Prioridad:** Alta  
**Actor:** Cliente autenticado

**Pasos:**
1. Acceder a `/carrito`
2. Hacer clic en el botón "+" para aumentar cantidad de un arreglo
3. Verificar que la cantidad se actualiza
4. Verificar que el subtotal y total se recalculan
5. Hacer clic en el botón "-" para disminuir cantidad
6. Verificar que la cantidad no puede ser menor a 1

**Resultado Esperado:**
- Las cantidades se actualizan correctamente
- Los cálculos se actualizan en tiempo real
- No se permite cantidad menor a 1

---

#### CU-012: Eliminar Arreglo del Carrito
**Prioridad:** Alta  
**Actor:** Cliente autenticado

**Pasos:**
1. Acceder a `/carrito`
2. Hacer clic en el botón de eliminar (icono de basura) de un arreglo
3. Confirmar eliminación (si hay confirmación)
4. Verificar que el arreglo desaparece del carrito
5. Verificar que el total se actualiza

**Resultado Esperado:**
- El arreglo se elimina del carrito
- El total se recalcula correctamente
- Si el carrito queda vacío, se muestra mensaje apropiado

---

### 2.2 Proceso de Checkout y Pago

#### CU-013: Iniciar Proceso de Checkout
**Prioridad:** Alta  
**Actor:** Cliente autenticado

**Precondiciones:** Carrito con al menos un arreglo

**Pasos:**
1. Acceder a `/carrito`
2. Verificar que el carrito tiene items
3. Hacer clic en "Proceder al Checkout" o botón similar
4. Verificar que se redirige a `/carrito/checkout`

**Resultado Esperado:**
- Se redirige a la página de checkout
- Se muestra resumen del carrito
- Se muestran opciones de pago disponibles

---

#### CU-014: Seleccionar Método de Pago (PayPal)
**Prioridad:** Alta  
**Actor:** Cliente autenticado

**Pasos:**
1. Acceder a `/carrito/checkout`
2. Verificar que se muestra el total en córdobas (NIO)
3. Verificar que se muestra el total convertido a USD (para PayPal)
4. Hacer clic en "Pagar con PayPal"
5. Verificar que se redirige a PayPal
6. Completar el pago en PayPal
7. Verificar que se redirige de vuelta al sistema

**Resultado Esperado:**
- La conversión de moneda es correcta (1 USD = 36.7 NIO)
- Se crea el pago en el sistema
- Se redirige correctamente a PayPal
- Después del pago, se redirige a `/payment/success` o `/carrito/checkout/completar`

**Casos de Prueba:**
- ✅ CU-014.1: Pago exitoso con PayPal
- ✅ CU-014.2: Cancelar pago en PayPal (debe redirigir a `/payment/cancel`)
- ✅ CU-014.3: Error en el proceso de pago (debe mostrar mensaje de error)

---

#### CU-015: Completar Información de Entrega
**Prioridad:** Alta  
**Actor:** Cliente autenticado

**Precondiciones:** Pago completado exitosamente

**Pasos:**
1. Después de completar el pago, acceder a `/carrito/checkout/completar`
2. Completar el formulario de entrega:
   - Seleccionar dirección existente o crear nueva
   - Fecha de entrega
   - Hora de entrega (si aplica)
   - Notas adicionales (opcional)
3. Hacer clic en "Completar Pedido"

**Resultado Esperado:**
- Se crea el pedido en el sistema
- Se muestra confirmación del pedido
- Se redirige a la página de confirmación con número de pedido

**Casos de Prueba:**
- ✅ CU-015.1: Completar pedido con dirección existente
- ✅ CU-015.2: Completar pedido creando nueva dirección
- ✅ CU-015.3: Completar pedido sin fecha de entrega (debe mostrar error)
- ✅ CU-015.4: Completar pedido con fecha de entrega en el pasado (debe mostrar error)

---

#### CU-016: Ver Confirmación de Pedido
**Prioridad:** Alta  
**Actor:** Cliente autenticado

**Pasos:**
1. Después de completar el pedido
2. Verificar que se muestra:
   - Número de pedido
   - Resumen de items
   - Dirección de entrega
   - Fecha de entrega estimada
   - Total pagado
   - Estado del pedido

**Resultado Esperado:**
- Se muestra toda la información del pedido
- El número de pedido es único y rastreable
- Hay opción para imprimir o descargar comprobante

---

### 2.3 Gestión de Perfil

#### CU-017: Ver Perfil de Usuario
**Prioridad:** Media  
**Actor:** Cliente autenticado

**Pasos:**
1. Acceder a `/admin/perfil` o hacer clic en el menú de usuario
2. Verificar que se muestra:
   - Información personal
   - Email
   - Roles asignados
   - Estado de la cuenta
   - Historial de pedidos (si aplica)

**Resultado Esperado:**
- Se muestra toda la información del perfil
- La información es correcta y actualizada

---

#### CU-018: Editar Perfil
**Prioridad:** Media  
**Actor:** Cliente autenticado

**Pasos:**
1. Acceder a `/admin/perfil`
2. Hacer clic en "Editar" o botón similar
3. Modificar información personal (nombre, teléfono, etc.)
4. Guardar cambios
5. Verificar que los cambios se guardan

**Resultado Esperado:**
- Los cambios se guardan correctamente
- Se muestra mensaje de éxito
- La información actualizada se refleja inmediatamente

---

#### CU-019: Gestionar Direcciones
**Prioridad:** Media  
**Actor:** Cliente autenticado

**Pasos:**
1. Acceder al perfil o sección de direcciones
2. Ver lista de direcciones guardadas
3. Agregar nueva dirección:
   - Completar formulario con datos de dirección
   - Guardar
4. Editar dirección existente
5. Eliminar dirección (si no está asociada a pedidos)

**Resultado Esperado:**
- Se pueden gestionar múltiples direcciones
- Las direcciones se guardan correctamente
- Se puede seleccionar dirección por defecto

---

### 2.4 Cerrar Sesión

#### CU-020: Cerrar Sesión
**Prioridad:** Alta  
**Actor:** Cliente autenticado

**Pasos:**
1. Hacer clic en el menú de usuario
2. Hacer clic en "Cerrar Sesión"
3. Confirmar (si hay confirmación)

**Resultado Esperado:**
- La sesión se cierra correctamente
- Se elimina el token de autenticación
- Se redirige a la landing page o login
- El carrito se mantiene (si está configurado así)

---

## 3. EMPLEADOS

### 3.1 Acceso al Panel Administrativo

#### CU-021: Acceder al Panel Administrativo
**Prioridad:** Alta  
**Actor:** Empleado (vendedor, conductor, gerente)

**Precondiciones:** Usuario autenticado con rol de empleado

**Pasos:**
1. Iniciar sesión con credenciales de empleado
2. Verificar que se redirige a `/admin`
3. Verificar que se muestra el dashboard
4. Verificar que se muestra el menú lateral (sidebar) con opciones según rol

**Resultado Esperado:**
- Acceso correcto al panel administrativo
- El menú muestra solo las opciones permitidas según el rol
- El dashboard carga correctamente

**Casos de Prueba:**
- ✅ CU-021.1: Acceso con rol "vendedor"
- ✅ CU-021.2: Acceso con rol "conductor"
- ✅ CU-021.3: Acceso con rol "gerente"
- ✅ CU-021.4: Intento de acceso sin rol adecuado (debe mostrar error o redirigir)

---

### 3.2 Gestión de Pedidos (Vendedor)

#### CU-022: Ver Lista de Pedidos
**Prioridad:** Alta  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a `/admin/pedidos`
2. Verificar que se muestra tabla con pedidos
3. Verificar que se muestran columnas:
   - Cliente
   - Dirección
   - Total
   - Fecha de creación
   - Fecha de entrega estimada
   - Estado
4. Verificar paginación si hay muchos pedidos
5. Verificar búsqueda y filtros

**Resultado Esperado:**
- La lista de pedidos se carga correctamente
- Los datos son precisos
- La paginación funciona
- Los filtros funcionan

---

#### CU-023: Crear Nuevo Pedido Manualmente
**Prioridad:** Alta  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a `/admin/pedidos/nuevo`
2. Seleccionar cliente (búsqueda o crear nuevo)
3. Agregar arreglos al pedido:
   - Buscar arreglo
   - Seleccionar cantidad
   - Agregar al pedido
4. Configurar dirección de entrega
5. Configurar fecha y hora de entrega
6. Agregar notas (opcional)
7. Calcular total
8. Guardar pedido

**Resultado Esperado:**
- El pedido se crea exitosamente
- Se muestra mensaje de éxito
- El pedido aparece en la lista
- Se puede generar factura para el pedido

**Casos de Prueba:**
- ✅ CU-023.1: Crear pedido con cliente existente
- ✅ CU-023.2: Crear pedido creando nuevo cliente
- ✅ CU-023.3: Crear pedido sin arreglos (debe mostrar error)
- ✅ CU-023.4: Crear pedido sin fecha de entrega (debe mostrar error)

---

#### CU-024: Editar Pedido Existente
**Prioridad:** Alta  
**Actor:** Vendedor / Gerente / Admin

**Precondiciones:** Pedido existente en estado editable

**Pasos:**
1. Acceder a `/admin/pedidos`
2. Hacer clic en "Editar" de un pedido
3. Modificar información:
   - Agregar/quitar arreglos
   - Modificar cantidades
   - Cambiar dirección
   - Cambiar fecha de entrega
4. Guardar cambios

**Resultado Esperado:**
- Los cambios se guardan correctamente
- El total se recalcula automáticamente
- Se muestra mensaje de éxito

**Casos de Prueba:**
- ✅ CU-024.1: Editar pedido en estado "pendiente"
- ✅ CU-024.2: Intentar editar pedido en estado "completado" (debe mostrar restricción)
- ✅ CU-024.3: Editar pedido y cambiar cliente

---

#### CU-025: Ver Detalles de Pedido
**Prioridad:** Alta  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a `/admin/pedidos`
2. Hacer clic en un pedido o en "Ver Detalles"
3. Verificar que se muestra modal o página con:
   - Información del cliente
   - Lista de arreglos con cantidades y precios
   - Dirección de entrega
   - Fecha y hora de entrega
   - Estado del pedido
   - Información de pago (si aplica)
   - Historial de cambios

**Resultado Esperado:**
- Se muestra toda la información del pedido
- La información es precisa y completa

---

#### CU-026: Cambiar Estado de Pedido
**Prioridad:** Alta  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a detalles de un pedido
2. Seleccionar nuevo estado del menú desplegable
3. Confirmar cambio
4. Verificar que el estado se actualiza

**Estados posibles:**
- Pendiente
- En preparación
- Listo para entrega
- En camino
- Entregado
- Cancelado

**Resultado Esperado:**
- El estado se actualiza correctamente
- Se registra el cambio en el historial
- Se notifica al cliente (si está configurado)

---

#### CU-027: Generar Orden de Trabajo (PDF)
**Prioridad:** Media  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a detalles de un pedido
2. Hacer clic en "Generar Orden de Trabajo" o "Descargar PDF"
3. Verificar que se descarga el PDF
4. Verificar que el PDF contiene:
   - Información del pedido
   - Lista de arreglos
   - Instrucciones de preparación
   - Dirección de entrega

**Resultado Esperado:**
- El PDF se genera correctamente
- El contenido es preciso
- El formato es legible y profesional

---

### 3.3 Gestión de Facturas

#### CU-028: Ver Lista de Facturas
**Prioridad:** Alta  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a `/admin/facturas`
2. Verificar que se muestra tabla con facturas
3. Verificar columnas:
   - Número de factura
   - Cliente
   - Pedido asociado
   - Monto
   - Fecha de emisión
   - Estado
4. Verificar búsqueda y filtros

**Resultado Esperado:**
- La lista se carga correctamente
- Los datos son precisos
- Los filtros funcionan

---

#### CU-029: Crear Nueva Factura desde Pedido
**Prioridad:** Alta  
**Actor:** Vendedor / Gerente / Admin

**Precondiciones:** Pedido existente sin factura

**Pasos:**
1. Acceder a detalles de un pedido
2. Hacer clic en "Generar Factura" o "Nueva Factura"
3. Verificar que se pre-llenan los datos del pedido
4. Revisar y ajustar información si es necesario:
   - Datos del cliente
   - Items facturados
   - Impuestos (si aplica)
   - Descuentos (si aplica)
5. Guardar factura

**Resultado Esperado:**
- La factura se crea exitosamente
- Se asocia correctamente al pedido
- Se genera número de factura único
- Se muestra mensaje de éxito

---

#### CU-030: Crear Factura Manual (Sin Pedido)
**Prioridad:** Media  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a `/admin/facturas`
2. Hacer clic en "Nueva Factura"
3. Seleccionar cliente
4. Agregar items manualmente:
   - Descripción
   - Cantidad
   - Precio unitario
5. Calcular totales
6. Guardar factura

**Resultado Esperado:**
- La factura se crea correctamente
- Los cálculos son precisos
- Se genera número de factura

---

#### CU-031: Editar Factura
**Prioridad:** Media  
**Actor:** Vendedor / Gerente / Admin

**Precondiciones:** Factura en estado editable

**Pasos:**
1. Acceder a `/admin/facturas/:idFactura/editar`
2. Modificar información:
   - Items
   - Cantidades
   - Precios
3. Guardar cambios

**Resultado Esperado:**
- Los cambios se guardan
- El total se recalcula
- Se muestra mensaje de éxito

**Nota:** Verificar qué estados permiten edición

---

#### CU-032: Anular Factura
**Prioridad:** Alta  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a detalles de una factura
2. Hacer clic en "Anular Factura"
3. Confirmar anulación
4. Ingresar motivo de anulación (si se requiere)

**Resultado Esperado:**
- La factura se marca como anulada
- Se registra el motivo
- No se puede editar una factura anulada
- Se muestra mensaje de confirmación

---

#### CU-033: Generar PDF de Factura
**Prioridad:** Alta  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a detalles de una factura
2. Hacer clic en "Descargar PDF" o "Imprimir"
3. Verificar que se descarga el PDF
4. Verificar que el PDF contiene:
   - Encabezado con logo e información de la empresa
   - Número de factura
   - Datos del cliente
   - Items facturados con detalles
   - Subtotal, impuestos, total
   - Fecha de emisión
   - Estado de la factura

**Resultado Esperado:**
- El PDF se genera correctamente
- El formato es profesional
- La información es precisa

---

### 3.4 Gestión de Clientes

#### CU-034: Ver Lista de Clientes
**Prioridad:** Alta  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a `/admin/clientes`
2. Verificar que se muestra tabla con clientes
3. Verificar columnas:
   - Nombre completo
   - Email
   - Teléfono
   - Direcciones
   - Fecha de registro
4. Verificar búsqueda y filtros

**Resultado Esperado:**
- La lista se carga correctamente
- Los datos son precisos
- La búsqueda funciona

---

#### CU-035: Crear Nuevo Cliente
**Prioridad:** Alta  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a `/admin/clientes`
2. Hacer clic en "Nuevo Cliente"
3. Completar formulario:
   - Información personal (nombre, apellido, etc.)
   - Email
   - Teléfono
   - Dirección (opcional)
4. Guardar cliente

**Resultado Esperado:**
- El cliente se crea exitosamente
- Se muestra mensaje de éxito
- El cliente aparece en la lista

**Casos de Prueba:**
- ✅ CU-035.1: Crear cliente con email válido
- ✅ CU-035.2: Crear cliente con email duplicado (debe mostrar error)
- ✅ CU-035.3: Crear cliente con campos obligatorios vacíos (debe mostrar errores)

---

#### CU-036: Editar Cliente
**Prioridad:** Alta  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a lista de clientes
2. Hacer clic en "Editar" de un cliente
3. Modificar información
4. Guardar cambios

**Resultado Esperado:**
- Los cambios se guardan correctamente
- Se muestra mensaje de éxito

---

#### CU-037: Ver Detalles de Cliente
**Prioridad:** Media  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a lista de clientes
2. Hacer clic en un cliente o en "Ver Detalles"
3. Verificar que se muestra:
   - Información personal completa
   - Direcciones asociadas
   - Historial de pedidos
   - Historial de facturas

**Resultado Esperado:**
- Se muestra toda la información del cliente
- El historial es preciso

---

#### CU-038: Gestionar Direcciones de Cliente
**Prioridad:** Media  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a detalles de un cliente
2. Agregar nueva dirección
3. Editar dirección existente
4. Eliminar dirección (si no está asociada a pedidos)
5. Marcar dirección como predeterminada

**Resultado Esperado:**
- Se pueden gestionar múltiples direcciones
- Las direcciones se guardan correctamente

---

### 3.5 Gestión de Arreglos

#### CU-039: Ver Lista de Arreglos
**Prioridad:** Alta  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a `/admin/arreglos`
2. Verificar que se muestra vista de tarjetas o tabla
3. Verificar que cada arreglo muestra:
   - Imagen
   - Nombre
   - Precio
   - Estado
4. Verificar búsqueda y filtros
5. Verificar paginación

**Resultado Esperado:**
- La lista se carga correctamente
- Los arreglos se muestran con sus imágenes
- La búsqueda y filtros funcionan

---

#### CU-040: Crear Nuevo Arreglo
**Prioridad:** Alta  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a `/admin/arreglos`
2. Hacer clic en "Nuevo Arreglo"
3. Completar formulario:
   - Nombre
   - Descripción
   - Precio
   - Forma de arreglo
   - Estado (activo/inactivo)
4. Guardar arreglo
5. Agregar imágenes:
   - Subir imagen principal
   - Subir imágenes adicionales (opcional)
6. Agregar flores asociadas:
   - Seleccionar flores del catálogo
   - Especificar cantidades
7. Agregar accesorios asociados (opcional)
8. Guardar asociaciones

**Resultado Esperado:**
- El arreglo se crea exitosamente
- Las imágenes se suben correctamente
- Las asociaciones se guardan
- Se muestra mensaje de éxito

**Casos de Prueba:**
- ✅ CU-040.1: Crear arreglo con todos los campos
- ✅ CU-040.2: Crear arreglo sin precio (debe mostrar error)
- ✅ CU-040.3: Crear arreglo sin nombre (debe mostrar error)
- ✅ CU-040.4: Subir imagen con formato no válido (debe mostrar error)
- ✅ CU-040.5: Subir imagen muy grande (debe mostrar error o comprimir)

---

#### CU-041: Editar Arreglo
**Prioridad:** Alta  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a lista de arreglos
2. Hacer clic en "Editar" de un arreglo
3. Modificar información
4. Agregar/quitar imágenes
5. Modificar asociaciones de flores y accesorios
6. Guardar cambios

**Resultado Esperado:**
- Los cambios se guardan correctamente
- Se muestra mensaje de éxito

---

#### CU-042: Ver Detalles de Arreglo
**Prioridad:** Media  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a lista de arreglos
2. Hacer clic en un arreglo o en "Ver Detalles"
3. Verificar que se muestra:
   - Información completa
   - Galería de imágenes
   - Flores asociadas con cantidades
   - Accesorios asociados
   - Historial de uso en pedidos

**Resultado Esperado:**
- Se muestra toda la información
- Las imágenes se cargan correctamente

---

#### CU-043: Cambiar Estado de Arreglo
**Prioridad:** Media  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a detalles de un arreglo
2. Cambiar estado entre "activo" e "inactivo"
3. Guardar cambios

**Resultado Esperado:**
- El estado se actualiza
- Los arreglos inactivos no aparecen en el catálogo público
- Se muestra mensaje de confirmación

---

#### CU-044: Eliminar Imagen de Arreglo
**Prioridad:** Baja  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a detalles de un arreglo
2. Hacer clic en "Eliminar" de una imagen
3. Confirmar eliminación
4. Verificar que la imagen se elimina

**Resultado Esperado:**
- La imagen se elimina correctamente
- Se actualiza la galería
- Se muestra mensaje de confirmación

---

### 3.6 Gestión de Catálogo

#### CU-045: Gestionar Flores
**Prioridad:** Alta  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a `/admin/catalogo`
2. Seleccionar pestaña "Flores"
3. Ver lista de flores
4. Crear nueva flor:
   - Nombre
   - Descripción
   - Color (opcional)
   - Estado
5. Editar flor existente
6. Cambiar estado de flor (activo/inactivo)

**Resultado Esperado:**
- Se pueden gestionar flores correctamente
- Las flores se asocian correctamente a arreglos

---

#### CU-046: Gestionar Accesorios
**Prioridad:** Media  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a `/admin/catalogo`
2. Seleccionar pestaña "Accesorios"
3. Ver lista de accesorios
4. Crear nuevo accesorio
5. Editar accesorio existente
6. Cambiar estado

**Resultado Esperado:**
- Se pueden gestionar accesorios correctamente

---

#### CU-047: Gestionar Formas de Arreglo
**Prioridad:** Media  
**Actor:** Vendedor / Gerente / Admin

**Pasos:**
1. Acceder a `/admin/catalogo`
2. Seleccionar pestaña "Formas de Arreglo"
3. Ver lista de formas
4. Crear nueva forma
5. Editar forma existente
6. Cambiar estado

**Resultado Esperado:**
- Se pueden gestionar formas correctamente

---

#### CU-048: Gestionar Métodos de Pago
**Prioridad:** Baja  
**Actor:** Admin (solo)

**Pasos:**
1. Acceder a `/admin/catalogo`
2. Seleccionar pestaña "Métodos de Pago"
3. Ver lista de métodos
4. Crear nuevo método:
   - Descripción
   - Tipo
   - Canales disponibles
   - Estado
5. Editar método existente
6. Cambiar estado

**Resultado Esperado:**
- Se pueden gestionar métodos de pago
- Solo administradores pueden modificar

---

### 3.7 Gestión de Rutas (Conductor)

#### CU-049: Ver Rutas Asignadas
**Prioridad:** Alta  
**Actor:** Conductor

**Pasos:**
1. Acceder a `/admin/mis-rutas`
2. Verificar que se muestran solo las rutas asignadas al conductor
3. Verificar información:
   - Fecha de ruta
   - Lista de pedidos
   - Direcciones
   - Mapa de ruta (si está implementado)

**Resultado Esperado:**
- Se muestran solo las rutas del conductor
- La información es precisa

---

#### CU-050: Marcar Pedido como Entregado
**Prioridad:** Alta  
**Actor:** Conductor

**Pasos:**
1. Acceder a `/admin/mis-rutas`
2. Seleccionar una ruta
3. Ver lista de pedidos de la ruta
4. Marcar un pedido como "Entregado"
5. Confirmar entrega
6. Opcional: Agregar foto de entrega o nota

**Resultado Esperado:**
- El pedido se marca como entregado
- El estado se actualiza en tiempo real
- Se registra la fecha y hora de entrega

---

#### CU-051: Ver Mapa de Ruta
**Prioridad:** Media  
**Actor:** Conductor

**Pasos:**
1. Acceder a `/admin/mis-rutas`
2. Seleccionar una ruta
3. Hacer clic en "Ver Mapa" o similar
4. Verificar que se muestra mapa con:
   - Punto de inicio
   - Puntos de entrega
   - Ruta optimizada

**Resultado Esperado:**
- El mapa se carga correctamente
- La ruta es visible y navegable
- Se puede obtener direcciones

---

### 3.8 Gestión de Rutas (Admin/Gerente)

#### CU-052: Crear Nueva Ruta
**Prioridad:** Media  
**Actor:** Admin / Gerente

**Pasos:**
1. Acceder a `/admin/rutas`
2. Hacer clic en "Nueva Ruta"
3. Seleccionar pedidos para incluir en la ruta
4. Asignar conductor
5. Configurar fecha de ruta
6. Ver mapa de ruta optimizada
7. Guardar ruta

**Resultado Esperado:**
- La ruta se crea exitosamente
- Los pedidos se asocian a la ruta
- El conductor recibe notificación (si está configurado)

---

#### CU-053: Editar Ruta
**Prioridad:** Media  
**Actor:** Admin / Gerente

**Pasos:**
1. Acceder a lista de rutas
2. Hacer clic en "Editar" de una ruta
3. Agregar/quitar pedidos
4. Cambiar conductor
5. Modificar fecha
6. Guardar cambios

**Resultado Esperado:**
- Los cambios se guardan
- La ruta se recalcula automáticamente

---

## 4. ADMINISTRADORES

### 4.1 Gestión de Empleados

#### CU-054: Ver Lista de Empleados
**Prioridad:** Alta  
**Actor:** Admin

**Pasos:**
1. Acceder a `/admin/empleados`
2. Verificar que se muestra tabla con empleados
3. Verificar columnas:
   - Nombre completo
   - Email
   - Teléfono
   - Roles asignados
   - Estado
4. Verificar búsqueda y filtros

**Resultado Esperado:**
- La lista se carga correctamente
- Solo administradores pueden acceder

---

#### CU-055: Crear Nuevo Empleado
**Prioridad:** Alta  
**Actor:** Admin

**Pasos:**
1. Acceder a `/admin/empleados`
2. Hacer clic en "Nuevo Empleado"
3. Completar formulario:
   - Información personal
   - Email
   - Teléfono
   - Contraseña inicial
4. Asignar roles:
   - Vendedor
   - Conductor
   - Gerente
   - Admin
5. Guardar empleado

**Resultado Esperado:**
- El empleado se crea exitosamente
- Se crea cuenta de usuario asociada
- Se envía email con credenciales (si está configurado)

**Casos de Prueba:**
- ✅ CU-055.1: Crear empleado con un rol
- ✅ CU-055.2: Crear empleado con múltiples roles
- ✅ CU-055.3: Crear empleado con email duplicado (debe mostrar error)

---

#### CU-056: Editar Empleado
**Prioridad:** Alta  
**Actor:** Admin

**Pasos:**
1. Acceder a lista de empleados
2. Hacer clic en "Editar"
3. Modificar información
4. Modificar roles asignados
5. Guardar cambios

**Resultado Esperado:**
- Los cambios se guardan
- Los roles se actualizan correctamente

---

#### CU-057: Cambiar Roles de Empleado
**Prioridad:** Alta  
**Actor:** Admin

**Pasos:**
1. Acceder a detalles de un empleado
2. Modificar roles asignados
3. Guardar cambios
4. Verificar que el empleado tiene acceso según nuevos roles

**Resultado Esperado:**
- Los roles se actualizan
- El acceso se ajusta automáticamente
- Se muestra mensaje de confirmación

---

#### CU-058: Desactivar/Activar Empleado
**Prioridad:** Media  
**Actor:** Admin

**Pasos:**
1. Acceder a detalles de un empleado
2. Cambiar estado a "inactivo"
3. Confirmar cambio
4. Verificar que el empleado no puede iniciar sesión
5. Cambiar estado a "activo"
6. Verificar que el empleado puede iniciar sesión nuevamente

**Resultado Esperado:**
- El estado se actualiza correctamente
- El acceso se controla según el estado

---

### 4.2 Dashboard y Reportes

#### CU-059: Ver Dashboard Principal
**Prioridad:** Alta  
**Actor:** Admin / Gerente

**Pasos:**
1. Acceder a `/admin` (dashboard)
2. Verificar que se muestran métricas:
   - Total de pedidos (hoy, semana, mes)
   - Total de ventas
   - Pedidos pendientes
   - Clientes nuevos
   - Arreglos más vendidos
3. Verificar gráficos (si están implementados)

**Resultado Esperado:**
- El dashboard carga correctamente
- Las métricas son precisas
- Los datos se actualizan

---

#### CU-060: Generar Reporte de Arreglos
**Prioridad:** Media  
**Actor:** Admin / Gerente

**Pasos:**
1. Acceder a `/admin/reportes`
2. Seleccionar "Reporte de Arreglos"
3. Configurar filtros:
   - Rango de fechas
   - Estado
   - Forma de arreglo
4. Generar reporte
5. Verificar que se descarga PDF

**Resultado Esperado:**
- El reporte se genera correctamente
- El PDF contiene información precisa
- Los filtros funcionan

---

#### CU-061: Generar Reporte de Pedidos
**Prioridad:** Media  
**Actor:** Admin / Gerente

**Pasos:**
1. Acceder a `/admin/reportes`
2. Seleccionar "Reporte de Pedidos"
3. Configurar filtros:
   - Rango de fechas
   - Estado
   - Cliente
4. Generar reporte
5. Verificar PDF

**Resultado Esperado:**
- El reporte se genera correctamente
- La información es precisa

---

#### CU-062: Generar Reporte de Facturas
**Prioridad:** Media  
**Actor:** Admin / Gerente

**Pasos:**
1. Acceder a `/admin/reportes`
2. Seleccionar "Reporte de Facturas"
3. Configurar filtros:
   - Rango de fechas
   - Estado
   - Cliente
4. Generar reporte
5. Verificar PDF

**Resultado Esperado:**
- El reporte se genera correctamente
- Los totales son precisos

---

## 5. CASOS DE USO TRANSVERSALES

### 5.1 Búsqueda y Filtrado

#### CU-063: Búsqueda en Cualquier Módulo
**Prioridad:** Alta  
**Actor:** Todos los usuarios autenticados

**Pasos:**
1. Acceder a cualquier módulo con búsqueda (pedidos, clientes, arreglos, etc.)
2. Ingresar texto en campo de búsqueda
3. Verificar que los resultados se filtran en tiempo real
4. Verificar que la búsqueda es case-insensitive
5. Verificar que se puede buscar por múltiples campos

**Resultado Esperado:**
- La búsqueda funciona correctamente
- Los resultados son relevantes
- El rendimiento es aceptable

---

#### CU-064: Paginación
**Prioridad:** Alta  
**Actor:** Todos los usuarios

**Pasos:**
1. Acceder a cualquier lista con paginación
2. Navegar entre páginas
3. Cambiar cantidad de items por página
4. Verificar que la paginación se mantiene al aplicar filtros

**Resultado Esperado:**
- La paginación funciona correctamente
- Los datos se cargan correctamente en cada página

---

### 5.2 Validaciones y Errores

#### CU-065: Validación de Formularios
**Prioridad:** Alta  
**Actor:** Todos los usuarios

**Pasos:**
1. Acceder a cualquier formulario
2. Intentar enviar sin completar campos obligatorios
3. Verificar que se muestran mensajes de error
4. Completar campos con datos inválidos:
   - Email inválido
   - Teléfono inválido
   - Fechas inválidas
   - Números negativos donde no aplica
5. Verificar mensajes de error apropiados

**Resultado Esperado:**
- Las validaciones funcionan correctamente
- Los mensajes de error son claros
- Los campos se marcan visualmente como erróneos

---

#### CU-066: Manejo de Errores del Servidor
**Prioridad:** Alta  
**Actor:** Todos los usuarios

**Pasos:**
1. Simular error del servidor (desconectar backend o forzar error)
2. Intentar realizar cualquier acción
3. Verificar que se muestra mensaje de error apropiado
4. Verificar que la aplicación no se rompe

**Resultado Esperado:**
- Se muestran mensajes de error claros
- La aplicación mantiene estabilidad
- Se puede recuperar del error

---

### 5.3 Responsive Design

#### CU-067: Verificar Responsive en Móvil
**Prioridad:** Alta  
**Actor:** Todos los usuarios

**Pasos:**
1. Abrir la aplicación en dispositivo móvil o emulador (375x667)
2. Navegar por todas las secciones principales
3. Verificar que:
   - Los elementos son visibles
   - Los botones son accesibles
   - Los formularios son usables
   - Las tablas se adaptan o tienen scroll horizontal

**Resultado Esperado:**
- La aplicación es completamente funcional en móvil
- No hay elementos cortados
- La navegación es intuitiva

---

#### CU-068: Verificar Responsive en Tablet
**Prioridad:** Media  
**Actor:** Todos los usuarios

**Pasos:**
1. Abrir en tablet o emulador (768x1024)
2. Verificar que el diseño se adapta correctamente
3. Verificar que se aprovecha el espacio disponible

**Resultado Esperado:**
- El diseño es óptimo para tablet
- Se aprovecha el espacio disponible

---

### 5.4 Performance

#### CU-069: Tiempo de Carga de Páginas
**Prioridad:** Media  
**Actor:** Todos los usuarios

**Pasos:**
1. Medir tiempo de carga de páginas principales:
   - Landing page
   - Catálogo
   - Panel administrativo
   - Lista de pedidos
2. Verificar que los tiempos son aceptables (< 3 segundos)

**Resultado Esperado:**
- Las páginas cargan en tiempo razonable
- No hay bloqueos visibles

---

#### CU-070: Optimización de Imágenes
**Prioridad:** Baja  
**Actor:** Todos los usuarios

**Pasos:**
1. Verificar que las imágenes se cargan de forma lazy
2. Verificar que las imágenes están optimizadas
3. Verificar que hay placeholders mientras cargan

**Resultado Esperado:**
- Las imágenes no bloquean la carga inicial
- El rendimiento es óptimo

---

### 5.5 Seguridad

#### CU-071: Control de Acceso por Roles
**Prioridad:** Alta  
**Actor:** Todos los usuarios

**Pasos:**
1. Iniciar sesión con diferentes roles
2. Intentar acceder a rutas no permitidas:
   - Cliente intentando acceder a `/admin`
   - Vendedor intentando acceder a `/admin/empleados`
   - Conductor intentando acceder a gestión de empleados
3. Verificar que se muestra error o se redirige

**Resultado Esperado:**
- El control de acceso funciona correctamente
- Los usuarios solo ven lo que tienen permiso

---

#### CU-072: Protección de Rutas
**Prioridad:** Alta  
**Actor:** Todos los usuarios

**Pasos:**
1. Cerrar sesión
2. Intentar acceder directamente a rutas protegidas:
   - `/admin`
   - `/admin/pedidos`
   - `/carrito`
3. Verificar que se redirige a login

**Resultado Esperado:**
- Las rutas protegidas están protegidas
- Se redirige correctamente a login

---

#### CU-073: Expiración de Sesión
**Prioridad:** Media  
**Actor:** Todos los usuarios autenticados

**Pasos:**
1. Iniciar sesión
2. Esperar a que expire el token (o simular expiración)
3. Intentar realizar una acción
4. Verificar que se redirige a login

**Resultado Esperado:**
- La sesión expira correctamente
- Se maneja la expiración de forma elegante

---

### 5.6 Accesibilidad

#### CU-074: Navegación por Teclado
**Prioridad:** Media  
**Actor:** Todos los usuarios

**Pasos:**
1. Navegar por la aplicación usando solo el teclado
2. Verificar que todos los elementos interactivos son accesibles
3. Verificar que hay indicadores de foco visibles
4. Verificar que se puede completar flujos completos con teclado

**Resultado Esperado:**
- La navegación por teclado funciona
- Los elementos tienen foco visible

---

#### CU-075: Lectores de Pantalla
**Prioridad:** Baja  
**Actor:** Usuarios con discapacidad visual

**Pasos:**
1. Activar lector de pantalla (NVDA, JAWS, VoiceOver)
2. Navegar por la aplicación
3. Verificar que los elementos tienen labels apropiados
4. Verificar que se anuncian cambios de estado

**Resultado Esperado:**
- La aplicación es accesible para lectores de pantalla
- Los elementos tienen aria-labels apropiados

---

## 📊 MATRIZ DE COBERTURA

| Módulo | Casos de Uso | Prioridad Alta | Prioridad Media | Prioridad Baja |
|--------|--------------|----------------|-----------------|----------------|
| Landing Page | 5 | 3 | 2 | 0 |
| Autenticación | 3 | 2 | 0 | 1 |
| Carrito | 4 | 4 | 0 | 0 |
| Checkout/Pago | 4 | 4 | 0 | 0 |
| Pedidos | 6 | 5 | 1 | 0 |
| Facturas | 6 | 3 | 3 | 0 |
| Clientes | 5 | 4 | 1 | 0 |
| Arreglos | 6 | 4 | 2 | 0 |
| Catálogo | 4 | 2 | 2 | 0 |
| Rutas | 5 | 3 | 2 | 0 |
| Empleados | 5 | 4 | 1 | 0 |
| Reportes | 4 | 1 | 3 | 0 |
| Transversales | 13 | 7 | 4 | 2 |
| **TOTAL** | **70** | **46** | **20** | **4** |

---

## 📝 NOTAS PARA TESTERS

### Prioridades
- **Alta**: Funcionalidades críticas que deben funcionar siempre
- **Media**: Funcionalidades importantes pero no críticas
- **Baja**: Mejoras o funcionalidades opcionales

### Entorno de Prueba
- **URL Base**: [Configurar según entorno]
- **Usuarios de Prueba**: [Proporcionar credenciales de prueba]
- **Datos de Prueba**: [Proporcionar datos de prueba]

### Herramientas Recomendadas
- Navegadores: Chrome, Firefox, Safari, Edge
- Dispositivos: Desktop, Tablet, Móvil
- Herramientas: DevTools, Lighthouse, WAVE (accesibilidad)

### Reporte de Bugs
Al reportar bugs, incluir:
1. Número de caso de uso
2. Pasos para reproducir
3. Resultado esperado vs. resultado actual
4. Screenshots o videos
5. Navegador y versión
6. Dispositivo (si aplica)

---

**Documento generado para:** Floristería Sacuanjoche  
**Versión del Sistema:** 1.0  
**Última actualización:** 2024

