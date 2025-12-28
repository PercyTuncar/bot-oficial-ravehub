# Guía Completa: Despliegue y Actualización en AWS EC2

Esta guía cubre todo el ciclo de vida del bot: desde la creación del servidor hasta cómo enviar actualizaciones desde tu computadora usando GitHub.

---

## 📋 Tabla de Contenidos
1.  [Preparación en GitHub](#1-preparación-en-github)
2.  [Crear Instancia AWS EC2](#2-crear-instancia-aws-ec2)
3.  [Configurar el Servidor](#3-configurar-el-servidor)
4.  [Despliegue Inicial](#4-despliegue-inicial)
5.  [Ciclo de Actualización (Cómo subir cambios)](#5-ciclo-de-actualización-cómo-subir-cambios)
6.  [Mantenimiento y Comandos](#6-mantenimiento-y-comandos)

---

## 1. Preparación en GitHub

Antes de tocar el servidor, asegúrate de que tu código esté en GitHub.

1.  Crea un repositorio en GitHub (privado o público).
2.  Sube tu código actual:
    ```bash
    git init
    git add .
    git commit -m "Primer commit: Bot estable"
    git branch -M main
    git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
    git push -u origin main
    ```

---

## 2. Crear Instancia AWS EC2

1.  Ve a AWS Console > **EC2** > **Launch Instance**.
2.  **Nombre**: `RaveHub-Bot`
3.  **OS**: **Ubuntu Server 24.04 LTS** (o 22.04).
4.  **Instance Type**: `t2.micro` (Gratis nivel 1 año) o `t3.micro`.
5.  **Key Pair**: Crea uno nuevo (`ravehub-key.pem`). **¡Guárdalo bien, no se puede recuperar!**
6.  **Network Settings**:
    *   Allow SSH traffic from: **Anywhere** (0.0.0.0/0).
7.  **Lanzar**.

---

## 3. Configurar el Servidor

Conéctate a tu servidor. En tu terminal (PowerShell/CMD/Terminal):

```bash
# Cambia "ravehub-key.pem" por la ruta real de tu archivo
ssh -i "path/to/ravehub-key.pem" ubuntu@TU-IP-PUBLICA
```

Una vez dentro, instala las herramientas necesarias:

```bash
# 1. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Instalar Git y PM2
sudo apt install -y git
sudo npm install -g pm2
```

---

## 4. Despliegue Inicial

Aquí conectaremos el servidor con GitHub para descargar el código.

### Paso A: Autenticación con GitHub (Deploy Key)
Para que el servidor pueda descargar tu código privado sin poner tu contraseña:

1.  **En el servidor EC2**, genera una llave SSH:
    ```bash
    ssh-keygen -t ed25519 -C "bot-ec2"
    # Presiona Enter a todo (sin contraseña)
    ```
2.  Lee la llave pública:
    ```bash
    cat ~/.ssh/id_ed25519.pub
    ```
    *(Copia todo el texto que empieza con `ssh-ed25519...`)*

3.  **En GitHub**:
    *   Ve a tu repositorio -> **Settings** -> **Deploy keys**.
    *   **Add deploy key**.
    *   Title: `AWS Server`.
    *   Key: Pega lo que copiaste.
    *   Marcado "Allow write access" NO es necesario (solo necesitamos leer).
    *   **Add key**.

### Paso B: Clonar el Bot
Volvemos al **servidor EC2**:

1.  Clona el repo (Usa la opción **SSH** en el botón Code de GitHub):
    ```bash
    # Ejemplo: git clone git@github.com:PercyTuncar/bot-oficial-ravehub.git
    git clone git@github.com:TU_USUARIO/TU_REPO.git
    ```
2.  Entra a la carpeta:
    ```bash
    cd nombre-de-tu-repo
    ```
3.  Instala dependencias:
    ```bash
    npm install
    ```

### Paso C: Configurar Secretos
Tienes archivos que no se suben a GitHub (`.env` y credenciales). Créalos manualmente.

1.  **Crear .env**:
    ```bash
    nano .env
    ```
    *   Pega el contenido de tu `.env` local.
    *   Guardar: `Ctrl+O` -> `Enter` -> `Ctrl+X`.

2.  **Subir credenciales de Firebase**:
    *   Como es difícil pegar un archivo JSON grande, crea el archivo:
    ```bash
    nano src/config/serviceAccountKey.json
    ```
    *   Abre tu `serviceAccountKey.json` local, copia todo el texto y pégalo ahí.
    *   Guardar y salir.

### Paso D: Iniciar el Bot
Usaremos PM2 para mantenerlo vivo.

```bash
npm run pm2:start
# O: pm2 start ecosystem.config.js
```

---

## 5. Ciclo de Actualización (Cómo subir cambios)

Esta es la rutina que harás cada vez que modifiques el código.

### 1️⃣ En tu Computadora (Local)
Haces cambios en el código, arreglas bugs, añades comandos, etc.

```bash
# 1. Guardar cambios en Git
git add .
git commit -m "Arreglado bug del comando .info"

# 2. Subir a GitHub
git push
```

### 2️⃣ En el Servidor (AWS EC2)
Actualizas el código que está corriendo.

1.  Conéctate por SSH:
    ```bash
    ssh -i "llave.pem" ubuntu@IP-DEL-SERVIDOR
    ```
2.  Entra a la carpeta y descarga cambios:
    ```bash
    cd nombre-de-tu-repo
    
    # Descargar lo nuevo de GitHub
    git pull
    ```
    *(Si añadiste nuevas librerías en package.json, corre `npm install`)*
    
3.  Reinicia el bot para aplicar cambios:
    ```bash
    pm2 restart whatsapp-bot
    ```

---

## 6. Mantenimiento y Comandos

### Ver qué está pasando (Logs)
Para ver qué hace el bot en tiempo real o ver el código QR:
```bash
pm2 logs
```
*(Usa `Ctrl+C` para salir de los logs, el bot seguirá corriendo)*

### El bot no responde / Se desconectó
Si Whatsapp se desvincula o hay errores raros ("Bad MAC"):

```bash
# 1. Detener bot
pm2 stop whatsapp-bot

# 2. Borrar sesión corrupta (¡Cuidado!)
rm -rf auth_info

# 3. Arrancar de nuevo
pm2 start whatsapp-bot

# 4. Ver QR y escanear
pm2 logs
```

### Configurar Reinicio Automático del Servidor
Si Amazon reinicia tu servidor por mantenimiento, queremos que el bot arranque solo.

```bash
pm2 startup
# Copia y ejecuta el comando que te da PM2
pm2 save
```
