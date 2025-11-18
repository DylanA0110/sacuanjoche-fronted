# Solución para Error de CORS en Upload de Imágenes

## Problema

El error de CORS persiste porque la URL firmada solo incluye `content-length` y `host` en los signed headers (`X-Amz-SignedHeaders=content-length%3Bhost`), pero el navegador puede agregar `Content-Type` automáticamente, causando que el preflight (OPTIONS) falle.

## Solución en el Backend

### Archivo: `spaces.service.ts` (o donde generes las URLs firmadas)

**Cambiar de:**

```typescript
const uploadUrl = await getSignedUrl(this.client!, command, {
  expiresIn,
});
```

**A:**

```typescript
try {
  // Generar URL firmada con unsignPayload para permitir variaciones en headers
  // Esto evita problemas de CORS cuando el navegador agrega headers automáticamente
  const uploadUrl = await getSignedUrl(this.client!, command, {
    expiresIn,
    unsignPayload: true, // Permite que el payload no esté firmado, evitando problemas con headers adicionales
  });
} catch (error) {
  // Manejar error
}
```

## Configuración CORS en DigitalOcean Spaces

✅ **Ya está configurado correctamente:**

- Origin: `http://localhost:5173` (y tu dominio de producción)
- Allowed Methods: `GET`, `PUT`, `POST`, `DELETE`, `HEAD`, `OPTIONS` ← OPTIONS es crucial
- Allowed Headers: `*`
- Access Control Max Age: `3000`

## Verificación

Después de implementar `unsignPayload: true` en el backend:

1. Espera 2-5 minutos para que los cambios se propaguen
2. Prueba subir una imagen desde el frontend
3. El error de CORS debería desaparecer

## Notas Importantes

- `unsignPayload: true` permite que el payload no esté firmado, lo que evita problemas cuando el navegador agrega headers automáticamente
- La configuración CORS en DigitalOcean Spaces ya está correcta
- El frontend ya está configurado para no enviar headers manualmente
