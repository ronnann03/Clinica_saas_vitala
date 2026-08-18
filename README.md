# Vitala

Plataforma de gestión clínica multi-especialidad — pacientes, médicos, citas,
consultas, pagos, farmacia, laboratorio, inventario, personal y portal del
paciente, todo organizado por clínica (multi-tenant).

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://www.prisma.io) + PostgreSQL (probado con [Neon](https://neon.tech), compatible con [Supabase](https://supabase.com) o cualquier Postgres)
- Autenticación propia: email/contraseña con `bcryptjs` y sesiones en base de datos (cookie httpOnly), sin proveedores externos
- Desplegado en [Vercel](https://vercel.com)

## Requisitos

- Node.js 20 o superior
- Una base de datos PostgreSQL (Neon, Supabase, o local)

## Instalación

1. Clonar el repositorio e instalar dependencias:

   ```bash
   git clone https://github.com/ronnann03/Clinica_saas_vitala.git
   cd Clinica_saas_vitala
   npm install
   ```

2. Configurar las variables de entorno. Copia `.env.example` a `.env.local`
   y completa `DATABASE_URL` con la connection string de tu base de datos
   (en Supabase: *Project Settings → Database → Connection string → URI,
   modo pooled*):

   ```bash
   cp .env.example .env.local
   ```

3. Aplicar el esquema de la base de datos:

   ```bash
   npm run db:push
   ```

4. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Abrir [http://localhost:3000](http://localhost:3000). Crea tu clínica
   desde `/register` (esa cuenta queda como administradora) o inicia sesión
   en `/login` si ya tienes una cuenta.

## Scripts

| Comando              | Descripción                                              |
| --------------------- | --------------------------------------------------------- |
| `npm run dev`         | Servidor de desarrollo (Turbopack)                        |
| `npm run build`       | Build de producción                                        |
| `npm run start`       | Sirve el build de producción                                |
| `npm run lint`        | ESLint                                                      |
| `npm run db:push`     | Sincroniza `prisma/schema.prisma` con la base de datos      |
| `npm run db:migrate`  | Crea una migración con historial (`prisma migrate dev`)     |
| `npm run db:studio`   | Abre Prisma Studio para explorar los datos                  |

## Estructura del proyecto

```
prisma/schema.prisma      Modelo de datos (multi-tenant, todos los módulos)
src/app/
  (público)                Landing, /login, /register
  dashboard/                Panel de personal — un módulo por carpeta
    pacientes/ medicos/ citas/ consultas/ pagos/ farmacia/
    laboratorio/ inventario/ personal/ notificaciones/ reportes/ perfil/
  portal/                   Portal del paciente (citas, pagos, recetas,
                             resultados, perfil)
src/lib/                    Auth, sesión de tenant, roles, notificaciones
src/components/             Componentes de UI por módulo
```

## Modelo multi-tenant

Cada clínica (`Clinic`) es un tenant independiente. Todo usuario (`User`)
pertenece a una sola clínica y tiene un rol (`admin`, `medico`, `enfermero`,
`recepcionista`, `laboratorio`, `farmacia`, `paciente`). El registro en
`/register` crea la clínica y su usuario administrador; el resto del
personal se agrega desde **Médicos** o **Personal** dentro del dashboard,
y los pacientes obtienen acceso al portal desde su ficha.

## Notas

- Las notificaciones son internas (dentro de la app); no hay envío real de
  email/SMS todavía — requeriría conectar un proveedor de mensajería.
- Los resultados de laboratorio aceptan un enlace a archivo, pero no hay
  carga de archivos integrada — requeriría Vercel Blob u otro storage.
- No hay procesamiento de pagos en línea; los cobros se registran
  manualmente desde el dashboard.
