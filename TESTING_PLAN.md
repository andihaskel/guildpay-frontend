# GuildPay - Plan de Testing Manual para Auth

## Objetivo
Verificar que el sistema de autenticación funciona correctamente con la configuración de cookies cross-site y los reintentos implementados.

---

## Pre-requisitos

### URLs a usar:
- **Frontend**: `https://guildpay-frontend.vercel.app`
- **Backend**: `https://guildpay-production.up.railway.app`

### Herramientas necesarias:
- Navegadores: Chrome, Firefox, Safari
- DevTools abiertos (F12)
- Modo incógnito disponible

### Configuración de DevTools:
1. Abrir DevTools (F12)
2. Pestaña **Network**: Filtrar por `/auth`
3. Pestaña **Application** → **Cookies**: Ver cookies del dominio
4. Pestaña **Console**: Ver logs de la app

---

## Test 1: Login Normal (Navegador Regular)

### Objetivo
Verificar que el login funciona correctamente en navegador normal con cookies habilitadas.

### Pasos:
1. Abrir navegador (Chrome/Firefox/Safari)
2. Navegar a `https://guildpay-frontend.vercel.app`
3. Click en botón "Login with Discord"
4. Autorizar la aplicación en Discord si es necesario
5. Esperar redirección

### Resultado Esperado:
- ✅ Redirección a `/dashboard/overview` o `/select-server` exitosa
- ✅ En DevTools → Network: ver `GET /auth/me` con status `200`
- ✅ En DevTools → Application → Cookies: ver cookie `session` para `guildpay-production.up.railway.app`
- ✅ En Console: ver logs `API Request: /auth/me` y `API Response: status 200`
- ✅ Avatar/email visible en el dashboard

### Si falla:
- ❌ Status `401` en `/auth/me` → Cookie no viajó, verificar configuración CORS
- ❌ Error de CORS → Backend debe tener `Access-Control-Allow-Credentials: true`
- ❌ Cookie no aparece → Verificar que backend setea `Set-Cookie` en callback
- ❌ Ver logs de reintentos en consola → Indica problema de timing, los reintentos deberían resolverlo

---

## Test 2: Persistencia de Sesión

### Objetivo
Verificar que la sesión persiste después de refrescar la página.

### Pasos:
1. Completar Test 1 (estar logueado)
2. Presionar F5 o Ctrl+R para refrescar la página
3. Esperar carga de página

### Resultado Esperado:
- ✅ Usuario sigue logueado (avatar visible)
- ✅ No redirige a login
- ✅ En DevTools → Network: ver `GET /auth/me` con status `200`
- ✅ Cookie `session` sigue presente

### Si falla:
- ❌ Redirige a login → Cookie no persiste, verificar `Max-Age` y `Expires` en backend
- ❌ Status `401` → Cookie expiró o se borró

---

## Test 3: Login en Modo Incógnito

### Objetivo
Verificar que el login funciona en modo incógnito (donde cookies third-party pueden bloquearse).

### Pasos:
1. Abrir ventana incógnito (Ctrl+Shift+N en Chrome, Ctrl+Shift+P en Firefox)
2. Navegar a `https://guildpay-frontend.vercel.app`
3. Abrir DevTools (F12)
4. Click en botón "Login with Discord"
5. Autorizar la aplicación en Discord
6. **Observar Console para logs de reintentos**

### Resultado Esperado:

**Escenario A (Ideal):**
- ✅ Login exitoso en primer intento
- ✅ Redirección correcta a dashboard

**Escenario B (Con reintentos):**
- ✅ Console muestra: `Auth attempt 1 failed, retrying in 800ms...`
- ✅ Console muestra: `Auth attempt 2 failed, retrying in 1200ms...`
- ✅ Eventualmente: Login exitoso y redirección correcta
- ⚠️ Esto es normal en cross-site + incógnito

**Escenario C (Fallo después de reintentos):**
- ❌ Muestra pantalla de error: "No se pudo establecer sesión..."
- ❌ Botón "Reintentar Login con Discord" visible
- ⚠️ Indica que el navegador bloqueó cookies third-party completamente

### Si falla (Escenario C):
- Esto es **esperado** en algunos navegadores con configuración cross-site
- **Solución**: Implementar deployment same-site (ver DEPLOYMENT_GUIDE.md)
- **Workaround temporal**: Usuario debe usar navegador normal (no incógnito)

