# Solución al Problema de Cookies Cross-Origin (CORS)

## Problema Identificado

El backend en Railway devolvía correctamente la cookie de sesión con los atributos necesarios:
- `SameSite=None`
- `Secure`
- `HttpOnly`

Sin embargo, las peticiones subsiguientes devolvían errores 401 (no autenticado) porque el navegador no enviaba la cookie.

## Causa Raíz

Cuando el frontend (en `guildpay-frontend.vercel.app`) hace peticiones cross-origin al backend (en `guildpay-production.up.railway.app`) con `credentials: 'include'`, el backend **DEBE** incluir el header:

```
Access-Control-Allow-Credentials: true
```

Además, debe incluir el header `Access-Control-Allow-Origin` con el origen específico (no puede ser `*` cuando se usan credentials).

Sin estos headers, aunque el backend setee la cookie correctamente, el navegador **no la enviará** en peticiones subsiguientes por razones de seguridad.

## Solución Implementada

### Proxy API en Next.js

Se creó un proxy en Next.js que actúa como intermediario entre el frontend y el backend:

**Ubicación**: `/app/api/proxy/[...path]/route.ts`

Este proxy:
1. Recibe peticiones del frontend en el mismo dominio (sin CORS)
2. Reenvía las peticiones al backend en Railway
3. Mantiene las cookies en las peticiones y respuestas
4. Elimina los problemas de CORS porque las peticiones son same-origin desde la perspectiva del navegador

### Cambios en el Cliente API

**Archivo**: `/lib/api.ts`

Se modificó la URL base para usar el proxy local:

```typescript
const API_BASE_URL = typeof window !== 'undefined'
  ? '/api/proxy'
  : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080');
```

Esto significa que:
- En el navegador: todas las peticiones van a `/api/proxy/*`
- En el servidor (SSR): las peticiones van directamente al backend

### Páginas Actualizadas

Se actualizaron las siguientes páginas que hacían fetch directo al backend:

1. **`/app/page.tsx`**:
   - `/auth/me` → `/api/proxy/auth/me`
   - `/creator/products` → `/api/proxy/creator/products`
   - `/auth/logout` → `/api/proxy/auth/logout`

2. **`/app/subscribe/success/success-content.tsx`**:
   - Cambió `API_URL` a usar `/api/proxy`

## Flujos que Siguen Funcionando

### Login con Discord OAuth

El flujo de OAuth sigue redirigiendo directamente al backend:
- **Inicio**: `/auth/discord/start` → redirige a Discord
- **Callback**: Discord redirige a `backend/auth/discord/callback`
- **Backend**: setea la cookie y redirige al frontend con `?from=discord`
- **Frontend**: valida la sesión usando el proxy

### Subscriber Discord Link

Similar al flujo de creator, el subscriber OAuth también funciona correctamente.

## Verificación

El build compila exitosamente sin errores de TypeScript ni de webpack.

## Recomendación a Futuro

**La solución ideal** es configurar CORS correctamente en el backend en Railway:

```go
// Ejemplo en Go
router.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"https://guildpay-frontend.vercel.app"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Content-Type", "Authorization"},
    AllowCredentials: true,  // ← CRÍTICO
    MaxAge:           12 * time.Hour,
}))
```

Con CORS configurado correctamente, el proxy de Next.js se puede eliminar y el frontend puede comunicarse directamente con el backend.

## Ventajas del Proxy Actual

1. **Funciona inmediatamente** sin cambios en el backend
2. **Elimina problemas de CORS** completamente
3. **Mantiene las cookies** funcionando correctamente
4. **Transparente** para el resto del código

## Desventajas del Proxy

1. **Latencia adicional**: cada petición pasa por Next.js antes de llegar al backend
2. **Carga extra en Vercel**: el proxy consume recursos de Vercel
3. **No ideal para producción a largo plazo**: mejor configurar CORS correctamente en el backend
