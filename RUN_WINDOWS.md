# Ejecutar AudioSocial en Windows 11

## A. Requisitos

Instala:

1. Node.js 22 LTS (mínimo 22.13).
2. VS Code.
3. En Android físico: Expo Go.
4. Opcional para emulador: Android Studio.
5. Para un backend limpio: una cuenta/proyecto en Supabase.

Comprueba en PowerShell:

```powershell
node -v
npm -v
```

Node debe mostrar 22.13 o superior.

## B. Abrir el proyecto

Descomprime el ZIP y abre la carpeta `AudioSocial-Clean-v3` en VS Code.

En VS Code abre **Terminal > New Terminal** y confirma que estás dentro de esa carpeta:

```powershell
pwd
```

## C. Instalar dependencias

```powershell
npm install
npx expo install --fix
npx expo-doctor
npm run typecheck
```

Si `expo-doctor` detecta una versión incorrecta, vuelve a ejecutar:

```powershell
npx expo install --fix
npx expo-doctor
```

## D. Configurar Supabase (recomendado)

### Opción recomendada: proyecto Supabase propio

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor**.
3. Copia y ejecuta todo el archivo `supabase/setup_fresh.sql`.
4. Ve a **Project Settings > API**.
5. Copia Project URL y Publishable key.
6. En la raíz del proyecto crea `.env` copiando `.env.example`.
7. Déjalo así:

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
```

8. En Supabase > Authentication > URL Configuration agrega como Redirect URL:

```text
audiosocial://**
```

> El esquema `audiosocial://` se prueba correctamente en una app instalada o en un **development build**. El resto de la aplicación puede probarse con Expo Go, pero la recuperación de contraseña por deep link conviene validarla en development build.

El proyecto conserva una configuración recuperada como fallback, pero para desarrollo serio conviene usar tu propio Supabase.

## E. Arrancar en Android físico con Expo Go

En la terminal:

```powershell
npx expo start -c
```

Aparecerá un QR.

1. Conecta laptop y teléfono a la misma red Wi-Fi.
2. Abre Expo Go en Android.
3. Escanea el QR.

Si la red local bloquea la conexión:

```powershell
npx expo start --tunnel
```

## F. Arrancar en emulador Android

1. Abre Android Studio.
2. Inicia un dispositivo desde Device Manager.
3. En VS Code ejecuta:

```powershell
npx expo start -c
```

4. Cuando aparezca el menú de Expo, presiona:

```text
a
```

También puedes usar:

```powershell
npm run android
```

## G. Arrancar en navegador

```powershell
npm run web
```

Las dependencias web (`react-dom` y `react-native-web`) ya están declaradas en `package.json`. Si `expo-doctor` propone ajustes de versión, usa `npx expo install --fix` antes de volver a iniciar.

Nota: la grabación de micrófono en navegador puede requerir HTTPS o localhost y el comportamiento de MediaRecorder cambia entre navegadores.

## H. Qué probar primero

Prueba en este orden:

1. Crear cuenta.
2. Confirmar correo si está habilitado en Supabase.
3. Iniciar sesión.
4. Abrir Perfil y comprobar que se creó `profiles`.
5. Grabar un audio corto.
6. Publicarlo.
7. Abrirlo y reproducirlo.
8. Dar Me gusta y Guardar.
9. Escribir comentario.
10. Ir a Guardados y confirmar que aparece.
11. Ocultarlo y confirmar que desaparece de Inicio al regresar.
12. Crear una segunda cuenta para probar Seguir y notificaciones.

## I. Salas en vivo

El directorio y la creación de salas pueden probarse, pero el audio LiveKit no funciona todavía en Expo Go. Para esa fase hay que crear un development build e integrar LiveKit y, si habrá salas pagadas, un proveedor de pagos.

## J. Comandos útiles

Limpiar caché:

```powershell
npx expo start -c
```

Diagnóstico:

```powershell
npx expo-doctor
```

TypeScript:

```powershell
npm run typecheck
```

Reinstalación limpia si hay problemas:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
npx expo install --fix
npx expo start -c
```