### Notas por navegador:
- **Chrome incógnito**: Puede bloquear cookies third-party, esperar reintentos
- **Firefox incógnito**: Bloquea agresivamente, puede fallar completamente
- **Safari incógnito**: Bloquea por defecto, puede fallar

---

## Test 4: Verificación de Pantalla de Error

### Objetivo
Verificar que la pantalla de error se muestra correctamente cuando no se puede establecer sesión.

### Pasos:
1. Simular fallo forzado (desconectar backend temporalmente, o usar incógnito en Safari)
2. Intentar login
3. Observar pantalla después de fallar reintentos

### Resultado Esperado:
- ✅ Muestra Alert rojo con mensaje: "No se pudo establecer sesión. Por favor, intentá login nuevamente."
- ✅ Muestra botón "Reintentar Login con Discord"
- ✅ Click en botón vuelve a iniciar flow de OAuth
- ✅ Console muestra logs de todos los reintentos intentados

### Si falla:
- ❌ Página se queda en "Verificando sesión..." → Timeout no funcionó
- ❌ No muestra mensaje de error → Estado no se actualizó correctamente
- ❌ Botón no funciona → Event handler no está vinculado

---

## Test 5: Logout

### Objetivo
Verificar que el logout funciona correctamente y limpia la sesión.

### Pasos:
1. Completar Test 1 (estar logueado)
2. Click en avatar/menú de usuario
3. Click en "Cerrar Sesión"
4. Esperar redirección

### Resultado Esperado:
- ✅ Redirige a homepage (`/`)
- ✅ En DevTools → Network: ver `POST /auth/logout` con status `200` o `204`
- ✅ Cookie `session` desaparece de Application → Cookies
- ✅ Botón "Login with Discord" visible (no está logueado)
- ✅ Hacer `GET /auth/me` manualmente debería dar `401`

### Si falla:
- ❌ Sigue logueado después de logout → `/auth/logout` no limpia cookie
- ❌ Cookie sigue presente → Backend debe invalidar cookie
- ❌ Error en logout → Verificar endpoint backend

---

## Test 6: Verificación de Cookies en DevTools

### Objetivo
Inspeccionar las cookies directamente para verificar configuración correcta.

### Pasos:
1. Completar Test 1 (estar logueado)
2. Abrir DevTools → Application → Cookies
3. Buscar dominio `guildpay-production.up.railway.app`
4. Inspeccionar cookie `session`

### Resultado Esperado:
- ✅ **Name**: `session`
- ✅ **Value**: String largo (token de sesión)
- ✅ **Domain**: `guildpay-production.up.railway.app` o `.guildpay.com` (si same-site)
- ✅ **Path**: `/`
- ✅ **Expires/Max-Age**: Fecha futura (ej: 1 día)
- ✅ **HttpOnly**: ✓ (marcado)
- ✅ **Secure**: ✓ (marcado)
- ✅ **SameSite**: `None` (en cross-site) o `Lax`/`Strict` (en same-site)

### Flags incorrectos:
- ❌ **HttpOnly** no marcado → Inseguro, cookie accesible desde JS
- ❌ **Secure** no marcado → Cookie no viaja en HTTPS
- ❌ **SameSite** = `Strict` en cross-site → Cookie no viaja entre sitios
- ❌ **SameSite** = `None` sin **Secure** → Navegador rechaza cookie

---

## Test 7: Flujo Completo con Productos

### Objetivo
Verificar que después de login, el flujo de redirección funciona correctamente según existencia de productos.

### Caso A: Usuario SIN productos

#### Pasos:
1. Login con usuario nuevo (sin productos creados)
2. Observar redirección después de OAuth

#### Resultado Esperado:
- ✅ Redirige a `/select-server`
- ✅ Muestra listado de servidores de Discord
- ✅ Usuario puede crear primer producto

### Caso B: Usuario CON productos

#### Pasos:
1. Login con usuario que ya tiene productos
2. Observar redirección después de OAuth

#### Resultado Esperado:
- ✅ Redirige a `/dashboard/overview`
- ✅ Muestra dashboard con productos existentes
- ✅ Puede navegar entre secciones

---

## Test 8: Verificación de Headers en Network

