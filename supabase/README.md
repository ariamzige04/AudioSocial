# Supabase de AudioSocial

El APK original permitió recuperar nombres de tablas, relaciones y RPC, pero no las políticas RLS, triggers, funciones SQL completas, secretos ni la Edge Function de LiveKit.

## Para un proyecto nuevo

Ejecuta `setup_fresh.sql` en **Supabase > SQL Editor**. Este archivo crea:

- tablas y relaciones necesarias;
- la tabla `follows`, que faltaba en el esquema recuperado;
- perfil automático al registrarse un usuario;
- RLS para proteger datos por usuario;
- buckets `audio-posts` y `profile-avatars`;
- contadores de publicaciones, likes, comentarios y seguidores;
- notificaciones básicas;
- RPC `register_audio_play` y RPC de acceso a salas;
- categorías iniciales.

## Lo que sigue requiriendo configuración externa

- `livekit-token`: Edge Function y secretos de LiveKit;
- audio en vivo nativo: paquetes LiveKit + development build de Expo;
- cobros de salas de pago: proveedor de pagos, webhooks y creación segura de `live_room_passes`;
- moderación administrativa de reportes.

`schema_recovered.sql` se conserva solamente como referencia de lo extraído/reconstruido desde el APK.
