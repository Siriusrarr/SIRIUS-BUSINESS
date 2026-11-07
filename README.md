<<<<<<< HEAD
# Sirius Business - Dashboard Orbital

Esta entrega completa parte del ZIP Fase 2 e incorpora el nuevo dashboard espacial. No es necesario combinarla con ZIP anteriores.

## Novedades de esta entrega

- Tema azul profundo y violeta, planeta CSS animado, iconos SVG y tarjetas renovadas.
- Gráfica de ventas de siete días con área degradada, puntos consultables y tabla accesible.
- Anillo de inventario con leyenda y estado neutro cuando no hay productos.
- Inicio sin datos operativos de demostración; los datos existentes se conservan entre sesiones.
- Accesos rápidos para añadir productos, registrar clientes y consultar finanzas.
- Tutorial voluntario desde el dashboard y el menú. Ya no se abre automáticamente.
- Diseño responsive, foco visible y respeto por prefers-reduced-motion.
- Campos de stock y stock mínimo con paso entero.
- Mensaje con reintento si falla la carga inicial, sin presentar el error como un negocio vacío.

## Verificación de esta entrega

Frontend instalado y compilado con Vite correctamente (57 módulos). Comprobaciones React: gráfica vacía, gráfica con valores, coordenadas finitas y acción inicial de inventario. El navegador de revisión no estuvo disponible: falta la revisión visual e interactiva en escritorio y móvil. PostgreSQL, SMTP, concurrencia y despliegue no se probaron.

Los datos simulados de verificación y el servidor de pruebas no forman parte del ZIP. La aplicación usa las API originales y necesita configurar el backend. No se publica ni se conecta a una base de datos de producción durante esta entrega. No se cambió el esquema Prisma.

## Puesta en marcha

1. Instala Node.js compatible con los package.json.
2. Desde esta carpeta: `npm install` y `npm run install:all`.
3. Crea `backend/.env` a partir de `.env.example`, con PostgreSQL y SMTP propios.
4. Sigue las instrucciones de migración de fase 2 de abajo según tu base de datos.
5. Ejecuta `npm run dev`.

El informe PDF adjunto explica las novedades y las limitaciones de validación. Las notas históricas de abajo describen las entregas anteriores; para el aspecto visual, el inicio del tutorial y el estado de compilación prevalece esta sección.

---

# SIRIUS BUSINESS · Módulo de acceso

Primera pieza funcional de Sirius Business. Incluye registro, inicio y cierre de sesión, verificación de correo y recuperación de contraseña. Está preparado para PostgreSQL y para desplegar frontend y backend juntos en un único servicio de Render.

## Qué incluye

- Registro con nombre, correo y contraseña.
- Verificación real de la dirección de correo mediante enlace de un solo uso (caduca en 24 horas).
- Inicio de sesión únicamente después de verificar el correo.
- Sesiones guardadas en PostgreSQL y cookie `HttpOnly`.
- Cierre de sesión que revoca la sesión en la base de datos.
- Recuperación mediante enlace enviado por correo (caduca en una hora).
- Al cambiar la contraseña se revocan todas las sesiones anteriores.
- Contraseñas protegidas con bcrypt, validación de datos, Helmet y limitación de intentos en rutas de autenticación.
- Vista privada inicial para comprobar que el acceso real funciona. Todavía no es el dashboard definitivo.

No hay cuentas de demostración ni usuarios predefinidos.

## Requisitos

- Node.js 20.19 o superior (recomendado Node 22 LTS).
- npm.
- Una base de datos PostgreSQL accesible por URL.
- Una cuenta o proveedor SMTP para enviar correos (por ejemplo, Brevo, Resend SMTP o el SMTP de tu dominio).

No necesitas instalar MySQL. Puedes usar PostgreSQL administrado en Render y conectarte a esa base de datos desde tu ordenador durante el desarrollo.

## 1. Instalar dependencias

Desde la carpeta raíz `SIRIUS-BUSINESS-AUTH`:

```bash
npm install
npm run install:all
```

## 2. Configurar el backend

Copia `backend/.env.example` y crea un archivo llamado `backend/.env`. Rellena como mínimo:

```env
DATABASE_URL="postgresql://USUARIO:CONTRASENA@HOST:5432/BASE_DATOS?schema=public"
NODE_ENV=development
PORT=4000
APP_URL=http://localhost:5173
SESSION_COOKIE_NAME=sirius_session
SESSION_DURATION_DAYS=7
COOKIE_SAME_SITE=lax

SMTP_HOST=servidor-smtp
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=usuario-smtp
SMTP_PASS=contrasena-smtp
SMTP_FROM="Sirius Business <no-reply@tudominio.com>"
```

`APP_URL` debe ser la dirección desde la que se abre el frontend. En local es `http://localhost:5173`. En producción será la URL pública de tu aplicación.