### Objetivo
Verificar que las requests HTTP tienen los headers correctos.

### Pasos:
1. Completar Test 1 (estar logueado)
2. Abrir DevTools → Network
3. Filtrar por `/auth/me` o `/creator/products`
4. Click en una request
5. Ver pestaña "Headers"

### Request Headers esperados:
```
Cookie: session=...
Content-Type: application/json
```

### Response Headers esperados:
```
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: https://guildpay-frontend.vercel.app
Content-Type: application/json
```

### Si falla:
- ❌ No hay `Cookie` header → Frontend no envía `credentials: 'include'`
- ❌ No hay `Access-Control-Allow-Credentials` → Backend no lo está seteando
- ❌ CORS error en Console → Verificar configuración CORS backend

---

## Test 9: Timeout y Error Handling

### Objetivo
Verificar que los timeouts y errores de red se manejan correctamente.

### Pasos:
1. Abrir DevTools → Network
2. Cambiar "Throttling" a "Slow 3G" (simula conexión lenta)
3. Intentar login
4. Observar comportamiento

### Resultado Esperado:
- ✅ Si tarda mucho: Ver logs de reintentos en Console
- ✅ Si falla por timeout: Muestra error claro con mensaje apropiado
- ✅ No se queda indefinidamente en loading
- ⚠️ Timeout configurado en 15 segundos por request

### Simulación de error de red:
1. Abrir DevTools → Network
2. Marcar "Offline"
3. Intentar login

### Resultado Esperado:
- ✅ Muestra error: "Error de conexión. Verificá tu conexión a internet."
- ✅ Botón para reintentar disponible

---

## Checklist Final de Verificación

### Funcionalidad Core:
- [ ] Login normal funciona (Test 1)
- [ ] Sesión persiste después de refresh (Test 2)
- [ ] Login en incógnito funciona o muestra error apropiado (Test 3)
- [ ] Pantalla de error funciona correctamente (Test 4)
- [ ] Logout limpia sesión correctamente (Test 5)

### Configuración Técnica:
- [ ] Cookies tienen flags correctos (Test 6)
- [ ] Headers HTTP son correctos (Test 8)
- [ ] Redirección post-login correcta según productos (Test 7)

### Error Handling:
- [ ] Timeouts se manejan apropiadamente (Test 9)
- [ ] Errores de red muestran mensajes claros (Test 9)
- [ ] Reintentos funcionan como esperado (Test 3)

---

## Problemas Conocidos y Soluciones

### Problema: Login falla en incógnito después de reintentos
**Causa**: Navegador bloquea cookies third-party
**Solución**: Implementar deployment same-site (ver DEPLOYMENT_GUIDE.md)
**Workaround**: Instruir usuarios a usar navegador normal

### Problema: Cookie no viaja en requests
**Causa**: Falta `credentials: 'include'` o CORS mal configurado
**Solución**: Verificar `lib/api.ts` y configuración backend CORS

### Problema: Sesión expira rápido
**Causa**: `Max-Age` o `Expires` muy corto en cookie
**Solución**: Ajustar duración de sesión en backend

### Problema: CORS error en consola
**Causa**: Backend no permite origin del frontend
**Solución**: Agregar frontend origin a `ALLOWED_ORIGINS` en backend

---

## Reporte de Testing

Al completar los tests, documentar:

1. **Tests Pasados**: [X/9]
2. **Tests Fallados**: Lista con detalles
3. **Navegadores Testeados**: Chrome, Firefox, Safari
4. **Modo Incógnito**: ✅ Funciona / ⚠️ Requiere reintentos / ❌ Falla
5. **Errores Encontrados**: Descripción detallada
6. **Screenshots**: De errores o comportamiento inesperado
7. **Logs Relevantes**: De Console y Network

---

## Próximos Pasos Post-Testing

Si **todos los tests pasan**:
- ✅ Sistema funcionando correctamente
- ⚠️ Considerar implementar same-site para mejor experiencia en incógnito
- 📊 Monitorear métricas de tasa de error de sesión

Si **algunos tests fallan**:
- 🔍 Revisar configuración de cookies en backend
- 🔍 Verificar headers CORS
- 🔍 Consultar DEPLOYMENT_GUIDE.md para soluciones
- 🐛 Abrir issue con detalles del fallo
