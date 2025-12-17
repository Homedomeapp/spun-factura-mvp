# SPUN Factura

Facturación electrónica Verifactu para profesionales de la construcción.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS + shadcn/ui
- **Base de datos:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Autenticación:** Supabase Auth
- **API Verifactu:** Verifacti
- **Deploy:** Vercel

## Requisitos previos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Verifacti](https://verifacti.com) (sandbox gratuito para desarrollo)
- Cuenta en [Vercel](https://vercel.com) (opcional, para deploy)

## Setup local

### 1. Clonar y instalar dependencias

```bash
git clone https://github.com/tu-usuario/spun-factura.git
cd spun-factura
npm install
```

### 2. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://app.supabase.com)
2. Ve a Settings > Database y copia:
   - `URI` (para DATABASE_URL)
   - `Direct URL` (para DIRECT_URL)
3. Ve a Settings > API y copia:
   - `Project URL` (para NEXT_PUBLIC_SUPABASE_URL)
   - `anon public` key (para NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - `service_role` key (para SUPABASE_SERVICE_ROLE_KEY)

### 3. Configurar Verifacti

1. Regístrate en [Verifacti](https://verifacti.com)
2. Crea una cuenta sandbox
3. Ve a API Keys y genera una nueva clave

### 4. Crear archivo .env.local

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres

# Verifacti
VERIFACTI_API_URL=https://sandbox.verifacti.com/api
VERIFACTI_API_KEY=tu-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Crear tablas en la base de datos

```bash
npx prisma generate
npx prisma db push
```

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Deploy en Vercel

### 1. Conectar repo a Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa tu repositorio de GitHub
3. Configura las variables de entorno (copia de .env.local)

### 2. Configurar dominio

1. En Vercel, ve a Settings > Domains
2. Añade `factura.spun.es` (o tu dominio)
3. Configura DNS en tu proveedor

## Estructura del proyecto

```
spun-factura/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Dashboard (protegido)
│   └── api/               # API Routes
├── components/
│   ├── ui/                # Componentes base (shadcn)
│   ├── facturas/          # Componentes de facturas
│   └── shared/            # Componentes compartidos
├── lib/
│   ├── verifacti/         # Cliente API Verifacti
│   ├── db/                # Cliente Prisma
│   ├── utils/             # Utilidades (fiscal, NIF, etc.)
│   └── validations/       # Schemas Zod
├── prisma/
│   └── schema.prisma      # Schema de base de datos
└── public/                # Assets estáticos
```

## Comandos útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Lint
npm run lint

# Prisma
npx prisma studio     # UI para ver/editar DB
npx prisma db push    # Sincronizar schema
npx prisma generate   # Regenerar cliente
```

## Próximos pasos (Semana 1)

- [ ] Implementar autenticación con Supabase
- [ ] Crear flujo de onboarding (datos fiscales)
- [ ] Integrar alta de emisor en Verifacti
- [ ] Crear flujo de firma de representación
- [ ] CRUD de clientes

## Documentación útil

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Verifacti API Docs](https://www.verifacti.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

## Licencia

Privado - Homedome Ibérica S.L.