El proveedor SMTP debe autorizar el remitente usado en `SMTP_FROM`. En el puerto 587 normalmente `SMTP_SECURE=false`; en el puerto 465 normalmente `SMTP_SECURE=true`. No publiques las credenciales SMTP ni el archivo `.env` en GitHub.

## 3. Crear las tablas de PostgreSQL

Asegúrate de que la base de datos existe y que `DATABASE_URL` funciona. Después ejecuta:

```bash
npm run db:migrate --prefix backend -- --name init
```

Este comando crea la migración inicial y las tablas `User`, `Session`, `EmailVerificationToken` y `PasswordResetToken`. Guarda la carpeta `backend/prisma/migrations` en Git: es necesaria para aplicar cambios posteriores y desplegar.

## 4. Ejecutar en local

Desde la raíz:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000/api`
- Comprobación: `http://localhost:4000/api/health`

El frontend usa un proxy de Vite para comunicarse con el backend. No abras el HTML directamente desde el explorador de archivos.

## 5. Probar el flujo real

1. Abre `http://localhost:5173/register`.
2. Crea una cuenta con tu correo.
3. Abre el mensaje que envíe el proveedor SMTP y pulsa «Verificar correo».
4. Inicia sesión en `/login`.
5. Cierra sesión y prueba «¿Has olvidado tu contraseña?».
6. Abre el enlace de recuperación recibido y establece una contraseña nueva.

Si no recibes correos, revisa la configuración SMTP, la bandeja de spam y los registros de la terminal del backend. No se activa una cuenta sin verificar su correo.

## 6. Despliegue en Render

La aplicación está preparada para que Express sirva la versión compilada de React y la API desde el mismo dominio. Así la cookie de sesión no necesita viajar entre dominios distintos.

1. Sube el proyecto a un repositorio privado de GitHub.
2. Crea una base de datos PostgreSQL en Render y copia su URL de conexión.
3. Crea un Web Service conectado al repositorio.
4. Configura el directorio raíz como la raíz del proyecto.
5. Build command:

```bash
npm install && npm run install:all && npm run db:generate && npm run build
```

6. Start command:

```bash
npm run db:deploy --prefix backend && npm start
```

7. En las variables de entorno del Web Service configura `DATABASE_URL`, `NODE_ENV=production`, `APP_URL` con la URL HTTPS pública de Render y todas las variables SMTP. Mantén `COOKIE_SAME_SITE=lax` cuando frontend y API se sirvan desde el mismo dominio.
8. Antes del primer despliegue, crea y sube la migración inicial desde el entorno de desarrollo siguiendo el paso 3.

No uses la URL pública de PostgreSQL desde el backend alojado en Render si tienes disponible la URL interna de la base de datos dentro de la misma región.

## Estructura

```text
SIRIUS-BUSINESS-AUTH/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── vite.config.js
├── .gitignore
└── package.json
```

## Endpoints del acceso

