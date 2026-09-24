\# AudioSocial - Contexto del proyecto



\## Descripción



AudioSocial es un proyecto personal y colaborativo de red social centrada en audio.



El proyecto partió de una implementación previa realizada con otro desarrollador y actualmente continúa en desarrollo y mantenimiento por Ari Gómez.



No es un proyecto empresarial ni comercial.



\## Tecnologías



\- Expo SDK 57

\- React Native

\- TypeScript

\- Expo Router

\- Supabase

\- PostgreSQL

\- Supabase Auth

\- Supabase Storage

\- Row Level Security (RLS)

\- expo-audio



\## Backend



Supabase se utiliza para:



\- autenticación

\- perfiles

\- publicaciones

\- audios

\- likes

\- comentarios

\- seguidores

\- guardados

\- notificaciones

\- reportes

\- salas

\- Storage

\- RPC

\- triggers

\- políticas RLS



\## Estado actual



Funcionando:



\- Registro

\- Confirmación por correo

\- Inicio de sesión

\- Sesión persistente

\- Navegación principal

\- Feed

\- Perfiles

\- Publicaciones de audio

\- Reproducción de audio

\- Likes

\- Comentarios

\- Guardados

\- Seguimiento de usuarios

\- Notificaciones

\- Reportes

\- Ocultar publicaciones

\- Supabase conectado



\## Pendientes



\- Mejorar UX/UI general

\- Mejorar pantalla Inicio

\- Mejorar estados vacíos

\- Mostrar aviso después del registro indicando que se envió correo de confirmación

\- Crear contenido ficticio de prueba

\- Crear usuarios ficticios

\- Crear audios de prueba

\- Probar relaciones sociales con datos reales

\- Completar salas Live

\- Integrar LiveKit

\- Implementar pagos

\- Moderación

\- Revisión de seguridad antes de producción



\## Regla de desarrollo



No reconstruir el proyecto completo para hacer cambios pequeños.



Para cada tarea:



1\. Identificar la funcionalidad afectada.

2\. Buscar dónde está implementada.

3\. Leer solamente los archivos relacionados.

4\. Reutilizar código existente.

5\. Modificar la menor cantidad de archivos posible.

6\. Mantener la arquitectura actual.

7\. Ejecutar pruebas y TypeScript.

