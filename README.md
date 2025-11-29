# 🌸 Floristería Sacuanjoche - Sistema de Gestión

<div align="center">

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.17-38B2AC?logo=tailwind-css&logoColor=white)

**Sistema completo de gestión para Floristería Sacuanjoche**

_Creando los ramos florales más bellos, delicados y de calidad del mercado desde 1983_

[Características](#-características) • [Tecnologías](#-tecnologías) • [Instalación](#-instalación) • [Uso](#-uso)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Características Principales](#-características-principales)
- [Arquitectura](#-arquitectura)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## 🌟 Descripción

Sistema de gestión integral desarrollado para **Floristería Sacuanjoche**, una floristería familiar fundada en 1983 en Managua, Nicaragua. La aplicación incluye:

- **Landing Page Pública**: Catálogo de arreglos florales con filtros avanzados y paginación
- **Panel Administrativo**: Sistema completo de gestión de inventario, pedidos, facturas, clientes y reportes

El proyecto está construido con las mejores prácticas de desarrollo moderno, utilizando React 19, TypeScript, y un stack tecnológico robusto para garantizar escalabilidad y mantenibilidad.

---

## ✨ Características

### 🌐 Landing Page Pública

- ✅ Catálogo interactivo de arreglos florales
- ✅ Filtros avanzados (precio, flores, forma de arreglo)
- ✅ Búsqueda y paginación optimizada
- ✅ Diseño responsive y moderno
- ✅ Animaciones suaves con Framer Motion
- ✅ Secciones: Inicio, Servicios, Galería, Historia, Contacto

### 🛠️ Panel Administrativo

- ✅ **Gestión de Arreglos**: CRUD completo con gestión de imágenes y asociaciones
- ✅ **Gestión de Catálogo**: Flores, Accesorios, Formas de Arreglo, Métodos de Pago
- ✅ **Gestión de Clientes**: Registro completo con direcciones múltiples
- ✅ **Gestión de Pedidos**: Creación, edición, seguimiento y generación de facturas
- ✅ **Gestión de Facturas**: Emisión, edición, anulación y generación de PDFs
- ✅ **Reportes**: Generación de reportes en PDF para arreglos, pedidos y facturas
- ✅ **Rutas & Envíos**: Módulo en desarrollo para gestión de entregas
- ✅ **Dashboard**: Vista general con estadísticas y métricas

### 🎨 Características Técnicas

- ✅ **Paginación Inteligente**: Hook reutilizable con soporte para búsqueda y filtros
- ✅ **Validación de Formularios**: React Hook Form con validación en tiempo real
- ✅ **Gestión de Estado**: TanStack Query para caché y sincronización de datos
- ✅ **UI Components**: Componentes reutilizables basados en Radix UI
- ✅ **Responsive Design**: Diseño adaptativo para móviles, tablets y desktop
- ✅ **Type Safety**: TypeScript en todo el proyecto
- ✅ **Code Splitting**: Lazy loading para optimización de rendimiento

---

## 🛠️ Tecnologías

### Core

- **[React](https://react.dev/)** 19.2.0 - Biblioteca de UI
- **[TypeScript](https://www.typescriptlang.org/)** 5.9.3 - Tipado estático
- **[Vite](https://vitejs.dev/)** 7.2.2 - Build tool y dev server

### Routing & State Management

- **[React Router](https://reactrouter.com/)** 7.9.5 - Enrutamiento
- **[TanStack Query](https://tanstack.com/query)** 5.90.9 - Gestión de estado del servidor

### UI & Styling

- **[Tailwind CSS](https://tailwindcss.com/)** 4.1.17 - Framework CSS utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI accesibles y personalizables
- **[Framer Motion](https://www.framer.com/motion/)** 12.23.24 - Animaciones
- **[React Icons](https://react-icons.github.io/react-icons/)** 5.5.0 - Biblioteca principal de iconos (Material Design, Heroicons, Game Icons, Tabler)
- **[Lucide React](https://lucide.dev/)** 0.553.0 - Iconos para componentes shadcn/ui

### Forms & Validation

- **[React Hook Form](https://react-hook-form.com/)** 7.66.1 - Gestión de formularios
- **[Zod](https://zod.dev/)** (implícito) - Validación de esquemas

### HTTP & Storage

- **[Axios](https://axios-http.com/)** 1.13.2 - Cliente HTTP
- **[Supabase](https://supabase.com/)** 2.83.0 - Almacenamiento de imágenes

### Maps & Location

- **[Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/)** 3.16.0 - Mapas interactivos
- **[React Map GL](https://visgl.github.io/react-map-gl/)** 7.1.7 - React wrapper para Mapbox

### Utilities

- **[Sonner](https://sonner.emilkowal.ski/)** 2.0.7 - Notificaciones toast
- **[clsx](https://github.com/lukeed/clsx)** & **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Utilidades CSS
- **[class-variance-authority](https://cva.style/)** - Variantes de componentes

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (o **yarn** / **pnpm**)

---

## 🚀 Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/tu-usuario/sacuanjoche-fronted.git
   cd sacuanjoche-fronted
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto:

   ```env
   VITE_API_URL=http://localhost:3000
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

4. **Iniciar el servidor de desarrollo**

   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

---

## ⚙️ Configuración

### Variables de Entorno

| Variable                 | Descripción                 | Requerido |
| ------------------------ | --------------------------- | --------- |
| `VITE_API_URL`           | URL base del backend API    | ✅ Sí     |
| `VITE_SUPABASE_URL`      | URL de tu proyecto Supabase | ✅ Sí     |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase   | ✅ Sí     |

### Configuración de Paths

El proyecto utiliza path aliases configurados en `tsconfig.json`:

```typescript
import { Component } from '@/shared/components/...';
```

El alias `@` apunta a `./src`

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo con HMR

# Producción
npm run build        # Compila el proyecto para producción
npm run preview      # Previsualiza el build de producción

# Calidad de Código
npm run lint         # Ejecuta ESLint para verificar el código
```

---

## 📁 Estructura del Proyecto

```
sacuanjoche-fronted/
├── public/                 # Archivos estáticos
│   └── Flor_de_sacuanjoche-.png
├── src/
│   ├── admin/              # Páginas del panel administrativo
│   │   └── pages/
│   │       └── DashboardPage.tsx
│   ├── arreglo/            # Módulo de arreglos florales
│   │   ├── actions/        # Acciones API
│   │   ├── api/            # Configuración de API
│   │   ├── components/     # Componentes específicos
│   │   ├── hook/           # Custom hooks
│   │   ├── pages/          # Páginas
│   │   └── types/          # Tipos TypeScript
│   ├── auth/               # Autenticación
│   ├── catalogo/            # Módulo de catálogo
│   │   ├── actions/        # Flores, Accesorios, Formas, Métodos de Pago
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   ├── cliente/            # Módulo de clientes
│   ├── facturas/           # Módulo de facturas
│   ├── landing/            # Landing page pública
│   │   ├── components/     # Componentes de la landing
│   │   ├── hooks/          # Hooks específicos
│   │   └── pages/          # Páginas públicas
│   ├── pedido/             # Módulo de pedidos
│   ├── reports/            # Módulo de reportes
│   ├── rutas/              # Módulo de rutas y envíos
│   ├── shared/             # Código compartido
│   │   ├── api/            # Configuración de API base
│   │   ├── components/     # Componentes reutilizables
│   │   ├── hooks/          # Hooks compartidos
│   │   ├── lib/            # Utilidades
│   │   ├── types/          # Tipos compartidos
│   │   └── utils/          # Funciones utilitarias
│   ├── FloriApp.tsx        # Componente raíz
│   ├── main.tsx            # Punto de entrada
│   └── router/             # Configuración de rutas
│       └── app.router.tsx
├── .env                    # Variables de entorno (no commitear)
├── package.json
├── tsconfig.json           # Configuración TypeScript
├── vite.config.ts          # Configuración Vite
└── README.md
```

---

## 🎯 Características Principales

### 🔄 Paginación Inteligente

Sistema de paginación reutilizable con soporte para:

- Búsqueda en tiempo real
- Filtros dinámicos
- Cambio de límite de items por página
- Cálculo automático de totales

```typescript
import { useTablePagination } from '@/shared/hooks/useTablePagination';

const pagination = useTablePagination(totalItems);
```

### 📝 Gestión de Formularios

Formularios robustos con validación en tiempo real usando React Hook Form:

```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm();
```

### 🎨 Componentes UI Reutilizables

Biblioteca de componentes basada en **shadcn/ui**:

- `Button`, `Input`, `Select`, `Dialog`
- `Card`, `Table`, `Badge`, `Avatar`
- Componentes personalizados para el dominio
- Construidos sobre Radix UI primitives para máxima accesibilidad

### 📊 Gestión de Estado con React Query

Caché inteligente y sincronización automática:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['arreglos', { page, limit }],
  queryFn: () => getArreglos({ page, limit }),
});
```

### 🖼️ Gestión de Imágenes

Integración con Supabase Storage para:

- Subida de imágenes de arreglos
- Múltiples imágenes por arreglo
- Optimización y compresión

### 📄 Generación de PDFs

Sistema de generación de PDFs para:

- Facturas
- Reportes de arreglos
- Reportes de pedidos
- Órdenes de trabajo

---

## 🏗️ Arquitectura

### Patrón de Organización

El proyecto sigue una arquitectura modular por dominio:

```
módulo/
├── actions/      # Llamadas a API (capa de servicio)
├── api/          # Configuración de cliente HTTP
├── components/    # Componentes específicos del módulo
├── hook/         # Custom hooks para lógica de negocio
├── pages/        # Páginas/views
└── types/        # Interfaces y tipos TypeScript
```

### Flujo de Datos

```
Component → Hook → Action → API → Backend
                ↓
         React Query Cache
```

### Principios de Diseño

- **Separación de Responsabilidades**: Cada módulo es independiente
- **Reutilización**: Componentes y hooks compartidos en `shared/`
- **Type Safety**: TypeScript en todo el proyecto
- **Performance**: Lazy loading, code splitting, optimización de bundles

---

## 🧪 Desarrollo

### Estructura de un Módulo Típico

```typescript
// 1. Types
export interface Arreglo {
  idArreglo: number;
  nombre: string;
  // ...
}

// 2. API
export const arregloApi = axios.create({
  baseURL: `${API_BASE_URL}/arreglos`,
});

// 3. Actions
export const getArreglos = async (params) => {
  const response = await arregloApi.get('/', { params });
  return response.data;
};

// 4. Hook
export const useArreglo = (options) => {
  return useQuery({
    queryKey: ['arreglos', options],
    queryFn: () => getArreglos(options),
  });
};

// 5. Component
export const ArreglosPage = () => {
  const { data, isLoading } = useArreglo();
  // ...
};
```

---

## 🚧 Estado del Proyecto

### ✅ Completado

- Landing page pública
- Gestión de arreglos
- Gestión de catálogo
- Gestión de clientes
- Gestión de pedidos
- Gestión de facturas
- Sistema de reportes
- Paginación y búsqueda
- Responsive design

### 🚧 En Desarrollo

- Rutas & Envíos (módulo en construcción)

### 📋 Pendiente

- Sistema de autenticación completo
- Dashboard con métricas avanzadas
- Notificaciones en tiempo real
- Exportación de datos a Excel

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Sigue las convenciones de código existentes
- Añade tests para nuevas funcionalidades
- Actualiza la documentación según sea necesario
- Asegúrate de que el código pase el linter (`npm run lint`)

---

## 📝 Convenciones de Código

### Nomenclatura

- **Componentes**: PascalCase (`ArregloCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useArreglo.tsx`)
- **Utilidades**: camelCase (`formatPrice.ts`)
- **Tipos/Interfaces**: PascalCase (`Arreglo.interface.ts`)

### Estructura de Archivos

- Un componente por archivo
- Types en archivos separados cuando son complejos
- Hooks personalizados en carpetas `hook/` o `hooks/`

---

## 🐛 Troubleshooting

### Problemas Comunes

**Error: Cannot find module '@/shared/...'**

- Verifica que `tsconfig.json` tenga configurado el path alias `@`

**Error: VITE_API_URL is not defined**

- Asegúrate de tener un archivo `.env` con las variables necesarias

**Error: Supabase client not initialized**

- Verifica `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env`

---

## 📄 Licencia

Este proyecto es privado y pertenece a Floristería Sacuanjoche.

---

## 👥 Equipo

Desarrollado con ❤️ para **Floristería Sacuanjoche**

_Fundada en 1983 - Managua, Nicaragua_

---

## 📞 Contacto

**Floristería Sacuanjoche**

- 📍 Montoya, 2 Cuadras al Norte, Managua, Nicaragua
- 📞 +505 2266-0187
- 📧 ventas@floreriasacuanjoche.com

---

<div align="center">

**Hecho con ❤️ usando React, TypeScript y Vite**

⭐ Si este proyecto te resulta útil, considera darle una estrella

</div>
