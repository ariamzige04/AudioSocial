# AudioSocial 

Aplicación Expo/React Native de red social centrada en publicaciones de audio.

## Tecnologías

- Expo SDK 57
- React Native 0.86
- React 19.2.3
- TypeScript
- Expo Router
- expo-audio
- Supabase Auth + PostgreSQL + Storage + RPC + Edge Functions
- AsyncStorage

## Funciones conectadas

- registro, login, logout y recuperación de contraseña;
- feed y búsqueda;
- grabación, subida y reproducción de audio;
- likes, guardados, comentarios y contenido oculto;
- perfiles y follows;
- reportes y notificaciones navegables;
- estructura y control de acceso de salas en vivo (audio LiveKit pendiente).

## Primer arranque

Consulta `RUN_WINDOWS.md` para los pasos completos en Windows.

Comandos principales:

```bash
npm install
npx expo install --fix
npx expo-doctor
npm run typecheck
npx expo start -c
```

## Supabase

Para una instalación limpia, crea tu propio proyecto Supabase y ejecuta:

```text
supabase/setup_fresh.sql
```

Luego copia `.env.example` a `.env` y agrega la URL y Publishable key de tu proyecto.

## Auditoría

Consulta `AUDIT.md` para ver la arquitectura, el flujo revisado, las correcciones realizadas y lo que aún falta para LiveKit/cobros.