| Método | Ruta | Función |
|---|---|---|
| POST | `/api/auth/register` | Crear cuenta y enviar verificación |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/logout` | Revocar sesión y cerrar sesión |
| GET | `/api/auth/me` | Obtener usuario de la sesión actual |
| POST | `/api/auth/verify-email` | Verificar correo |
| POST | `/api/auth/resend-verification` | Reenviar verificación |
| POST | `/api/auth/forgot-password` | Solicitar recuperación |
| POST | `/api/auth/reset-password` | Cambiar contraseña con token |

## Nota de alcance y seguridad

Este módulo proporciona una base de autenticación real, pero no significa que el producto completo esté listo para producción. Antes de abrir el registro al público habrá que añadir pruebas automatizadas, monitorización, copias de seguridad, política de privacidad, términos de servicio, recuperación operativa del correo y revisión de seguridad. El limitador de intentos incluido usa memoria del proceso; en un despliegue con varias instancias conviene cambiarlo por un almacén compartido como Redis.

## Selección de planes (modo académico)

Después de iniciar sesión, las cuentas que todavía no tienen un plan seleccionado son enviadas a `/plans`. La selección se guarda en el campo `User.selectedPlan` de PostgreSQL y queda asociada a la cuenta. Los identificadores son `free`, `entrepreneur` y `business_pro`.

Esta pantalla es únicamente una simulación académica: no crea una suscripción, no cobra, no solicita tarjeta ni se conecta a una pasarela. Los importes mostrados son valores propuestos para la presentación y pueden modificarse en `frontend/src/pages/PlansPage.jsx`.

Si ya habías creado las tablas con una migración inicial, genera una nueva migración después de actualizar el esquema:

```bash
npm run db:migrate --prefix backend -- --name add_plan_selection
```

Si todavía no has creado la base de datos/migración inicial, sigue el paso 3 de esta guía para crear la migración inicial con el esquema actualizado.


---

## Fase 2: módulos empresariales y tutorial

Este ZIP amplía el proyecto de acceso y selección de planes. Incluye el proyecto completo, con autenticación, selección de plan, configuración del negocio, módulos operativos y tutorial. No mezcles archivos con ZIP anteriores.

### Funciones incluidas

- Configuración inicial de un negocio por cuenta propietaria.
- Dashboard con ventas del día, ganancia estimada, unidades vendidas, alertas de stock, ventas semanales y últimas operaciones.
- Inventario de productos: SKU, código de barras, coste, precio, existencias y stock mínimo.
- Ventas: productos, cantidades, cliente opcional y método de pago. El backend valida existencias y descuenta stock en una transacción PostgreSQL.
- Finanzas: ingresos, coste de mercancía, gastos y beneficio estimado.
- CRUD de clientes, proveedores, gastos y promociones.
- Configuración inicial de tienda virtual.
- Registro de integraciones pendientes, sin simular conexiones reales.
- Gestión básica de miembros existentes, con límites de equipo según plan.
- Tutorial guiado por módulos con progreso persistido.

Sirius Business Assistance AI no está incluido. Tampoco están incluidos en esta fase la tienda pública con checkout, los pagos online, la facturación electrónica, OAuth/API real de proveedores, invitaciones por correo ni permisos granulares.

### Migración de base de datos

Si todavía no has aplicado ninguna migración, configura `backend/.env` y ejecuta desde la raíz:

```bash
npm install
npm run install:all
npm run db:generate
npm run db:migrate --prefix backend -- --name initial_business_platform
```

Si ya tenías aplicada la migración inicial de autenticación y planes, no crees otra migración inicial. Ejecuta:

```bash
npm run db:migrate --prefix backend -- --name business_modules
```

Después inicia:

```bash
npm run dev
```

El comando de migración necesita PostgreSQL accesible mediante `DATABASE_URL`. En Render, genera Prisma durante el build y ejecuta `npm run db:deploy --prefix backend` en el comando de inicio.

### Flujo de uso

1. Crear cuenta y verificar correo.
2. Iniciar sesión.
3. Seleccionar un plan de demostración.
4. Configurar el negocio en `/setup`.
5. Recorrer el tutorial o saltarlo.
6. Trabajar desde los módulos del menú lateral.

### Endpoints principales añadidos

Todos requieren sesión autenticada. Excepto `GET /api/business` y `POST /api/business`, requieren pertenencia a un negocio.

| Método | Ruta | Uso |
|---|---|---|
| GET / POST | `/api/business` | Consultar o crear negocio |
| PATCH | `/api/business` | Actualizar negocio |
| GET | `/api/dashboard` | Indicadores y actividad |
| GET / POST / PATCH / DELETE | `/api/products` | Inventario |
| GET / POST / PATCH / DELETE | `/api/customers` | Clientes |
| GET / POST / PATCH / DELETE | `/api/suppliers` | Proveedores |
| GET / POST / PATCH / DELETE | `/api/expenses` | Gastos |
| GET / POST / PATCH / DELETE | `/api/promotions` | Promociones |
| GET / POST | `/api/sales` | Consultar y registrar ventas |
| GET | `/api/finance` | Resumen financiero |
| GET / PUT | `/api/tutorial` | Progreso del tutorial |
| GET / PATCH | `/api/store` | Escaparate |
| GET / POST | `/api/integrations` | Preparar integraciones |
| GET / POST / DELETE | `/api/members` | Equipo del negocio |

### Aislamiento de información

Los registros operativos incluyen `businessId`. El backend filtra las consultas y modificaciones por el negocio al que pertenece el usuario autenticado; no confía en un `businessId` enviado por el navegador. La creación de ventas se realiza en una transacción: si falla la validación del producto, del cliente o del stock, no se confirma parcialmente la operación.

`BusinessMember` prepara el acceso multiusuario. En esta fase se pueden añadir cuentas ya registradas y verificadas. La invitación por correo y los permisos avanzados quedan para otra fase.

### Alcance y validación

Los planes son demostrativos y no hay cobros. Las integraciones quedan en estado pendiente hasta configurar credenciales y autorización del proveedor. La opción de publicar la tienda solo guarda un estado interno, no publica una tienda real. El beneficio es una estimación operativa, no un informe contable o fiscal.

Antes de usar datos reales, hay que ejecutar y probar las migraciones, las rutas con PostgreSQL, el stock con ventas concurrentes, los permisos multiusuario, las copias de seguridad y el despliegue. La instalación de dependencias y la compilación completa no han podido verificarse en este entorno.
=======
# SIRIUS-BUSINESS
Plataforma de gestión empresarial SIRIUS BUSINESS. Sistema de inventario, ventas, finanzas y administración de negocios.
>>>>>>> 012bfb7a002e4bd6c0681bc1a6f63dbc6f8ae7bb
