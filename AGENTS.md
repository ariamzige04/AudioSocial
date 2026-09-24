\# Instrucciones para agentes de IA - AudioSocial



Leer primero PROJECT\_CONTEXT.md.



\## Principios



\- No reconstruir el proyecto.

\- No analizar todo el repositorio si la tarea no lo requiere.

\- Buscar primero el código existente relacionado.

\- Abrir solamente los archivos necesarios.

\- Reutilizar funciones, servicios y componentes existentes.

\- Evitar duplicar código.

\- Modificar la menor cantidad posible de archivos.

\- Mantener la arquitectura existente salvo autorización.



\## Antes de modificar



Indicar:



\- qué se va a cambiar

\- qué archivos se necesitan

\- por qué se necesitan



\## Dependencias



No:



\- actualizar paquetes masivamente

\- cambiar versiones sin necesidad

\- ejecutar `npm audit fix --force`

\- sustituir librerías funcionales sin justificación



\## Seguridad



Nunca incluir en código o documentación pública:



\- archivos `.env`

\- contraseñas

\- secret keys

\- Supabase service\_role

\- tokens privados

\- claves privadas de LiveKit

\- credenciales de pagos



\## Git y GitHub



El repositorio es de Ari Gómez.



Los commits deben utilizar la identidad Git configurada por Ari Gómez.



Los agentes de IA son herramientas de asistencia y no deben añadirse como autores o coautores de commits.



No ejecutar:



\- git push

\- publicación de releases

\- merge

\- modificación del repositorio remoto



sin autorización explícita de Ari Gómez.



\## Validación



Después de cambios de código ejecutar:



npm run typecheck



También revisar:



git diff

git status



Antes de terminar informar:



\- archivos modificados

\- cambios realizados

\- pruebas ejecutadas

\- problemas encontrados

\- pendientes

