# Auditoría técnica de AudioSocial 

## 1. Arquitectura

AudioSocial es una aplicación universal construida con:

- Expo SDK 57 / React Native 0.86 / React 19.2.3.
- TypeScript en modo estricto.
- Expo Router para navegación por archivos.
- `expo-audio` para grabación y reproducción.
- Supabase para autenticación, PostgreSQL, Storage, RPC y Edge Functions.
- AsyncStorage para persistir la sesión de Supabase en el dispositivo.

La aplicación es principalmente cliente-servidor: la interfaz corre en Android/iOS/web y los datos se almacenan en Supabase.

## 2. Flujo principal revisado

### Autenticación

1. `app/index.tsx` revisa la sesión.
2. Sin sesión redirige a Sign In.
3. Con sesión redirige a Tabs.
4. Sign Up envía `full_name` y `username` en metadata.
5. `setup_fresh.sql` crea el perfil automáticamente mediante trigger.
6. Recuperación de contraseña usa `audiosocial://update-password` y `SessionProvider` procesa tokens/códigos del deep link.

### Publicación de audio

1. El usuario abre Grabar.
2. Se solicita permiso de micrófono.
3. `expo-audio` registra el audio y su duración.
4. El formulario permite título, descripción y categoría.
5. El archivo se convierte a `ArrayBuffer` y se valida el límite de 25 MB.
6. Se sube a Storage `audio-posts/<uid>/...`.
7. Se crea el registro en `audio_posts`.
8. Si falla la creación del registro, se intenta borrar el archivo subido para evitar archivos huérfanos.

### Consumo e interacción

1. Inicio carga publicaciones recientes y excluye las ocultas por el usuario.
2. Explorar busca en título, descripción, autor y categoría dentro del conjunto reciente.
3. Al abrir una publicación se genera una URL firmada de 30 minutos.
4. `expo-audio` reproduce el archivo.
5. La primera reproducción de esa vista llama `register_audio_play`.
6. El usuario puede dar/quitar Me gusta, Guardar/Quitar, comentar, ocultar y reportar.
7. Si es el autor, puede eliminar la publicación.
8. El backend actualiza contadores y notificaciones mediante triggers.

### Perfil social

1. Perfil propio muestra datos y publicaciones.
2. Perfil público permite seguir/dejar de seguir.
3. El trigger de `follows` actualiza `follower_count`, `following_count` y genera notificación.

### Salas en vivo

La estructura de datos, directorio, creación de sala, precio de pase, invitaciones, entrada/salida y cambios de estado están conectados. El audio LiveKit está deliberadamente desactivado en esta versión para mantener compatibilidad con Expo Go.

Para habilitar salas reales faltan:

- proyecto/servidor LiveKit;
- secretos `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` y URL;
- Edge Function `livekit-token` desplegada;
- paquetes nativos de LiveKit;
- development build de Expo;
- controles de entrada/salida/micrófono y roles;
- proveedor de pagos para salas de pago.

## 3. Problemas detectados en la versión recibida

Se corrigieron los siguientes puntos:

- No había reproductor de audio visible.
- Existían funciones de Like/Guardar pero no estaban conectadas a la interfaz.
- Ocultar una publicación no la eliminaba del feed.
- Explorar prometía búsqueda por username/categoría, pero sólo buscaba título/descripción.
- La duración grabada no se guardaba.
- La subida usaba `Blob`, una ruta problemática para Supabase Storage en React Native.
- No se aplicaba el límite de 25 MB definido en constantes.
- El SQL no incluía la tabla `follows`, aunque el código la utilizaba.
- El SQL no incluía creación de buckets, RLS, triggers ni funciones RPC.
- Sin trigger de Auth, una cuenta nueva podía existir en `auth.users` sin registro en `profiles`.
- Los contadores de likes/comentarios/publicaciones/seguidores no tenían lógica de actualización.
- Las notificaciones no tenían lógica de creación.
- La eliminación de una publicación no intentaba limpiar el archivo en Storage.
- Las consultas del perfil no incluían autor/categoría, por lo que las tarjetas mostraban datos incompletos.
- Guardados, Perfil y Actividad podían quedar visualmente desactualizados al regresar a la pestaña.
- Recuperación de contraseña no procesaba explícitamente el token/código del deep link.
- El proyecto anunciaba ejecución web pero no declaraba `react-dom` ni `react-native-web`.
- Las notificaciones de comentarios aparecían como una interacción genérica y no abrían el contenido relacionado.
- Las salas pagadas fijaban $49 MXN sin permitir elegir un precio válido.

## 4. Limitaciones que siguen siendo intencionales

- No hay compra real de pases para salas pagadas.
- No hay panel administrativo de moderación.
- No hay edición de publicación conectada a UI, aunque el servicio existe.
- No hay selector de avatar conectado a UI, aunque el servicio de subida existe.
- La búsqueda actual trabaja sobre las 100 publicaciones recientes; para escala real conviene búsqueda SQL/FTS.
- No hay paginación infinita del feed todavía.
- No hay reproducción global/miniplayer; el audio se reproduce desde la vista de publicación.
- LiveKit requiere development build, no Expo Go.

## 5. Backend recomendado

Para una instalación limpia usa un proyecto Supabase propio y ejecuta `supabase/setup_fresh.sql`.

No uses el esquema `schema_recovered.sql` como esquema de producción: sólo documenta lo que pudo inferirse del APK y no incluye la seguridad ni automatizaciones necesarias.
