# Guía de Despliegue en Servidor (Municipalidad de San Juan Bautista)

Esta guía detalla los pasos para instalar y ejecutar el sistema de asistencia en un servidor institucional (Windows Server o Linux).

## 1. Prerrequisitos del Servidor
Antes de copiar el sistema, asegúrese de que el servidor tenga instalado:

1.  **Node.js (Versión 18 o superior):**
    *   Descargar: [https://nodejs.org/es/download/](https://nodejs.org/es/download/)
2.  **PostgreSQL (Base de Datos):**
    *   Descargar: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
    *   *Nota:* Recuerde la contraseña que le asigne al usuario `postgres` durante la instalación.

---

## 2. Preparar los Archivos (En tu PC de desarrollo)
Antes de subir los archivos al servidor, debemos "compilar" la parte visual (Frontend) para que sea ligera y rápida.

1.  Abre una terminal en la carpeta `FRONTEND` de tu proyecto.
2.  Ejecuta el comando:
    ```bash
    npm run build
    ```
    *Esto creará una carpeta llamada `dist` dentro de FRONTEND.*

---

## 3. Instalación en el Servidor

### A) Copiar Archivos
Copia toda la carpeta del proyecto (`antygrabity-muni-asistencia`) al servidor (por ejemplo, en `C:\Sistemas\Asistencia`).

*Asegúrate de que la carpeta `FRONTEND/dist` que generaste en el paso anterior esté incluida.*

### B) Configurar Base de Datos
1.  En el servidor, abre **pgAdmin** (o la consola SQL).
2.  Crea una nueva base de datos llamada `asistencia_db` (o el nombre que prefieras).

### C) Configurar el Backend
1.  Entra a la carpeta `BACKEND` en el servidor.
2.  Abre el archivo `.env` (si no existe, crea uno copiando el de tu PC).
3.  Edita los datos de conexión para que coincidan con el servidor:

    ```env
    # Puerto donde correrá el sistema
    PORT=3000
    
    # Datos de la Base de Datos del SERVIDOR
    DB_USER=postgres
    DB_PASSWORD=tu_contraseña_secreta_del_servidor
    DB_NAME=asistencia_db
    DB_HOST=localhost
    DB_DIALECT=postgres
    
    # Clave de seguridad (Cámbiala por una larga y segura para producción)
    JWT_SECRET=clave_super_secreta_institucional_sjb_2026
    ```

4.  Instala las dependencias del backend:
    Abre una terminal (CMD o PowerShell) en la carpeta `BACKEND` y ejecuta:
    ```bash
    npm install
    ```

5.  Inicializa la base de datos (Crear tablas y usuario Admin):
    ```bash
    npm run seed
    ```
    *(Solo ejecutar la primera vez).*

---

## 4. Puesta en Marcha (Ejecución Permanente)

Para que el sistema no se cierre si alguien cierra la ventana de la terminal, usaremos **PM2** (un gestor de procesos profesional).

1.  Instala PM2 globalmente en el servidor:
    ```bash
    npm install -g pm2
    ```

2.  Inicia el sistema:
    Estando en la carpeta `BACKEND`:
    ```bash
    pm2 start src/index.js --name "SistemaAsistenciaMuni"
    ```

3.  (Opcional) Configurar inicio automático al encender el servidor:
    ```bash
    pm2 startup
    pm2 save
    ```

## 5. Acceso al Sistema
Una vez ejecutado, el sistema estará disponible en toda la red interna de la municipalidad.

*   **URL:** `http://IP_DEL_SERVIDOR:3000`
    *   *Ejemplo:* `http://192.168.1.50:3000`

---

### Solución de Problemas Comunes
*   **No carga desde otra PC:** Verifique que el **Firewall de Windows** del servidor tenga abierto el puerto `3000`.
*   **Error de Base de Datos:** Verifique que el servicio de PostgreSQL esté corriendo y que la contraseña en el archivo `.env` sea correcta.
