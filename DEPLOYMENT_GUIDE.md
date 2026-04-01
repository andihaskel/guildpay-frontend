# GuildPay Deployment Guide

## Cross-Site Cookie Configuration

### Problema Actual

El frontend está desplegado en Vercel (`https://guildpay-frontend.vercel.app`) y el backend en Railway (`https://guildpay-production.up.railway.app`). Esta configuración cross-site puede causar problemas con cookies de sesión, especialmente en modo incógnito donde los navegadores bloquean cookies third-party.

### Soluciones Implementadas en el Código

1. **Cliente HTTP configurado correctamente**
   - Todas las requests usan `credentials: 'include'` (ver `lib/api.ts`)
   - Esto asegura que las cookies viajen en requests cross-site

2. **Sistema de reintentos robusto**
   - OAuth callback implementa 3 reintentos con backoff exponencial
   - AuthContext implementa 2 reintentos para verificación de sesión
   - Mensajes de error claros cuando falla el establecimiento de sesión

3. **Manejo de errores mejorado**
   - Pantalla de error específica si no se establece sesión
   - Botón de reintento para usuarios
   - Logs detallados para debugging

### Configuración Recomendada para Producción

#### Opción A: Subdominios Same-Site (Recomendado)

Configure ambos servicios bajo el mismo dominio:

```
Frontend: https://app.guildpay.com (Vercel)
Backend:  https://api.guildpay.com (Railway)
```

**Pasos:**

1. **Configurar DNS:**
   ```
   app.guildpay.com  →  CNAME  →  cname.vercel-dns.com
   api.guildpay.com  →  CNAME  →  [railway-domain]
   ```

2. **Actualizar variables de entorno:**
   ```bash
   # Frontend (.env)
   NEXT_PUBLIC_BACKEND_URL=https://api.guildpay.com
   ```

3. **Configurar cookies en backend:**
   ```go
   // Backend debe setear cookies con:
   Domain: ".guildpay.com"  // Permite compartir entre subdominios
   Secure: true
   SameSite: "lax" o "none"
   HttpOnly: true
   ```

**Ventajas:**
- Cookies funcionan en todos los navegadores, incluido modo incógnito
- Mejor seguridad (cookies no visibles desde otros dominios)
- Mejor experiencia de usuario (sin problemas de sesión)

#### Opción B: Proxy en Frontend (Alternativa)

Configure un proxy en el frontend para que todas las requests API pasen por el mismo origen:

```
Frontend: https://guildpay-frontend.vercel.app
API:      https://guildpay-frontend.vercel.app/api
```

**Pasos (Next.js con Vercel):**

1. **Crear archivo `vercel.json`:**
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://guildpay-production.up.railway.app/:path*"
       }
     ]
   }
   ```

2. **Actualizar variables de entorno:**
   ```bash
   # Frontend (.env)
   NEXT_PUBLIC_BACKEND_URL=/api
   ```

3. **Configurar cookies en backend:**
   ```go
   // Backend debe setear cookies con:
   SameSite: "strict"  // Más seguro en same-origin
   Secure: true
   HttpOnly: true
   ```

**Ventajas:**
- Same-origin: cookies funcionan perfectamente
- No requiere configuración de DNS
- Más simple de implementar

**Desventajas:**
- Agrega latencia (request pasa por Vercel primero)
- Límites de Vercel pueden afectar throughput

### Configuración Actual del Backend

Asegúrate que el backend tenga esta configuración de CORS y cookies:

```go
// CORS Headers
Access-Control-Allow-Origin: https://guildpay-frontend.vercel.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization

// Cookie Settings
Set-Cookie: session=...;
  Path=/;
  Secure;
  HttpOnly;
  SameSite=None;  // Required for cross-site
  Max-Age=86400
```

**Nota importante sobre SameSite:**
- `SameSite=None` requiere `Secure=true` (solo HTTPS)
- Algunos navegadores en incógnito pueden bloquear `SameSite=None`
- Por eso la configuración same-site es preferible

### Limitaciones Conocidas

#### Cross-Site + Modo Incógnito

Cuando el frontend y backend están en diferentes dominios:

1. **Algunos navegadores bloquean cookies third-party por defecto**
   - Safari: bloquea por defecto
   - Firefox: bloquea en modo incógnito
   - Chrome: bloquea en modo incógnito

2. **Workarounds implementados:**
   - Sistema de reintentos reduce tasa de fallo
   - Mensaje de error claro guía al usuario
   - Logs detallados para debugging

3. **Solución definitiva:**
   - Usar configuración same-site (Opción A o B arriba)

### Testing de la Configuración

Después de hacer cambios, testear estos escenarios:

1. **Login normal (navegador regular):**
   ```bash
   # Debería funcionar en primer intento
   1. Click "Login with Discord"
   2. Autorizar aplicación
   3. Verificar redirección a dashboard
   4. Refrescar página - sesión debe persistir
   ```

2. **Login en modo incógnito:**
   ```bash
   # Puede requerir reintentos en cross-site
   1. Abrir ventana incógnito
   2. Click "Login with Discord"
   3. Autorizar aplicación
   4. Verificar que se establece sesión (con o sin reintentos)
   ```

3. **Logout:**
   ```bash
   1. Click "Cerrar Sesión"
   2. Verificar redirección a home
   3. `/auth/me` debe dar 401
   ```

4. **Verificar cookies:**
   ```bash
   # DevTools → Application → Cookies
   # Debe existir cookie "session" después de login
   # En cross-site: cookie debe tener SameSite=None
   # En same-site: cookie puede tener SameSite=Lax
   ```

### Variables de Entorno

**Frontend (.env):**
```bash
# Actual (cross-site)
NEXT_PUBLIC_BACKEND_URL=https://guildpay-production.up.railway.app

# Recomendado para producción (same-site)
NEXT_PUBLIC_BACKEND_URL=https://api.guildpay.com

# O con proxy
NEXT_PUBLIC_BACKEND_URL=/api
```

**Backend:**
```bash
# CORS debe incluir el frontend origin
ALLOWED_ORIGINS=https://guildpay-frontend.vercel.app,https://app.guildpay.com

# Cookie domain (only for same-site setup)
COOKIE_DOMAIN=.guildpay.com  # Permite compartir entre subdominios
```

### Monitoreo y Debugging

**Logs importantes a monitorear:**

1. **Frontend (Browser Console):**
   ```
   API Request: { url, method }
   API Response: { url, status, ok }
   Auth attempt N failed, retrying in Xms...
   ```

2. **Backend:**
   ```
   POST /auth/discord/callback - 302 (redirect)
   Set-Cookie: session=...
   GET /auth/me - 200 (con cookie) o 401 (sin cookie)
   ```

3. **Errores comunes:**
   - `401` en `/auth/me` después de OAuth = cookie no viajó
   - `CORS error` = falta header `Access-Control-Allow-Credentials`
   - `Cookie blocked` en consola = SameSite issue o bloqueado por navegador

### Próximos Pasos

1. **Corto plazo (mantener funcionando):**
   - Los reintentos implementados reducen fallos
   - Monitorear tasa de error de sesión
   - Instruir usuarios a no usar incógnito si tienen problemas

2. **Medio plazo (mejorar experiencia):**
   - Implementar Opción A (subdominios) o B (proxy)
   - Testear exhaustivamente en múltiples navegadores
   - Documentar configuración para equipo

3. **Largo plazo (opcional):**
   - Considerar mover todo a un monorepo
   - Implementar refresh tokens si sesiones son largas
   - Agregar analytics para trackear fallos de sesión
