# Jobzapp

Plataforma de gestión para compañías de servicios (Owner + Employee), bilingüe (ES/EN), con tema claro/oscuro/sistema.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **Tailwind CSS v4** + componentes propios estilo shadcn/ui (Radix UI primitives)
- **next-intl** para internacionalización (`/es`, `/en`)
- **next-themes** para tema claro/oscuro/sistema
- **Supabase** (Auth + Postgres + RLS) vía `@supabase/ssr`

## Getting started

```bash
npm install
cp .env.example .env.local   # completa con tus credenciales de Supabase
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) (redirige a `/es`).

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (anon/publishable) de Supabase |

## Estructura

```
src/
  app/[locale]/
    page.tsx              # Landing pública
    (auth)/login, signup  # Autenticación
    owner/…                # Área del dueño (protegida, role=owner)
    employee/…             # Área del empleado (protegida, role=employee)
  components/
    ui/                    # Primitivos (button, card, dropdown-menu, sheet, …)
    app-shell.tsx          # Sidebar + topbar reutilizable (owner/employee)
    theme-toggle.tsx       # Selector de tema (sol/luna/sistema)
    language-switcher.tsx  # Selector de idioma (ES/EN)
  lib/supabase/            # Clientes de Supabase (browser/server/proxy)
  i18n/                    # Config de next-intl (routing, navigation, request)
  proxy.ts                 # next-intl + refresco de sesión + protección de rutas
messages/es.json, en.json  # Textos bilingües
```

## Base de datos (Supabase)

Tablas base: `companies` y `profiles` (`role`: `owner` | `employee`), con RLS habilitado.
Un trigger (`handle_new_user`) crea automáticamente una compañía y un perfil `owner`
cuando alguien se registra.

## Estado actual

Esto es la **base arquitectónica**: autenticación, layouts, navegación, i18n y tema
están funcionando. Los módulos de negocio (Finanzas, Trabajos, Clientes, Empleados,
Taxes, etc.) son pantallas "próximamente" pendientes de implementar.
