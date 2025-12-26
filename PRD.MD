crea un bot para whatsapp  usando baileys, debes estrcturar los archivos , debes usar solo javascript ES6 , debes usar firebase.
la estructura de archivos debe ser facil de escalar es decir se de poder agregar nuevos comandos facilmente.

se subira a ES2 de AWS se debe usar PM2 para mantenrlo activo 24/7, debe tener buenas practicas para que no se crashee debe ser todo asincorono debe tener un flujo perfecto desde la ejecicion hasta la respuesta.

debe tener las sigueintes funcionalidads:

se arranca el bot se muestra por la terminal el qr para leerlo desde el telefono y vincular el bot con un numero, el boto debe poder ejecutar sus propios comandos, no debe ser ignorado , al vincular correctamnte el bot manda un DM a su propio privado indicando que se ha conectado exitosamente y todo los detalles del server.

para activar el bot dentro de un grupo se debe hacer de la siguiente forma:
en el dm del mismo bot el mismo bot  debe mandar el comando .listgroups y se mostrara una lista con todo los grupos donde pertenece el bot y se peude activar , respuesta debe ser ordenado el nombre del grupo su Identificador numero de participantes etc cada grupo por semarado, despues en el mismo DM el bot debe enviar .bot on id_del_grupo y   debe responder el bot en el mismo DM se esta activando el grupo, despues se debe editar ese misma respuesta a cargando 0 a 100% de 10 en 10 y finalmente una ultima actulizada donde diga que el bot se ha activado y ya se peude usar ene se grupo.
para apagar el bot dentro del grupos se debe ejecutar .bot off id_del_grupo  , despues dentro de los grupos debe existir 4 niveles de permismos el priemero el bot pordra ejecutar absolutamnte todo los comandos, el segundo son los admis pordran ejecutar comandos de admin , los terceros son los comandos premium que tienen permiso para que algunos numeros tengan acceso a ciertos comandos que son premiums, los otros que son comandos para que cualquier participante pueda ejecutar.
IMPRTANTE: 
cuando se crea un grupo en la base de datos se debe crear el grupo como coleccion principal y dentro sus documentos y subcolecciones que sea necesario apra cumplir con todo lo que se pide, tambien dentro tendra su configuracion del grupo donde se podra configurar las bienvenidas , despedidas para ese grupo, etc. 


IMPORTANTE:
En la base de datos se debe guardar los siguientes datos de todo los integrantes cuando interactuan por primera vez, si un usuario manda un mensje por primera vez se debe crear el usuario en la base de datos con todo sus metadaros unicos para poder identificarlo, este usuario tendra su ID, numero de telefono real, su nombre que tiene configurado en sus ajustes de su whtasapp, la cantidad de mensjes que ha enviado en el grupo (por ejemplo si manda un mensje por primera  vez  en el grupo se debe crear al usario en la abse de datos con el contado de mensajes que debe iniciar en 1 porque acaba de enviar su primer mensje y tambien se debe mandar el contenido de su mensje, en el caso de que ya haya enviado mensjes anteriormete entoces solo se debe actualizar el coantador de mensajes  y se debe seguri sus mensjes si el mensaje contiene a una mencion a un usuario tambien se debe guardar dentro de ese mensje que ha mencionado a un usuario (identificando al usaurio mencioando con sus datos como nombre telefono real y ID) ), tambien se debe  guardar su historial de warns y el motivo, su histial de kicks y el motivo, la hora de la ultima vez que mando un mensaje , cuantos dias tiene activo en el grupo , su fecha de cumpleanios, su nivel sube de nivel cada cierta cantidad de mensejes enviados, dinero (para ganar dinero debe enviar mensjes) cada mensje enviado debe ser equivalente a $0.01 centavos, si manda 10 mensjes entonces tendra $0.10 centavos, si manda 100 mensaje entonces tendra $1 USD,  debe tener esa logica debe mostrar centavos y si ya es $1 entones debe decir dolares. 
IMPORTANTE DEL SITEMA DE ECONOMIA: cada $0.50 centavos  recien se le debe pagar al usuario es decir si un usuairo manda 1 mensje solo acumula 0.01 centavo pero no sera transfirido al usaurio aun , solo se le paga cada que el usuario acumule $0.50, el sitema paga al usuario dinero en efectivo al usuario  para proteger el dinero pagado el usuario debe ejecutar el comando .deposit (.deposit {cantidad} con alias .depositar {cantiad} .dep {cantidad}, .dep all o .depositar todo para depositar todo )   

 PARA SUBIR DE NIVEL SE DEBE BASAR EN EL DINERO SI TIENE MENOS DE 10 USD ENTONCES ES NIVEL 1, SI TIENE EN TRE 10 Y 20 ENTOCNES ES DE NIVEL 2 Y ASI SUCESIVAMENTE, Y CADA NIVEL TAMBIEN DEBE TENER UN NOMBRE 0 - 10 USD: Youtube (Lo ves desde tu casa, no te alcanzó).

10 - 20 USD: Vereda (Escuchando desde la calle, tomando trago corto).

20 - 30 USD: Reja (Apurando la entrada, pero todavía afuera).

30 - 40 USD: Tribuna (Adentro, pero lo ves chiquitito y de lejos).

40 - 50 USD: General (En el pogo, apretado y sudando).

50 - 60 USD: Preferencial (Un poquito más cerca, pero igual parado).

60 - 70 USD: VIP (Ya tienes pulsera, te sientes especial).

70 - 80 USD: SuperVIP (Barra libre y baño limpio).

80 - 90 USD: Backstage (Te codeas con los dueños y staff).

90 - 100 USD: Booth (En la cabina, al lado del DJ).

> 100 USD: Headliner (Tú eres la estrella, todos te miran).

CADA QUE UN USUARIIO SUBE O BAJA DE NIVEL SE LE DEBE MANDAR UN MENSJE POR EJEMPLO SI SUBE A NIVEL 2 SE LE NOTIFICA AL SUARIO:
@USUARIO SUBISTE A NIVEL 2, ZONA REJA, eres una perosona que ve desde la reja aun no te alcanza para entrar.
si sube a nivel 3 entonces el mensaje sera: @USUARIO SUBISTE A NIVEL 3, ZONA tribuna, ya puedes entrar pero lo ves desde lejos... y asi sucesivamente.

cuando baja de nivel tambien se le debe notificar mencioandolo , solo baja de nivel cada que gasta su dinero o le roban, El nivel debe basarse en el Patrimonio Neto (Net Worth), que es Dinero en Mano + Dinero en Banco. 

OJO: la cantidad de mensjes importa para subir de nivel por ejemplo si un usuario manda 100 mensjes tendra 1 usd , pero si gasta ese 1 usd debe seguir manteniendo la cantidad de mensjes que es 100, si llega a tener 200 mensjes de neuvo tendra 1 USD, debes aplicar esa logica para que de forma consitente se siga sumando el dinero despues de gastar, es muy importante crear una logica consitente para que esto funcione.


debe existir los siguientes comandos:
.ping puede ejecutar el mismo bot y admins los demas no deben tener acceso a este comando, la respuesta debe ser pong la latencia y estado del servidor.

el comando .me puede ser ejecutado por cualquiera y mostrara su informacion del usario que ha consultado como : foto de perfil cantidad de mensjes , warns,  la cantidad de dinero, SU nivel: nivel 1 y su descripcion del nivel, etc todo lo que este usuario tenga en la base de datos.

el comando .info @usuario tambien debe poder ser ejecutado por todos , pero esto es muy importnate si un usuario hace .info @usaurio y menciona a un usuario que nunca ha interactuado mandando un mensje por lo tanto este usuario mencioando no esta registrado en la base de datos se el debe mostrar un mensje diciendole que el usario aun no esta activo en el chat, si el usuario mencionado ya ha participado mandando un mensje entonces se supone que ya esta en la base de datos y ahora si se mostrara toda la info de ese usario mencionado similar al .me pero con los datos del usuario emncionado.

comando .rob este comando debe ser ejecutado el bot, admins y por todos los usuarios  usuarios de nivel 2 en adelante , se usa de la sigueinte forma: .rob @usuario o con su alias  .robar @usuario, el sitema debe hacer lo sigueinte identifica al usario mencionado en la base de datos busca la cantitdad de dinero que tiene , si tiene 0 entocnes respondera "@usuario No tiene dinero" , si tiene dinero debe existir una probailidad de 30% robo existoso y se debe robar aleatoriamente cualquier cantidad que tenga el usuario por ejmplo si el usuario victima tiene 2 USD y le quieren robar y sale exitoso puede robarle  todo o solo 0.01 centavo, si roba todo el mensje debe ser dejaste en banca rota a @usuario, si roba entre 0 y 10% de su riqueza le debe responder el bot cuanto en procentaje y cantidad  se ha robando de ese usario y le debe decir que tu robo fue casi frustrado, si le roba entre 10 y 20% entocnes le debe mostrar la cantidad robada y tambien le debe mostran un mensje "este fue un robo novato" si le roba entre 20 y 50% entocnes le debe mostrar la cantidad tambien y le mensje debe decir Buen robo, y asi sucesivamente, si se roba el 100% que sera pcoo probable pero no 0% de probalibidad entoces le DIRA ROBO EXITOSO ERES UN MAESTRO ROBASTE 100% A @USUARIO Y LE DEJASTE EN BANCA ROTA... pero tambien debe existir una probabilidad de 50% que el robo falle y se le debe decir : Robo fallido te atrapo la polcia y te multo con {cantida} de dolares y se le pago a @usuario victima por danios y prejuicios, si la multa al ladron es alta mayor a lo que tiene en su patrimonio entonces debe tener una deuda su dinero debe ser negativo y debe enviar mas mensjes para que obtenga dinero y todo el dinero obtenido se le debe pagar a la victiva hasta saldar su deuda y recien sumara el dinero al ladron cuando no tenga dedas penales por pagar.  SOLO SE DEBE PODER ROBAR DINERO EN EFECTIVO QUE EL USARIO TENGA Y no ha guardado en su banco , en caso de las multas al ladron se debe quitar dinero que tengan en su banco y en la amno se debe hacer como una intervencion bancaria y a sus bolsillos para pagar la deuda y si no cuenta con el monto para pagar sudeuda sumanod su banco y bolsillo entonces Generas Deuda Negativa y sus futuros mensajes pagan esa deuda.

El comando .shop debe mostrar el inventario de la tienda que debe ser un JSON por ejmplo los productos deben tener su nombre descripcion precio etc.
ejemplo:  1 . CERVEZA  precio $25 descripcion: "Reclama una cerveza en el proximo festival que asistira ravehub"
2. STIKER PRECIO $15 reclama 1 stikcer a tu eleccion  en el siguiente festibval que asistira ravehub.
3. POLO ravehub precio $85 reclama un polo oficial de ravehub en nuestro proximo festival que asistira ravehub. 
para comprar usa .buy numero_de_item


el comando .buy item , este comando crea un pedido de la tienda (se debe validadr si el suario cuenta con el dinero suficiente para generar el pedido), si es validado todo entocnes se debe gernar el pedido para que los admis puedan verlo y queda en estado de pendiente de entrega.
Identificadores de Pedido (Order ID): Cada vez que alguien compre con .buy item, el sistema debe generar un código corto único (ej: #ORD-001). Así el admin gestiona por código y no por nombre de usuario (que puede cambiar).


el comando  .requests (o .pedidos): debe ser usado solo por admins, Función: Muestra una lista solo de los pedidos con estado PENDING. Formato: [#ORD-05] @usuario - Cerveza ($25) - Hace 10 min.

el comando .deliver <ID_PEDIDO> (o .entregar): 
Función: Marca el pedido como DELIVERED en la base de datos y le avisa al usuario: "✅ @usuario Tu pedido #ORD-05 ha sido entregado. ¡Disfrútalo!".
.reject <ID_PEDIDO> (o .rechazar):

Función: Marca el pedido como REJECTED.

Lógica de Reembolso: CRÍTICO. El sistema debe tomar el precio del producto y devolverlo automáticamente al BANCO del usuario (para que no se lo roben apenas se lo devuelvan). Le envía un mensaje: "❌ Tu pedido #ORD-05 fue rechazado. Se te reembolsaron $25 a tu cuenta bancaria".


. Sistema de Bienvenidas (.welcome):

Comando .welcome on: Activa las bienvenidas en el grupo.

Comando .welcome off: Desactiva.

Comando .welcome message [texto]: Guarda el mensaje personalizado.

Placeholders: El bot debe reemplazar dinámicamente:

{user}: Mención (@) al usuario que entra.

{group}: Nombre del grupo.

{members}: Cantidad total de participantes.

Detección de Imágenes (IMPORTANTE):

Si el texto configurado contiene una URL directa de imagen (terminada en .png, .jpg, .jpeg), el bot debe detectar esa URL.

Acción: Descargar la imagen de la URL y enviar el mensaje como tipo IMAGEN (attachment) poniendo el resto del texto como descripción (caption).

Si no hay URL de imagen, enviar como texto normal.

Debe respetar saltos de línea, negritas y emojis del texto original.


Sistema de Moderación:
Lógica de Identificación de Objetivo y Motivo (Común para Warn y Kick)
El bot debe ser capaz de identificar al usuario y el motivo de dos formas:

Mención Directa: .comando @usuario Motivo manual.

Respuesta (Reply): Si se responde a un mensaje de un usuario con .comando (con o sin motivo extra).

Algoritmo de Prioridad para el Motivo:

Prioridad 1 (Texto explícito): Si el admin escribe texto después del comando (ej: .warn @user Spam), ese es el motivo.

Prioridad 2 (Contenido del mensaje respondido): Si el admin NO escribe texto, pero está respondiendo a un mensaje, el contenido de ese mensaje original se convierte automáticamente en el motivo.

Ejemplo: Un usuario envía "Hijo de puta". El admin responde a ese mensaje solo con .warn.

Resultado: El motivo guardado en base de datos será: "Hijo de puta".

Prioridad 3 (Default): Si no hay texto ni respuesta, el motivo es "Sin motivo especificado".

B. Comando .warn (Advertencia)
Flujo de Ejecución:

Lectura: Consultar en BD cuántas advertencias tiene el usuario actualmente.

Incremento: Sumar +1 al contador y guardar el nuevo historial (Motivo, Admin que sancionó, Fecha).

Verificación de Límite (3 Warns):

Caso A (Warns < 3):

Guardar cambios en BD.

Responder: "⚠️ @usuario ha sido advertido. Motivo: [X]. Advertencias: [N]/3".

Caso B (Warns >= 3):

Guardar cambios en BD.

Responder: "🚫 @usuario ha superado el límite de 3 advertencias. Expulsando...".

Ejecutar Expulsión: El bot elimina al usuario del grupo inmediatamente.

(Opcional) Resetear contador de warns a 0 tras la expulsión automática.

C. Comando .kick (Expulsión)
Flujo de Ejecución:

Registro: Guardar en el historial del usuario en BD que fue expulsado (Motivo, Admin, Fecha) para tener antecedentes futuros.

Ejecución: Enviar la orden a Baileys para remover al participante del grupo (groupParticipantsUpdate -> remove).

Respuesta: Enviar mensaje al grupo: "se va, se va... se fue! @usuario expulsado. Motivo: [Motivo Detectado]".


JUEGOS:
para jugar se debe hacer los iguiente priemro se debe usar dinero en efectivo (dinero en mano) si su dinero en mano es 0 entocnes se le debe indicar que debe retirar deinero de su banco ".retirar cantidad" si no tiene dinero en el banco au usar .retirar entoces se le mostrar un mensaje que no tiene dinero. y si tiene se debe poder jugar los siguientes juegos desde $1, lo ganado se paga en su mano y debe depositarlo para que su dinero este seguro , si pierde obviamente se debe descontar: 


💡 Idea 1: La Tragaperras (Slots) 🎰
El juego más visual. El usuario apuesta y ve cómo giran los emojis.

Comando: .slot [cantidad]

Probabilidad:

3 Iguales (7️⃣7️⃣7️⃣): x10 (Muy difícil - 5%)

2 Iguales (🍒🍒❓): x1.5 (Medio - 30%)

Diferentes: Pierde (65%)

Flujo de Animación (Edición de Mensaje):

Usuario: .slot 10

Bot (Mensaje inicial):

Plaintext

🎰 CASINO RAVEHUB 🎰
---------------------
| 🟩 | 🟩 | 🟩 |
---------------------
GIRANDO...
Bot (Edita a los 1s):

Plaintext

🎰 CASINO RAVEHUB 🎰
---------------------
| 🍒 | 🟩 | 🟩 |
---------------------
...
Bot (Edita a los 2s):

Plaintext

🎰 CASINO RAVEHUB 🎰
---------------------
| 🍒 | 🍒 | 🟩 |
---------------------
...
Bot (Final - Resultado):

Plaintext

🎰 CASINO RAVEHUB 🎰
---------------------
| 🍒 | 🍒 | 🍋 |
---------------------
¡Casi! Tienes par de cerezas.
Ganaste: $15 (x1.5)
Se depositó en tu mano. 💵
💡 Idea 2: Cara o Cruz (Coinflip) 🪙
Simple, rápido y adictivo. 50/50.

Comando: .flip [cantidad] [cara/cruz]

Probabilidad: 50% ganar, 50% perder.

Pago: x1.95 (El 0.05 es la comisión de la casa para evitar inflación).

Flujo de Animación:

Usuario: .flip 5 cara

Bot (Inicial): "Tirando la moneda... 🤜🪙"

Bot (Edita 1s): "La moneda está en el aire... ☁️🪙☁️"

Bot (Final): "Resultaod: CARA 🤴. ¡Ganaste $9.75!"

💡 Idea 3: Dados (Dice/High-Low) 🎲
Apostar si la suma de dos dados será mayor o menor a 7.

Comando: .dados [cantidad] [mas/menos] (Más de 7 o Menos de 7).

Pago: x2. (Si sale exactamente 7, la casa gana, esa es la ventaja del bot).

Flujo de Animación:

Usuario: .dados 20 mas

Bot (Inicial): "Agitando el cubilete... 🥤"

Bot (Edita 1s): "Tirando dados... 🎲 🎲"

Bot (Final): "Dados: [ ⚄ ] [ ⚅ ] = 11. ¡Apostaste MÁS y salió 11! Ganaste $40."

A. Tragamonedas (.slot [cantidad])
Descuento: Restar la apuesta de wallet inmediatamente.

Animación (Edición):

Enviar mensaje: "🎰 | 🟩 | 🟩 | 🟩 | Girando..."

Esperar 1s, editar: "🎰 | 🍒 | 🟩 | 🟩 | ..."

Esperar 1s, editar: "🎰 | 🍒 | 🍒 | ❓ | ..."

Esperar 1s, editar Resultado Final.

Lógica: Generar 3 items aleatorios (🍒, 🍋, 🍇, 💎, 7️⃣).

3 Iguales (Jackpot): Paga x10.

2 Iguales: Paga x1.5.

Diferentes: No paga (Pérdida total).

Pago: Si gana, sumar premio a wallet y avisar: "Ganaste $[monto] en efectivo".

B. Cara o Cruz (.flip [cant] [cara/cruz])
Descuento: Restar apuesta.

Animación:

Enviar: "Lanzando moneda... 🤜🪙"

Editar (1s): "Girando en el aire... 🌀"

Editar (1s): Resultado Final ("Cayó: CARA 🤴").

Lógica: 50% probabilidad.

Pago: Si acierta, paga x1.95 (La casa se queda 5%).

C. Dados (.dice [cant] [mas/menos])
Apuesta a si la suma de 2 dados es Mayor (mas) o Menor (menos) a 7.

El número 7 es la Casa: Si la suma es exactamente 7, el usuario pierde siempre.

Animación: "🎲 Agitando..." -> "🎲 Rodando..." -> "🎲 [4] [1] = 5".

Pago: Si acierta, paga x2.

# Sistema Completo de Bot WhatsApp con Baileys y Firebase

## Stack Tecnológico
- **Librería:** Baileys (WhiskeySockets/Baileys) - Última versión estable
- **Lenguaje:** JavaScript ES6 (Node.js 17+)
- **Base de Datos:** Firebase Firestore
- **Servidor:** AWS EC2
- **Gestor de Procesos:** PM2 (daemon mode 24/7)
- **Arquitectura:** Asíncrona, event-driven, modular y escalable

---

## Arquitectura del Proyecto

### Estructura de Archivos (Modular y Escalable)

```
whatsapp-bot/
├── index.js                    # Punto de entrada principal
├── package.json
├── ecosystem.config.js         # Configuración PM2
├── .env                        # Variables de entorno
│
├── src/
│   ├── config/
│   │   ├── firebase.js         # Inicialización Firebase
│   │   └── baileys.js          # Configuración Baileys
│   │
│   ├── handlers/
│   │   ├── connection.js       # Manejo de conexión/QR
│   │   ├── messages.js         # Handler principal de mensajes
│   │   └── groups.js           # Handler de eventos de grupos
│   │
│   ├── commands/
│   │   ├── index.js            # Registry de comandos
│   │   ├── admin/              # Comandos de administración
│   │   │   ├── ping.js
│   │   │   ├── listgroups.js
│   │   │   ├── botcontrol.js
│   │   │   ├── warn.js
│   │   │   ├── kick.js
│   │   │   ├── deliver.js
│   │   │   └── reject.js
│   │   │
│   │   ├── user/               # Comandos para usuarios
│   │   │   ├── me.js
│   │   │   ├── info.js
│   │   │   ├── rob.js
│   │   │   └── shop.js
│   │   │
│   │   ├── economy/            # Sistema económico
│   │   │   ├── deposit.js
│   │   │   ├── withdraw.js
│   │   │   └── buy.js
│   │   │
│   │   ├── games/              # Juegos de casino
│   │   │   ├── slot.js
│   │   │   ├── coinflip.js
│   │   │   └── dice.js
│   │   │
│   │   └── moderation/         # Sistema de bienvenidas
│   │       └── welcome.js
│   │
│   ├── services/
│   │   ├── database.js         # Operaciones Firestore
│   │   ├── economy.js          # Lógica económica
│   │   ├── levels.js           # Sistema de niveles
│   │   ├── permissions.js      # Control de permisos
│   │   └── shop.js             # Gestión de tienda
│   │
│   ├── utils/
│   │   ├── logger.js           # Sistema de logs
│   │   ├── validators.js       # Validaciones
│   │   └── formatters.js       # Formatos de mensajes
│   │
│   └── middleware/
│       ├── anticrash.js        # Manejo de errores global
│       ├── ratelimit.js        # Rate limiting
│       └── groupcheck.js       # Verificar grupo activo
│
└── auth_info/                  # Sesión Baileys (persistente)
```

---

## Flujo de Inicialización del Bot

### 1. Arranque y Autenticación

**Comando de inicio:**
```bash
pm2 start ecosystem.config.js
```

**Flujo esperado:**

```
[SISTEMA] Iniciando bot WhatsApp...
[BAILEYS] Cargando sesión de autenticación...
[BAILEYS] No hay sesión previa detectada
[QR] Escanea este código QR desde tu WhatsApp:

█████████████████████████████
█████████████████████████████
████ ▄▄▄▄▄ █▀█ █▄▄█ ▄▄▄▄▄ ████
████ █   █ █▀▀▀█ ▀█ █   █ ████
████ █▄▄▄█ █▀ █▀▀ █ █▄▄▄█ ████
...

[QR] Tienes 60 segundos para vincular el dispositivo
```

**Al vincular exitosamente:**
```
[BAILEYS] ✓ Conexión establecida con WhatsApp
[BAILEYS] ✓ Sesión guardada en /auth_info
[BOT] Enviando mensaje de confirmación al DM propio...
```

**Mensaje automático al DM del bot:**
```
🤖 BOT CONECTADO EXITOSAMENTE

📊 Detalles del servidor:
━━━━━━━━━━━━━━━━━━━━━━
🖥️ Servidor: AWS EC2 (us-east-1)
⚡ Proceso: PM2 (ID: 0)
🔄 Estado: ONLINE
📶 Latencia: 45ms
⏰ Conectado: 24/12/2024 - 15:32:10
💾 Memoria: 128MB / 1GB
🔥 Firebase: Conectado
━━━━━━━━━━━━━━━━━━━━━━

✅ El bot está listo para usarse.
Usa .listgroups para ver grupos disponibles.
```

---

## Sistema de Control del Bot en Grupos

### Comando: `.listgroups`
**Permisos:** Solo ejecutable por el bot en su propio DM  
**Alias:** `.listargrupos`, `.grupos`

**Ejecución:**
```
Usuario (Bot): .listgroups
```

**Respuesta esperada:**
```
📋 GRUPOS DISPONIBLES

━━━━━━━━━━━━━━━━━━━━━━
1️⃣ RaveHub Community
📌 ID: 120363025@g.us
👥 Participantes: 247
🤖 Estado: INACTIVO
━━━━━━━━━━━━━━━━━━━━━━
2️⃣ Festival Squad 2024
📌 ID: 120363189@g.us
👥 Participantes: 89
🤖 Estado: ACTIVO
━━━━━━━━━━━━━━━━━━━━━━
3️⃣ Techno Lovers Chile
📌 ID: 120363267@g.us
👥 Participantes: 156
🤖 Estado: INACTIVO
━━━━━━━━━━━━━━━━━━━━━━

💡 Usa: .bot on <ID> para activar
💡 Usa: .bot off <ID> para desactivar
```

### Comando: `.bot on <id_grupo>`
**Permisos:** Solo ejecutable por el bot en su propio DM  
**Alias:** `.activar <id>`

**Ejecución:**
```
Usuario (Bot): .bot on 120363025@g.us
```

**Respuesta con animación (edición de mensaje):**

**Mensaje 1 (inmediato):**
```
🔄 Activando bot en: RaveHub Community
```

**Mensaje editado cada 500ms:**
```
⏳ Cargando sistema... [████░░░░░░] 10%
```
```
⏳ Cargando sistema... [████████░░] 80%
```

**Mensaje final:**
```
✅ BOT ACTIVADO EXITOSAMENTE

📍 Grupo: RaveHub Community
🆔 ID: 120363025@g.us
👥 Participantes: 247
⏰ Activado: 24/12/2024 - 15:45:30
━━━━━━━━━━━━━━━━━━━━━━
El bot ya puede responder comandos en este grupo.
```

**Acción en Firebase:**
```javascript
// Estructura creada en Firestore
groups/
  └── 120363025@g.us/
      ├── active: true
      ├── name: "RaveHub Community"
      ├── participants: 247
      ├── activatedAt: Timestamp(2024-12-24T15:45:30)
      ├── settings/
      │   ├── welcome: {enabled: false, message: "", imageUrl: ""}
      │   ├── farewell: {enabled: false, message: ""}
      │   └── antilink: false
      ├── members/ (subcolección)
      └── economy/ (subcolección)
```

### Comando: `.bot off <id_grupo>`
**Permisos:** Solo bot en su DM  

**Ejecución:**
```
Usuario (Bot): .bot off 120363025@g.us
```

**Respuesta:**
```
🔴 BOT DESACTIVADO

📍 Grupo: RaveHub Community
🆔 ID: 120363025@g.us
⏰ Desactivado: 24/12/2024 - 16:20:15
━━━━━━━━━━━━━━━━━━━━━━
El bot ignorará comandos en este grupo hasta reactivarlo.
```

---

## Sistema de Permisos (4 Niveles)

### Nivel 1: Bot Owner (Permisos Absolutos)
- **Identificación:** Número del bot registrado
- **Acceso:** Todos los comandos sin restricción
- **Comandos exclusivos:** `.ping`, `.bot on/off`, `.listgroups`

### Nivel 2: Administradores de Grupo
- **Identificación:** Verificado mediante `groupMetadata.participants` (admin=true)
- **Comandos permitidos:**
  - `.warn`, `.kick`, `.welcome`, `.deliver`, `.reject`, `.requests`
  - Comandos de moderación y gestión de pedidos

### Nivel 3: Usuarios Premium
- **Identificación:** Lista almacenada en Firebase (`groups/{groupId}/premiumUsers`)
- **Comandos permitidos:**
  - Comandos especiales definidos por admins
  - Acceso prioritario a funciones avanzadas

### Nivel 4: Usuarios Regulares
- **Acceso:** Comandos básicos públicos
- **Comandos permitidos:**
  - `.me`, `.info`, `.rob`, `.shop`, `.buy`, `.deposit`, `.withdraw`
  - Juegos de casino (`.slot`, `.flip`, `.dice`)

**Validación de permisos en cada comando:**
```javascript
// Ejemplo de flujo
async function handleCommand(message, command) {
  const userLevel = await getPermissionLevel(message.sender);
  const requiredLevel = commandRegistry[command].requiredLevel;
  
  if (userLevel < requiredLevel) {
    return sendMessage(message.chat, "❌ No tienes permiso para este comando.");
  }
  
  // Ejecutar comando...
}
```

---

## Sistema de Usuarios y Base de Datos

### Creación Automática de Usuario (Primera Interacción)

**Trigger:** Usuario envía primer mensaje en un grupo activo

**Datos capturados:**
```javascript
users/
  └── 51987654321/ // Número sin @ pero con código país
      ├── id: "51987654321"
      ├── phone: "+51 987 654 321"
      ├── name: "Diego Ramirez" // Nombre de WhatsApp
      ├── joinedAt: Timestamp
      ├── lastMessage: Timestamp
      ├── activeDays: 1
      ├── birthday: null
      ├── totalMessages: 1
      ├── wallet: 0.01 // Dinero en mano
      ├── bank: 0 // Dinero en banco
      ├── pending: 0 // Dinero acumulado sin pagar
      ├── level: 1
      ├── levelName: "Youtube"
      ├── warns: []
      ├── kicks: []
      └── messages/ (subcolección)
          └── {messageId}/
              ├── content: "Hola grupo!"
              ├── timestamp: Timestamp
              ├── mentions: ["51912345678"] // IDs mencionados
              └── replied_to: null
```

**Proceso paso a paso:**

1. **Verificar si usuario existe en BD**
   - Si no existe → Crear documento con datos iniciales
   - Si existe → Actualizar `totalMessages` y agregar mensaje a subcolección

2. **Registro del mensaje**
   ```javascript
   // Guardar cada mensaje enviado
   await db.collection('users').doc(userId).collection('messages').add({
     content: messageText,
     timestamp: new Date(),
     mentions: extractMentions(message),
     repliedTo: message.quoted ? message.quoted.sender : null
   });
   ```

3. **Actualizar contador de mensajes**
   ```javascript
   await db.collection('users').doc(userId).update({
     totalMessages: FieldValue.increment(1),
     lastMessage: new Date(),
     pending: FieldValue.increment(0.01)
   });
   ```

---

## Sistema Económico

### Mecánica de Ganancia de Dinero

**Regla base:**  
1 mensaje = $0.01 USD

**Sistema de pago diferido:**
- El dinero se **acumula** en `pending` hasta llegar a **$0.50**
- Al alcanzar $0.50 → Se transfiere automáticamente a `wallet` (dinero en mano)
- Notificación al usuario cuando recibe el pago

**Ejemplo de flujo:**

```
Usuario envía mensaje #1:
  totalMessages: 1
  pending: 0.01
  wallet: 0
  → Sin pago aún

Usuario envía mensaje #50:
  totalMessages: 50
  pending: 0.50
  wallet: 0
  → ¡Pago automático!
  
[SISTEMA] Transfiere 0.50 a wallet
  pending: 0
  wallet: 0.50
  
[BOT NOTIFICA]:
💰 ¡PAGO RECIBIDO!
Has recibido $0.50 en efectivo.
💡 Usa .deposit 0.50 para guardarlo en el banco.
```

### Protección de Dinero: Sistema Bancario

**Dinero en mano vs Dinero en banco:**
- **Wallet (mano):** Vulnerable a robos, usado para juegos
- **Bank (banco):** Protegido, no puede ser robado

**Comando: `.deposit <cantidad>`**  
**Alias:** `.depositar`, `.dep`  
**Uso especial:** `.dep all` o `.depositar todo`

**Ejemplo de uso:**
```
Usuario: .deposit 5.00
```
**Respuesta:**
```
💳 DEPÓSITO EXITOSO

💵 Cantidad: $5.00
🏦 Banco: $5.00 → $10.00
💰 Efectivo: $7.50 → $2.50
━━━━━━━━━━━━━━━━━━━━━━
✅ Tu dinero está protegido.
```

**Comando: `.withdraw <cantidad>`**  
**Alias:** `.retirar`, `.sacar`

**Ejemplo:**
```
Usuario: .withdraw 3.00
```
**Respuesta:**
```
🏧 RETIRO EXITOSO

💵 Cantidad: $3.00
🏦 Banco: $10.00 → $7.00
💰 Efectivo: $2.50 → $5.50
━━━━━━━━━━━━━━━━━━━━━━
💡 Recuerda: El efectivo puede ser robado.
```

---

## Sistema de Niveles

### Cálculo del Nivel (Basado en Patrimonio Neto)

**Fórmula:**
```
Patrimonio Neto = wallet + bank
```

**Tabla de Niveles:**

| Rango USD | Nivel | Nombre | Descripción |
|-----------|-------|--------|-------------|
| 0 - 10 | 1 | Youtube | Lo ves desde tu casa, no te alcanzó |
| 10 - 20 | 2 | Vereda | Escuchando desde la calle, tomando trago corto |
| 20 - 30 | 3 | Reja | Apurando la entrada, pero todavía afuera |
| 30 - 40 | 4 | Tribuna | Adentro, pero lo ves chiquitito y de lejos |
| 40 - 50 | 5 | General | En el pogo, apretado y sudando |
| 50 - 60 | 6 | Preferencial | Un poquito más cerca, pero igual parado |
| 60 - 70 | 7 | VIP | Ya tienes pulsera, te sientes especial |
| 70 - 80 | 8 | SuperVIP | Barra libre y baño limpio |
| 80 - 90 | 9 | Backstage | Te codeas con los dueños y staff |
| 90 - 100 | 10 | Booth | En la cabina, al lado del DJ |
| > 100 | 11 | Headliner | Tú eres la estrella, todos te miran |

### Notificaciones de Subida/Bajada de Nivel

**Ejemplo - Usuario sube a nivel 3:**
```
🎉 ¡SUBISTE DE NIVEL!

@Usuario subiste a NIVEL 3
🎫 ZONA: REJA
━━━━━━━━━━━━━━━━━━━━━━
👀 Eres una persona que ve desde la reja.
Aún no te alcanza para entrar, pero ya estás cerca.

💰 Patrimonio: $23.50
📊 Mensajes enviados: 1,235
```

**Ejemplo - Usuario baja a nivel 2:**
```
⚠️ BAJASTE DE NIVEL

@Usuario bajaste a NIVEL 2
🍺 ZONA: VEREDA
━━━━━━━━━━━━━━━━━━━━━━
📉 Escuchando desde la calle, tomando trago corto.
Has perdido dinero, ¡recupera tu posición!

💸 Patrimonio: $15.80
💰 Necesitas: $4.20 más para volver a Reja
```

### Consistencia del Sistema de Mensajes

**Problema a resolver:**  
Usuario tiene 100 mensajes ($1.00) → Gasta $1.00 → Debe seguir progresando

**Solución implementada:**
```javascript
// No resetear totalMessages al gastar dinero
// Solo usar totalMessages para tracking de actividad
// El dinero se calcula independientemente:

Usuario:
  totalMessages: 100 (nunca decrece)
  wallet: 0 (gastó todo)
  pending: 0

// Envía 100 mensajes más:
  totalMessages: 200
  pending: 1.00
  // Al llegar a 0.50 pending:
  wallet: 1.00 (nuevo pago)
```

---

## Comandos de Usuario

### Comando: `.ping`
**Permisos:** Bot Owner, Admins  
**Alias:** Ninguno

**Ejecución:**
```
Admin: .ping
```

**Respuesta:**
```
🏓 PONG!

⚡ Latencia: 42ms
🖥️ Servidor: AWS EC2
🔥 Firebase: 18ms
💚 Estado: ONLINE
⏰ Uptime: 12h 34m 18s
💾 Memoria: 156MB / 1GB
```

### Comando: `.me`
**Permisos:** Todos los usuarios  
**Alias:** `.perfil`, `.yo`

**Ejecución:**
```
Usuario: .me
```

**Respuesta:**
```
👤 PERFIL DE USUARIO

━━━━━━━━━━━━━━━━━━━━━━
📛 Nombre: Diego Ramírez
📞 Teléfono: +51 987 654 321
🆔 ID: 51987654321
━━━━━━━━━━━━━━━━━━━━━━
💰 ECONOMÍA
💵 Efectivo: $12.45
🏦 Banco: $87.30
💎 Patrimonio: $99.75
━━━━━━━━━━━━━━━━━━━━━━
📊 ESTADÍSTICAS
✉️ Mensajes: 2,473
🎂 Cumpleaños: 15/08
📅 Días activo: 127
⏰ Último mensaje: Hace 3m
━━━━━━━━━━━━━━━━━━━━━━
🎯 NIVEL
🔰 Nivel 10: Booth
🎵 En la cabina, al lado del DJ
📈 Próximo nivel: $0.25 más
━━━━━━━━━━━━━━━━━━━━━━
⚠️ INFRACCIONES
Advertencias: 1/3
Expulsiones: 0
```

### Comando: `.info @usuario`
**Permisos:** Todos los usuarios  
**Alias:** `.perfil @usuario`, `.ver @usuario`

**Ejecución:**
```
Usuario: .info @51912345678
```

**Respuesta si el usuario NO existe:**
```
❌ USUARIO NO REGISTRADO

@Usuario aún no ha interactuado en este grupo.
Debe enviar al menos 1 mensaje para registrarse.
```

**Respuesta si el usuario existe:**
```
👤 PERFIL DE @CarlosMendez

━━━━━━━━━━━━━━━━━━━━━━
📛 Nombre: Carlos Mendez
📞 Teléfono: +51 912 345 678
🆔 ID: 51912345678
━━━━━━━━━━━━━━━━━━━━━━
💰 ECONOMÍA
💵 Efectivo: $3.20
🏦 Banco: $45.80
💎 Patrimonio: $49.00
━━━━━━━━━━━━━━━━━━━━━━
📊 ESTADÍSTICAS
✉️ Mensajes: 820
🎂 Cumpleaños: No configurado
📅 Días activo: 45
⏰ Último mensaje: Hace 1h
━━━━━━━━━━━━━━━━━━━━━━
🎯 NIVEL
🔰 Nivel 5: General
🎸 En el pogo, apretado y sudando
📈 Próximo nivel: $1.00 más
━━━━━━━━━━━━━━━━━━━━━━
⚠️ INFRACCIONES
Advertencias: 0/3
Expulsiones: 0
```

---

## Sistema de Robos

### Comando: `.rob @usuario`
**Permisos:** Bot, Admins, Usuarios de nivel 2 o superior  
**Alias:** `.robar @usuario`, `.steal @usuario`

### Mecánica del Robo

**Condiciones:**
- El ladrón debe ser nivel 2 o superior
- Solo se roba dinero en **wallet** (efectivo)
- El dinero del banco NO puede ser robado

**Probabilidades:**
- 30% → Robo exitoso
- 50% → Robo fallido (multa)
- 20% → Robo frustrado (sin consecuencias)

**Cantidad robada (si es exitoso):**
- Aleatoria entre 1% y 100% del efectivo de la víctima

### Ejemplos de Uso

**Caso 1: Víctima sin dinero**
```
Ladrón: .rob @51987654321

Bot responde:
💼 @Diego no tiene dinero en efectivo.
No hay nada que robar.
```

**Caso 2: Robo exitoso (baja cantidad)**
```
Ladrón: .rob @51987654321

[SISTEMA CALCULA]
- Víctima tiene: $10.00 en wallet
- Probabilidad: 30% → Éxito
- Cantidad robada: $0.80 (8%)

Bot responde:
🥷 ROBO CASI FRUSTRADO

Robaste $0.80 (8%) a @Diego
💰 Tu efectivo: $5.00 → $5.80
━━━━━━━━━━━━━━━━━━━━━━
⚠️ ¡Ese fue un robo novato!
Por poco te atrapan.
```

**Caso 3: Robo exitoso (cantidad media)**
```
Ladrón: .rob @51987654321

[SISTEMA]
- Víctima: $10.00
- Robado: $3.50 (35%)

Bot:
💰 BUEN ROBO

Robaste $3.50 (35%) a @Diego
💵 Tu efectivo: $5.00 → $8.50
━━━━━━━━━━━━━━━━━━━━━━
👍 Robo decente, nada mal.
```

**Caso 4: Robo perfecto (100%)**
```
Ladrón: .rob @51987654321

[SISTEMA]
- Víctima: $10.00
- Robado: $10.00 (100%)

Bot:
🎉 ¡ROBO PERFECTO!

💎 ERES UN MAESTRO DEL CRIMEN 💎
Robaste $10.00 (100%) a @Diego
━━━━━━━━━━━━━━━━━━━━━━
💀 DEJASTE EN BANCA ROTA A @Diego
💰 Tu efectivo: $5.00 → $15.00
```

**Caso 5: Robo fallido - Multa baja**
```
Ladrón: .rob @51987654321

[SISTEMA]
- Probabilidad: 50% → Fallo
- Multa: $2.00 (aleatoria)
- Ladrón tiene: wallet $1.50, bank $5.00

Bot:
🚨 ROBO FALLIDO

❌ TE ATRAPÓ LA POLICÍA
💸 Multa: $2.00 pagados a @Diego
━━━━━━━━━━━━━━━━━━━━━━
Tu efectivo: $1.50 → $0.00
Tu banco: $5.00 → $4.50
━━━━━━━━━━━━━━━━━━━━━━
⚖️ Se tomó dinero de tu banco.
@Diego recibió $2.00 como compensación.
```

**Caso 6: Robo fallido - Deuda generada**
```
Ladrón: .rob @51987654321

[SISTEMA]
- Multa: $8.00
- Ladrón tiene: wallet $1.00, bank $3.00
- Total disponible: $4.00
- Deuda generada: $4.00

Bot:
🚨 ROBO FALLIDO - DEUDA GENERADA

❌ TE ATRAPÓ LA POLICÍA
💸 Multa: $8.00 a @Diego
━━━━━━━━━━━━━━━━━━━━━━
📊 INTERVENCIÓN BANCARIA
Efectivo: $1.00 → $0.00
Banco: $3.00 → $0.00
💳 Deuda pendiente: -$4.00
━━━━━━━━━━━━━━━━━━━━━━
⚠️ NO PUDISTE PAGAR LA MULTA COMPLETA
Tus próximos mensajes pagarán esta deuda.
@Diego recibió $4.00 (resto pendiente).
```

**Sistema de pago de deuda:**
```javascript
// Usuario con deuda: -$4.00
// Envía 100 mensajes = $1.00 generado

[SISTEMA]
- pending: $1.00
- Se destina a pagar deuda: -$4.00 → -$3.00
- wallet: $0 (no recibe dinero aún)

// Usuario sigue enviando mensajes...
// Deuda se salda completamente
- pending: $4.00 acumulado
- Deuda: -$4.00 → $0.00
- wallet: $0.00 (nada extra)

// Próximo mensaje:
- pending: $0.01
- wallet: $0.01 (ahora sí recibe dinero)
```

---

## Sistema de Tienda

### Estructura del Inventario (JSON en Firebase)

```javascript
shop/ (colección)
  └── inventory/ (documento)
      └── items: [
        {
          id: 1,
          name: "Cerveza",
          description: "Reclama una cerveza en el próximo festival que asistirá RaveHub",
          price: 25.00,
          category: "bebidas",
          available: true,
          stock: 50
        },
        {
          id: 2,
          name: "Sticker",
          description: "Reclama 1 sticker a tu elección en el siguiente festival que asistirá RaveHub",
          price: 15.00,
          category: "merchandising",
          available: true,
          stock: 100
        },
        {
          id: 3,
          name: "Polo RaveHub",
          description: "Reclama un polo oficial de RaveHub en nuestro próximo festival",
          price: 85.00,
          category: "ropa",
          available: true,
          stock: 30
        }
      ]
```

### Comando: `.shop`
**Permisos:** Todos los usuarios  
**Alias:** `.tienda`, `.store`

**Ejecución:**
```
Usuario: .shop
```

**Respuesta:**
```
🛒 TIENDA RAVEHUB

━━━━━━━━━━━━━━━━━━━━━━
1️⃣ CERVEZA
💵 Precio: $25.00
📦 Stock: 50 unidades
📝 Reclama una cerveza en el próximo
   festival que asistirá RaveHub.
━━━━━━━━━━━━━━━━━━━━━━
2️⃣ STICKER
💵 Precio: $15.00
📦 Stock: 100 unidades
📝 Reclama 1 sticker a tu elección
   en el siguiente festival.
━━━━━━━━━━━━━━━━━━━━━━
3️⃣ POLO RAVEHUB
💵 Precio: $85.00
📦 Stock: 30 unidades
📝 Reclama un polo oficial de RaveHub
   en nuestro próximo festival.
━━━━━━━━━━━━━━━━━━━━━━

💡 Para comprar: .buy <número>
   Ejemplo: .buy 1
```

### Comando: `.buy <número_item>`
**Permisos:** Todos los usuarios  
**Alias:** `.comprar <número>`, `.purchase <número>`

**Validaciones:**
1. Usuario tiene suficiente dinero en banco
2. Item existe y está disponible
3. Hay stock disponible

**Ejecución exitosa:**
```
Usuario: .buy 1

[SISTEMA VALIDA]
- Item #1 existe: ✓
- Precio: $25.00
- Usuario bank: $87.30 ✓
- Stock disponible: 50 → 49 ✓
- Genera Order ID: #ORD-001

Bot responde:
✅ COMPRA EXITOSA

🛍️ Producto: Cerveza
💰 Precio: $25.00
🆔 Pedido: #ORD-001
━━━━━━━━━━━━━━━━━━━━━━
💳 MOVIMIENTO BANCARIO
Banco: $87.30 → $62.30
━━━━━━━━━━━━━━━━━━━━━━
📋 Estado: PENDIENTE DE ENTREGA
⏰ Creado: 24/12/2024 - 16:45:30

🔔 Serás notificado cuando los admins
   procesen tu pedido.
```

**Ejecución con error (sin fondos):**
```
Usuario: .buy 3

[SISTEMA]
- Precio: $85.00
- Usuario bank: $62.30 ❌

Bot:
❌ FONDOS INSUFICIENTES

🛍️ Producto: Polo RaveHub
💰 Precio: $85.00
🏦 Tu banco: $62.30
━━━━━━━━━━━━━━━━━━━━━━
❌ Te faltan: $22.70

💡 Envía más mensajes para ganar dinero
   o usa .deposit para guardar tu efectivo.
```

### Sistema de Pedidos en Firebase

```javascript
orders/ (colección)
  └── ORD-001/ (documento)
      ├── orderId: "ORD-001"
      ├── userId: "51987654321"
      ├── userName: "Diego Ramírez"
      ├── userPhone: "+51 987 654 321"
      ├── itemId: 1
      ├── itemName: "Cerveza"
      ├── price: 25.00
      ├── status: "PENDING" // PENDING, DELIVERED, REJECTED
      ├── createdAt: Timestamp
      ├── deliveredAt: null
      ├── rejectedAt: null
      ├── handledBy: null // Admin que procesó
      └── groupId: "120363025@g.us"
```

---

## Comandos de Gestión de Pedidos (Admins)

### Comando: `.requests`
**Permisos:** Administradores  
**Alias:** `.pedidos`, `.orders`

**Ejecución:**
```
Admin: .requests
```

**Respuesta:**
```
📋 PEDIDOS PENDIENTES

━━━━━━━━━━━━━━━━━━━━━━
🆔 #ORD-001
👤 @Diego (+51 987 654 321)
🛍️ Cerveza
💰 $25.00
⏰ Hace 10 minutos
━━━━━━━━━━━━━━━━━━━━━━
🆔 #ORD-002
👤 @Carlos (+51 912 345 678)
🛍️ Sticker
💰 $15.00
⏰ Hace 1 hora
━━━━━━━━━━━━━━━━━━━━━━
🆔 #ORD-003
👤 @Maria (+51 998 765 432)
🛍️ Polo RaveHub
💰 $85.00
⏰ Hace 3 horas
━━━━━━━━━━━━━━━━━━━━━━

Total: 3 pedidos pendientes

💡 Usa:
.deliver <ID> para marcar como entregado
.reject <ID> para rechazar y reembolsar
```

**Si no hay pedidos:**
```
📋 PEDIDOS PENDIENTES

✅ No hay pedidos pendientes.
Todos los pedidos han sido procesados.
```

### Comando: `.deliver <order_id>`
**Permisos:** Administradores  
**Alias:** `.entregar <order_id>`, `.complete <order_id>`

**Ejecución:**
```
Admin: .deliver ORD-001

[SISTEMA]
- Busca pedido ORD-001
- Valida estado = PENDING ✓
- Actualiza status → DELIVERED
- Registra admin y timestamp

Bot responde al admin:
✅ PEDIDO ENTREGADO

🆔 Pedido: #ORD-001
👤 Cliente: @Diego
🛍️ Producto: Cerveza
💰 Valor: $25.00
━━━━━━━━━━━━━━━━━━━━━━
📦 Marcado como ENTREGADO
👨‍💼 Procesado por: @Admin
⏰ 24/12/2024 - 17:30:45

Bot notifica al usuario:
✅ TU PEDIDO HA SIDO ENTREGADO

🆔 Pedido: #ORD-001
🛍️ Producto: Cerveza
━━━━━━━━━━━━━━━━━━━━━━
🎉 ¡Disfrútalo en el festival!
Nos vemos en el próximo evento de RaveHub.
```

### Comando: `.reject <order_id>`
**Permisos:** Administradores  
**Alias:** `.rechazar <order_id>`, `.cancel <order_id>`

**Ejecución:**
```
Admin: .reject ORD-002

[SISTEMA]
- Busca pedido ORD-002
- Valida estado = PENDING ✓
- Actualiza status → REJECTED
- Reembolso: $15.00 → bank del usuario
- Registra admin y timestamp

Bot responde al admin:
❌ PEDIDO RECHAZADO

🆔 Pedido: #ORD-002
👤 Cliente: @Carlos
🛍️ Producto: Sticker
💰 Valor: $15.00
━━━━━━━━━━━━━━━━━━━━━━
❌ Marcado como RECHAZADO
💸 Reembolso: $15.00 → Banco
👨‍💼 Procesado por: @Admin
⏰ 24/12/2024 - 17:35:20

Bot notifica al usuario:
❌ TU PEDIDO FUE RECHAZADO

🆔 Pedido: #ORD-002
🛍️ Producto: Sticker
━━━━━━━━━━━━━━━━━━━━━━
💳 REEMBOLSO PROCESADO
Se reembolsaron $15.00 a tu banco.
🏦 Banco: $45.80 → $60.80
━━━━━━━━━━━━━━━━━━━━━━
📧 Contacta a un admin para más información.
```

---

## Sistema de Bienvenidas

### Configuración del Mensaje de Bienvenida

**Comando: `.welcome on`**  
**Permisos:** Administradores  
**Ejecución:**
```
Admin: .welcome on

Bot:
✅ Bienvenidas activadas en este grupo.
💡 Configura el mensaje con:
.welcome message [tu mensaje]
```

**Comando: `.welcome off`**  
**Permisos:** Administradores  
**Ejecución:**
```
Admin: .welcome off

Bot:
❌ Bienvenidas desactivadas en este grupo.
```

**Comando: `.welcome message <texto>`**  
**Permisos:** Administradores  

**Ejecución con placeholders:**
```
Admin: .welcome message ¡Bienvenido {user} a {group}! 🎉

Somos {members} miembros en esta comunidad.

Reglas:
1. Respeta a todos
2. No spam
3. Disfruta la música

Bot:
✅ Mensaje de bienvenida configurado.
━━━━━━━━━━━━━━━━━━━━━━
Vista previa:

¡Bienvenido @NuevoUsuario a RaveHub Community! 🎉

Somos 248 miembros en esta comunidad.

Reglas:
1. Respeta a todos
2. No spam
3. Disfruta la música
```

### Bienvenida con Imagen

**Ejecución:**
```
Admin: .welcome message https://i.imgur.com/festival2024.jpg

¡Bienvenido {user} a {group}! 🎉
Festival Season 2024 🎵

Bot detecta URL de imagen (.jpg/.png/.jpeg)

Bot:
✅ Mensaje con imagen configurado.
━━━━━━━━━━━━━━━━━━━━━━
🖼️ Imagen detectada: festival2024.jpg
📝 Texto: Configurado con placeholders
━━━━━━━━━━━━━━━━━━━━━━
💡 Las bienvenidas se enviarán como imagen
   con el texto como descripción.
```

**Cuando un nuevo usuario se une:**
```
[SISTEMA DETECTA NUEVO PARTICIPANTE]
- Grupo activo: ✓
- Bienvenidas activadas: ✓
- Descarga imagen desde URL
- Reemplaza placeholders:
  {user} → @NuevoUsuario
  {group} → RaveHub Community
  {members} → 249

Bot envía:
[IMAGEN: festival2024.jpg]
Caption:
¡Bienvenido @NuevoUsuario a RaveHub Community! 🎉
Festival Season 2024 🎵
```

**Sistema de detección de imagen:**
```javascript
// Pseudo-código
function detectImageUrl(text) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];
  
  for (const url of urls) {
    if (imageExtensions.some(ext => url.toLowerCase().endsWith(ext))) {
      return url;
    }
  }
  return null;
}

async function sendWelcome(newUser, group) {
  const config = await getGroupConfig(group.id);
  let message = config.welcomeMessage;
  
  // Reemplazar placeholders
  message = message.replace('{user}', `@${newUser.id}`);
  message = message.replace('{group}', group.name);
  message = message.replace('{members}', group.participants.length);
  
  const imageUrl = detectImageUrl(config.welcomeMessage);
  
  if (imageUrl) {
    // Descargar imagen y enviar como attachment
    const imageBuffer = await downloadImage(imageUrl);
    await sock.sendMessage(group.id, {
      image: imageBuffer,
      caption: message.replace(imageUrl, '').trim()
    });
  } else {
    // Enviar solo texto
    await sock.sendMessage(group.id, { text: message });
  }
}
```

---

## Sistema de Moderación

### Lógica de Identificación de Objetivo y Motivo

**Prioridad 1: Mención directa con motivo explícito**
```
Admin: .warn @51987654321 Lenguaje inapropiado

[SISTEMA IDENTIFICA]
- Objetivo: @51987654321
- Motivo: "Lenguaje inapropiado"
```

**Prioridad 2: Respuesta a mensaje (reply)**
```
[Usuario envía]: "Hijo de puta"
[Admin responde al mensaje con]: .warn

[SISTEMA IDENTIFICA]
- Objetivo: Autor del mensaje respondido
- Motivo: "Hijo de puta" (contenido del mensaje)
```

**Prioridad 3: Respuesta con motivo adicional**
```
[Usuario envía]: "Hola a todos"
[Admin responde]: .warn Spam repetido

[SISTEMA]
- Objetivo: Autor del mensaje
- Motivo: "Spam repetido" (prioridad sobre contenido)
```

**Prioridad 4: Sin contexto**
```
Admin: .warn @51987654321

[SISTEMA]
- Objetivo: @51987654321
- Motivo: "Sin motivo especificado"
```

### Comando: `.warn`
**Permisos:** Administradores  
**Alias:** `.advertir`, `.warning`

**Caso 1: Primera advertencia (1/3)**
```
Admin: .warn @Diego Spam en el grupo

[SISTEMA]
- Busca usuario en BD
- warns: [] → [{ motivo: "Spam en el grupo", admin: "+51 999 111 222", fecha: Timestamp }]
- Contador: 1/3

Bot:
⚠️ ADVERTENCIA

@Diego ha sido advertido.
━━━━━━━━━━━━━━━━━━━━━━
📝 Motivo: Spam en el grupo
👮 Admin: @AdminName
⚠️ Advertencias: 1/3
━━━━━━━━━━━━━━━━━━━━━━
💡 Al llegar a 3 advertencias serás expulsado.
```

**Caso 2: Segunda advertencia (2/3)**
```
Admin responde a mensaje ofensivo con: .warn

[SISTEMA]
- Mensaje original: "Eres un idiota"
- warns: [prev] → [...prev, new]
- Contador: 2/3

Bot:
⚠️ ADVERTENCIA #2

@Diego ha sido advertido nuevamente.
━━━━━━━━━━━━━━━━━━━━━━
📝 Motivo: "Eres un idiota"
👮 Admin: @AdminName
⚠️ Advertencias: 2/3
━━━━━━━━━━━━━━━━━━━━━━
🚨 ÚLTIMA ADVERTENCIA
Una más y serás expulsado automáticamente.
```

**Caso 3: Tercera advertencia (3/3) → Expulsión automática**
```
Admin: .warn @Diego Insultos repetidos

[SISTEMA]
- warns: [...] → [..., new]
- Contador: 3/3 → LÍMITE ALCANZADO
- Ejecuta expulsión automática
- (Opcional) Resetea warns a 0

Bot:
🚫 LÍMITE DE ADVERTENCIAS ALCANZADO

@Diego ha superado el límite de 3 advertencias.
━━━━━━━━━━━━━━━━━━━━━━
📝 Última infracción: Insultos repetidos
👮 Admin: @AdminName
⚠️ Advertencias: 3/3
━━━━━━━━━━━━━━━━━━━━━━
🚪 EXPULSANDO DEL GRUPO...

[SISTEMA ejecuta groupParticipantsUpdate]

Bot (después de expulsar):
✅ @Diego ha sido expulsado del grupo.
```

### Comando: `.kick`
**Permisos:** Administradores  
**Alias:** `.expulsar`, `.remove`

**Ejecución con mención:**
```
Admin: .kick @Diego Comportamiento tóxico

[SISTEMA]
- Registra en historial de kicks:
  kicks: [{ motivo: "Comportamiento tóxico", admin: "+51 999 111 222", fecha: Timestamp }]
- Ejecuta expulsión via Baileys

Bot:
🚪 EXPULSIÓN EN PROCESO

@Diego será removido del grupo.
━━━━━━━━━━━━━━━━━━━━━━
📝 Motivo: Comportamiento tóxico
👮 Admin: @AdminName
━━━━━━━━━━━━━━━━━━━━━━

[Mensaje animado con edición]
Se va... se va... se va...

[Mensaje final]:
✅ ¡SE FUE!

@Diego ha sido expulsado del grupo.
━━━━━━━━━━━━━━━━━━━━━━
📝 Motivo: Comportamiento tóxico
👮 Expulsado por: @AdminName
⏰ 24/12/2024 - 18:15:45
```

**Ejecución respondiendo mensaje:**
```
[Usuario publica spam]
[Admin responde con]: .kick

[SISTEMA]
- Identifica autor del mensaje
- Motivo: Contenido del mensaje original
- Ejecuta expulsión

Bot:
✅ ¡SE FUE!

@Usuario ha sido expulsado del grupo.
━━━━━━━━━━━━━━━━━━━━━━
📝 Motivo: [contenido del mensaje spam]
👮 Expulsado por: @AdminName
⏰ 24/12/2024 - 18:20:10
```

---

## Sistema de Juegos de Casino

### Requisitos Generales

**Condiciones para jugar:**
1. Tener dinero en **wallet** (efectivo)
2. Si wallet = 0 → Mensaje: "Usa .retirar <cantidad> para sacar dinero del banco"
3. Si bank = 0 y wallet = 0 → Mensaje: "No tienes dinero. Envía mensajes para ganar."
4. Apuesta mínima: $1.00

**Flujo general:**
```javascript
// Validación antes de jugar
async function validateGambling(userId, betAmount) {
  const user = await getUser(userId);
  
  if (betAmount < 1.00) {
    return { valid: false, message: "Apuesta mínima: $1.00" };
  }
  
  if (user.wallet < betAmount) {
    if (user.bank > 0) {
      return { 
        valid: false, 
        message: `No tienes suficiente efectivo.\n💡 Usa .retirar ${betAmount} para sacar dinero.` 
      };
    } else {
      return { 
        valid: false, 
        message: "No tienes dinero.\nEnvía mensajes para ganar." 
      };
    }
  }
  
  return { valid: true };
}
```

### Juego 1: Tragamonedas (`.slot`)

**Comando:** `.slot <cantidad>`  
**Alias:** `.tragaperras <cantidad>`, `.slots <cantidad>`

**Probabilidades:**
- 3 iguales (Jackpot): 5% → Paga x10
- 2 iguales: 30% → Paga x1.5
- Diferentes: 65% → Pierde todo

**Símbolos:** 🍒 🍋 🍇 💎 7️⃣

**Ejecución:**
```
Usuario: .slot 10

[Mensaje inicial]
🎰 CASINO RAVEHUB 🎰
━━━━━━━━━━━━━━━━━━━━━━
| 🟩 | 🟩 | 🟩 |
━━━━━━━━━━━━━━━━━━━━━━
GIRANDO...

[Edita después de 1s]
🎰 CASINO RAVEHUB 🎰
━━━━━━━━━━━━━━━━━━━━━━
| 🍒 | 🟩 | 🟩 |
━━━━━━━━━━━━━━━━━━━━━━
...

[Edita después de 2s]
🎰 CASINO RAVEHUB 🎰
━━━━━━━━━━━━━━━━━━━━━━
| 🍒 | 🍒 | 🟩 |
━━━━━━━━━━━━━━━━━━━━━━
...

[Mensaje final - Resultado]
🎰 CASINO RAVEHUB 🎰
━━━━━━━━━━━━━━━━━━━━━━
| 🍒 | 🍒 | 🍋 |
━━━━━━━━━━━━━━━━━━━━━━
¡Casi! Tienes par de cerezas 🍒🍒
━━━━━━━━━━━━━━━━━━━━━━
💰 Ganaste: $15.00 (x1.5)
💵 Efectivo: $5.00 → $20.00
━━━━━━━━━━━━━━━━━━━━━━
💡 Deposita tus ganancias con .deposit all
```

**Resultado - Jackpot:**
```
🎰 CASINO RAVEHUB 🎰
━━━━━━━━━━━━━━━━━━━━━━
| 7️⃣ | 7️⃣ | 7️⃣ |
━━━━━━━━━━━━━━━━━━━━━━
🎉 ¡¡¡JACKPOT!!! 🎉
━━━━━━━━━━━━━━━━━━━━━━
💎 Ganaste: $100.00 (x10)
💵 Efectivo: $5.00 → $105.00
━━━━━━━━━━━━━━━━━━━━━━
🏆 ¡ERES UN GANADOR!
```

**Resultado - Pérdida:**
```
🎰 CASINO RAVEHUB 🎰
━━━━━━━━━━━━━━━━━━━━━━
| 🍋 | 🍇 | 💎 |
━━━━━━━━━━━━━━━━━━━━━━
😔 No hubo suerte esta vez
━━━━━━━━━━━━━━━━━━━━━━
💸 Perdiste: $10.00
💵 Efectivo: $15.00 → $5.00
━━━━━━━━━━━━━━━━━━━━━━
🎲 Intenta de nuevo con .slot <cantidad>
```

### Juego 2: Cara o Cruz (`.flip`)

**Comando:** `.flip <cantidad> <cara/cruz>`  
**Alias:** `.coinflip <cantidad> <opción>`, `.moneda <cantidad> <opción>`

**Probabilidades:**
- 50% ganar
- 50% perder

**Pago:** x1.95 (comisión del 5% para la casa)

**Ejecución:**
```
Usuario: .flip 5 cara

[Mensaje inicial]
🪙 CARA O CRUZ
━━━━━━━━━━━━━━━━━━━━━━
Apostaste: $5.00 a CARA
Lanzando moneda... 🤜🪙

[Edita después de 1s]
🪙 CARA O CRUZ
━━━━━━━━━━━━━━━━━━━━━━
Girando en el aire... 🌀

[Mensaje final - Ganó]
🪙 CARA O CRUZ
━━━━━━━━━━━━━━━━━━━━━━
Resultado: CARA 🤴
━━━━━━━━━━━━━━━━━━━━━━
✅ ¡GANASTE!
💰 Premio: $9.75 (x1.95)
💵 Efectivo: $10.00 → $14.75
```

**Mensaje final - Perdió:**
```
🪙 CARA O CRUZ
━━━━━━━━━━━━━━━━━━━━━━
Resultado: CRUZ ⚔️
━━━━━━━━━━━━━━━━━━━━━━
❌ Perdiste
Apostaste a CARA pero salió CRUZ
💸 Pérdida: $5.00
💵 Efectivo: $10.00 → $5.00
```

### Juego 3: Dados (`.dice`)

**Comando:** `.dice <cantidad> <mas/menos>`  
**Alias:** `.dados <cantidad> <opción>`, `.roll <cantidad> <opción>`

**Reglas:**
- Se lanzan 2 dados (1-6)
- Apostar si la suma es MAYOR o MENOR a 7
- Si sale exactamente 7 → La casa gana (pierde el jugador)

**Probabilidades:**
- Acierta: Paga x2
- Falla o sale 7: Pierde todo

**Ejecución:**
```
Usuario: .dice 20 mas

[Mensaje inicial]
🎲 DADOS - HIGH/LOW
━━━━━━━━━━━━━━━━━━━━━━
Apostaste: $20.00 a MÁS DE 7
Agitando el cubilete... 🥤

[Edita después de 1s]
🎲 DADOS - HIGH/LOW
━━━━━━━━━━━━━━━━━━━━━━
Tirando dados... 🎲 🎲

[Mensaje final - Ganó]
🎲 DADOS - HIGH/LOW
━━━━━━━━━━━━━━━━━━━━━━
Dados: [ ⚄ ] [ ⚅ ] = 11
━━━━━━━━━━━━━━━━━━━━━━
✅ ¡GANASTE!
Apostaste MÁS y salió 11
💰 Premio: $40.00 (x2)
💵 Efectivo: $15.00 → $35.00
```

**Mensaje final - Perdió:**
```
🎲 DADOS - HIGH/LOW
━━━━━━━━━━━━━━━━━━━━━━
Dados: [ ⚁ ] [ ⚂ ] = 5
━━━━━━━━━━━━━━━━━━━━━━
❌ Perdiste
Apostaste MÁS pero salió 5 (MENOS)
💸 Pérdida: $20.00
💵 Efectivo: $35.00 → $15.00
```

**Mensaje final - Salió 7 (Casa gana):**
```
🎲 DADOS - HIGH/LOW
━━━━━━━━━━━━━━━━━━━━━━
Dados: [ ⚃ ] [ ⚃ ] = 7
━━━━━━━━━━━━━━━━━━━━━━
🏛️ LA CASA GANA
Salió exactamente 7
💸 Pérdida: $20.00
💵 Efectivo: $35.00 → $15.00
━━━━━━━━━━━━━━━━━━━━━━
🎲 El 7 siempre pertenece a la casa
```

---

## Buenas Prácticas de Implementación

### Manejo de Errores (Anti-Crash)

```javascript
// middleware/anticrash.js
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // No detener el proceso, solo loggear
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
});

// Wrapper para comandos
async function safeExecute(commandFn, ...args) {
  try {
    await commandFn(...args);
  } catch (error) {
    logger.error(`Error en comando:`, error);
    // Enviar mensaje de error amigable al usuario
    await sendMessage(args[0].chat, 
      "❌ Ocurrió un error al procesar tu comando.\nIntenta de nuevo en unos segundos."
    );
  }
}
```

### Operaciones Asíncronas

```javascript
// Todas las operaciones deben ser async/await
async function processMessage(message) {
  // Operaciones paralelas cuando sea posible
  const [user, groupConfig] = await Promise.all([
    getUser(message.sender),
    getGroupConfig(message.chat)
  ]);
  
  // Operaciones secuenciales cuando dependan una de otra
  await updateMessageCount(user.id);
  const newBalance = await checkPendingPayment(user.id);
  
  if (newBalance > 0) {
    await notifyPayment(message.chat, user.id, newBalance);
  }
}
```

### Rate Limiting

```javascript
// middleware/ratelimit.js
const userCooldowns = new Map();

function checkRateLimit(userId, commandName, cooldownSeconds = 3) {
  const key = `${userId}:${commandName}`;
  const now = Date.now();
  
  if (userCooldowns.has(key)) {
    const lastUsed = userCooldowns.get(key);
    const timePassed = (now - lastUsed) / 1000;
    
    if (timePassed < cooldownSeconds) {
      const remaining = Math.ceil(cooldownSeconds - timePassed);
      return { allowed: false, remaining };
    }
  }
  
  userCooldowns.set(key, now);
  return { allowed: true };
}
```

### Gestión de Conexión PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'whatsapp-bot',
    script: './index.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
```

### Logging Estructurado

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Uso
logger.info('Bot iniciado', { uptime: process.uptime() });
logger.error('Error en comando', { comando: '.rob', error: err.message });
```

### Reconexión Automática de Baileys

```javascript
// handlers/connection.js
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ['RaveHub Bot', 'Chrome', '1.0.0'],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    emitOwnEvents: true,
    getMessage: async (key) => {
      // Recuperar mensajes de la base de datos si es necesario
      return { conversation: '' };
    }
  });
  
  // Guardar credenciales cuando cambien
  sock.ev.on('creds.update', saveCreds);
  
  // Manejar actualizaciones de conexión
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      logger.info('QR Code generado');
    }
    
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      
      logger.info('Conexión cerrada', { shouldReconnect });
      
      if (shouldReconnect) {
        // Reconectar después de 5 segundos
        setTimeout(() => startBot(), 5000);
      }
    } else if (connection === 'open') {
      logger.info('Conexión establecida exitosamente');
      
      // Enviar mensaje de confirmación al bot owner
      const botNumber = sock.user.id.split(':')[0];
      await sock.sendMessage(`${botNumber}@s.whatsapp.net`, {
        text: `🤖 BOT CONECTADO EXITOSAMENTE\n\n📊 Detalles del servidor:\n━━━━━━━━━━━━━━━━━━━━━━\n🖥️ Servidor: AWS EC2\n⚡ Proceso: PM2\n🔄 Estado: ONLINE\n📶 Latencia: ${Date.now()}ms\n⏰ Conectado: ${new Date().toLocaleString()}\n💾 Memoria: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n🔥 Firebase: Conectado\n━━━━━━━━━━━━━━━━━━━━━━\n\n✅ El bot está listo para usarse.\nUsa .listgroups para ver grupos disponibles.`
      });
    }
  });
  
  return sock;
}
```

---

## Estructura de Firebase Firestore

### Colecciones Principales

```javascript
// Estructura completa de la base de datos

firestore/
├── users/
│   └── {userId}/
│       ├── id: string
│       ├── phone: string
│       ├── name: string
│       ├── joinedAt: Timestamp
│       ├── lastMessage: Timestamp
│       ├── activeDays: number
│       ├── birthday: string | null
│       ├── totalMessages: number
│       ├── wallet: number
│       ├── bank: number
│       ├── pending: number
│       ├── debt: number
│       ├── level: number
│       ├── levelName: string
│       ├── warns: Array<{motivo, admin, fecha}>
│       ├── kicks: Array<{motivo, admin, fecha}>
│       └── messages/ (subcolección)
│           └── {messageId}/
│               ├── content: string
│               ├── timestamp: Timestamp
│               ├── mentions: Array<string>
│               └── repliedTo: string | null
│
├── groups/
│   └── {groupId}/
│       ├── active: boolean
│       ├── name: string
│       ├── participants: number
│       ├── activatedAt: Timestamp
│       ├── deactivatedAt: Timestamp | null
│       ├── settings/
│       │   ├── welcome/
│       │   │   ├── enabled: boolean
│       │   │   ├── message: string
│       │   │   └── imageUrl: string | null
│       │   ├── farewell/
│       │   │   ├── enabled: boolean
│       │   │   └── message: string
│       │   └── antilink: boolean
│       ├── premiumUsers: Array<string>
│       ├── members/ (subcolección)
│       │   └── {userId}/
│       │       ├── joinedAt: Timestamp
│       │       ├── isAdmin: boolean
│       │       └── isPremium: boolean
│       └── economy/ (subcolección)
│           └── {userId}/
│               ├── messages: number
│               ├── wallet: number
│               └── bank: number
│
├── shop/
│   └── inventory/
│       └── items: Array<{
│           id: number,
│           name: string,
│           description: string,
│           price: number,
│           category: string,
│           available: boolean,
│           stock: number
│       }>
│
└── orders/
    └── {orderId}/
        ├── orderId: string
        ├── userId: string
        ├── userName: string
        ├── userPhone: string
        ├── itemId: number
        ├── itemName: string
        ├── price: number
        ├── status: string (PENDING|DELIVERED|REJECTED)
        ├── createdAt: Timestamp
        ├── deliveredAt: Timestamp | null
        ├── rejectedAt: Timestamp | null
        ├── handledBy: string | null
        └── groupId: string
```

---

## Flujo Completo de Mensaje

### Diagrama de Flujo

```
1. Usuario envía mensaje en grupo
   ↓
2. Verificar si grupo está activo (Firestore)
   ↓ No → Ignorar
   ↓ Sí
3. Verificar si usuario existe en BD
   ↓ No → Crear usuario con datos iniciales
   ↓ Sí → Continuar
4. Actualizar contador de mensajes
   ↓
5. Guardar mensaje en subcolección
   ↓
6. Actualizar pending (+$0.01)
   ↓
7. ¿pending >= $0.50?
   ↓ Sí → Transferir a wallet y notificar
   ↓ No → Continuar
8. ¿El usuario tiene deuda?
   ↓ Sí → Pagar deuda con pending
   ↓ No → Continuar
9. Recalcular nivel basado en patrimonio
   ↓
10. ¿Cambió de nivel?
    ↓ Sí → Notificar subida/bajada
    ↓ No → Continuar
11. ¿Es un comando?
    ↓ No → Fin
    ↓ Sí
12. Validar permisos del usuario
    ↓ Sin permiso → Responder error
    ↓ Con permiso
13. Verificar rate limit
    ↓ Excedido → Responder cooldown
    ↓ Ok
14. Ejecutar comando de forma asíncrona
    ↓
15. Manejar errores si ocurren
    ↓
16. Enviar respuesta al usuario
    ↓
17. Fin
```

### Pseudo-código del Handler Principal

```javascript
// handlers/messages.js
async function handleIncomingMessage(sock, message) {
  try {
    // 1. Validaciones básicas
    if (!message.message) return;
    if (message.key.fromMe && !message.key.remoteJid.endsWith('@g.us')) return;
    
    const isGroup = message.key.remoteJid.endsWith('@g.us');
    if (!isGroup) return; // Solo procesar grupos
    
    // 2. Extraer información
    const groupId = message.key.remoteJid;
    const userId = message.key.participant || message.key.remoteJid;
    const messageText = extractMessageText(message);
    
    // 3. Verificar grupo activo
    const groupConfig = await getGroupConfig(groupId);
    if (!groupConfig?.active) return;
    
    // 4. Verificar/Crear usuario
    let user = await getUser(userId);
    if (!user) {
      user = await createUser(userId, message);
    }
    
    // 5. Actualizar estadísticas
    await updateUserStats(userId, messageText, message);
    
    // 6. Sistema económico
    await processEconomy(userId);
    
    // 7. Sistema de niveles
    await processLevelSystem(userId, groupId);
    
    // 8. Verificar si es comando
    if (!messageText.startsWith('.')) return;
    
    const [commandName, ...args] = messageText.slice(1).split(' ');
    
    // 9. Validar permisos
    const hasPermission = await checkPermission(userId, groupId, commandName);
    if (!hasPermission) {
      await sock.sendMessage(groupId, {
        text: '❌ No tienes permiso para este comando.',
        quoted: message
      });
      return;
    }
    
    // 10. Rate limiting
    const rateLimit = checkRateLimit(userId, commandName);
    if (!rateLimit.allowed) {
      await sock.sendMessage(groupId, {
        text: `⏱️ Espera ${rateLimit.remaining}s antes de usar este comando.`,
        quoted: message
      });
      return;
    }
    
    // 11. Ejecutar comando
    await executeCommand(sock, message, commandName, args);
    
  } catch (error) {
    logger.error('Error procesando mensaje:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: '❌ Ocurrió un error inesperado. Intenta de nuevo.',
      quoted: message
    });
  }
}
```

---

## Comandos de Referencia Rápida

### Tabla de Comandos

| Comando | Permisos | Descripción | Ejemplo |
|---------|----------|-------------|---------|
| `.ping` | Bot, Admins | Verifica latencia del bot | `.ping` |
| `.listgroups` | Bot (DM) | Lista grupos disponibles | `.listgroups` |
| `.bot on <id>` | Bot (DM) | Activa bot en grupo | `.bot on 120363025@g.us` |
| `.bot off <id>` | Bot (DM) | Desactiva bot en grupo | `.bot off 120363025@g.us` |
| `.me` | Todos | Muestra perfil propio | `.me` |
| `.info @user` | Todos | Muestra perfil de usuario | `.info @51987654321` |
| `.rob @user` | Nivel 2+ | Intenta robar dinero | `.rob @usuario` |
| `.deposit <cant>` | Todos | Deposita dinero en banco | `.deposit 10` o `.dep all` |
| `.withdraw <cant>` | Todos | Retira dinero del banco | `.withdraw 5` |
| `.shop` | Todos | Muestra tienda | `.shop` |
| `.buy <num>` | Todos | Compra item de tienda | `.buy 1` |
| `.requests` | Admins | Lista pedidos pendientes | `.requests` |
| `.deliver <id>` | Admins | Marca pedido entregado | `.deliver ORD-001` |
| `.reject <id>` | Admins | Rechaza y reembolsa pedido | `.reject ORD-002` |
| `.welcome on` | Admins | Activa bienvenidas | `.welcome on` |
| `.welcome off` | Admins | Desactiva bienvenidas | `.welcome off` |
| `.welcome message` | Admins | Configura mensaje | `.welcome message Hola {user}!` |
| `.warn @user` | Admins | Advierte a usuario | `.warn @user Spam` |
| `.kick @user` | Admins | Expulsa usuario | `.kick @user Tóxico` |
| `.slot <cant>` | Todos | Juego tragamonedas | `.slot 10` |
| `.flip <cant> <opción>` | Todos | Juego cara o cruz | `.flip 5 cara` |
| `.dice <cant> <opción>` | Todos | Juego de dados | `.dice 20 mas` |

---

## Consideraciones de Seguridad

### Variables de Entorno (.env)

```env
# Firebase
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tu-proyecto.iam.gserviceaccount.com

# Bot Configuration
BOT_NAME=RaveHub Bot
BOT_PREFIX=.
BOT_OWNER=51999111222

# AWS
AWS_REGION=us-east-1

# Environment
NODE_ENV=production
PORT=3000
```

### Protección de Datos Sensibles

```javascript
// No almacenar mensajes completos indefinidamente
// Implementar limpieza automática de mensajes antiguos
async function cleanOldMessages() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Eliminar mensajes mayores a 30 días
  await db.collectionGroup('messages')
    .where('timestamp', '<', thirtyDaysAgo)
    .get()
    .then(snapshot => {
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      return batch.commit();
    });
}

// Ejecutar diariamente
setInterval(cleanOldMessages, 24 * 60 * 60 * 1000);
```

### Rate Limiting Global

```javascript
// Prevenir abuso del bot
const globalRateLimit = new Map();

function checkGlobalRateLimit(groupId) {
  const now = Date.now();
  const windowMs = 60000; // 1 minuto
  const maxRequests = 30; // 30 comandos por minuto por grupo
  
  if (!globalRateLimit.has(groupId)) {
    globalRateLimit.set(groupId, []);
  }
  
  const requests = globalRateLimit.get(groupId);
  const recentRequests = requests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return { allowed: false, resetIn: Math.ceil((windowMs - (now - recentRequests[0])) / 1000) };
  }
  
  recentRequests.push(now);
  globalRateLimit.set(groupId, recentRequests);
  
  return { allowed: true };
}
```

---

## Monitoreo y Mantenimiento

### Health Check Endpoint

```javascript
// index.js
const express = require('express');
const app = express();

app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    status: 'OK',
    timestamp: Date.now(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    },
    bot: {
      connected: sock?.user ? true : false,
      user: sock?.user?.id || null
    }
  };
  
  res.json(health);
});

app.listen(process.env.PORT || 3000);
```

### Comandos PM2 Útiles

```bash
# Iniciar bot
pm2 start ecosystem.config.js

# Ver logs en tiempo real
pm2 logs whatsapp-bot

# Reiniciar bot
pm2 restart whatsapp-bot

# Detener bot
pm2 stop whatsapp-bot

# Ver estado
pm2 status

# Monitorear recursos
pm2 monit

# Guardar configuración actual
pm2 save

# Configurar inicio automático en boot
pm2 startup
```

---

## Resumen de Funcionalidades

✅ **Conexión y Autenticación**
- QR Code para vincular dispositivo
- Reconexión automática
- Sesión persistente
- Notificación de conexión exitosa al DM del bot

✅ **Gestión de Grupos**
- Activación/desactivación por grupo
- Lista de grupos disponibles
- Configuración independiente por grupo

✅ **Sistema de Usuarios**
- Registro automático en primera interacción
- Tracking completo de mensajes y menciones
- Historial de warns y kicks
- Perfil consultable

✅ **Sistema Económico**
- Ganancia por mensajes ($0.01/mensaje)
- Pago diferido cada $0.50
- Sistema bancario (wallet + bank)
- Protección contra robos (dinero en banco)

✅ **Sistema de Niveles**
- 11 niveles basados en patrimonio neto
- Notificaciones de subida/bajada
- Nombres temáticos de festival

✅ **Sistema de Robos**
- Probabilidades realistas
- Multas por fallos
- Sistema de deudas
- Solo afecta dinero en efectivo

✅ **Tienda y Pedidos**
- Inventario configurable
- Sistema de IDs únicos para pedidos
- Gestión de pedidos por admins
- Reembolsos automáticos

✅ **Sistema de Bienvenidas**
- Mensajes personalizables
- Placeholders dinámicos
- Soporte para imágenes
- Activación/desactivación por grupo

✅ **Moderación**
- Warns acumulativos (3 = expulsión)
- Kicks con registro
- Detección inteligente de objetivo y motivo
- Respuestas a mensajes para sancionar

✅ **Juegos de Casino**
- Tragamonedas con animación
- Cara o cruz
- Dados (high/low)
- Validaciones de fondos
- Comisión de la casa

✅ **Seguridad y Estabilidad**
- Manejo global de errores
- Operaciones 100% asíncronas
- Rate limiting por usuario y grupo
- Reconexión automática
- PM2 para alta disponibilidad
- Logs estructurados

---

## Referencias y Documentación

### Baileys
- **Documentación oficial:** https://baileys.wiki/docs/intro/
- **Repositorio GitHub:** https://github.com/WhiskeySockets/Baileys
- **Ejemplo de bot:** https://github.com/lyfe00011/levanter

### Firebase
- **Documentación:** https://firebase.google.com/docs
- **Firestore:** https://firebase.google.com/docs/firestore
- **Admin SDK:** https://firebase.google.com/docs/admin/setup

### Node.js
- **Versión requerida:** 17+
- **Async/Await:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
- **Event Emitters:** https://nodejs.org/api/events.html

### PM2
- **Documentación:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **Ecosystem File:** https://pm2.keymetrics.io/docs/usage/application-declaration/

---

# Ejemplos de Uso Completos - Bot WhatsApp RaveHub

## Índice de Comandos
1. [Comandos de Administración del Bot](#comandos-de-administración-del-bot)
2. [Comandos de Información de Usuario](#comandos-de-información-de-usuario)
3. [Comandos Económicos](#comandos-económicos)
4. [Sistema de Robos](#sistema-de-robos)
5. [Sistema de Tienda](#sistema-de-tienda)
6. [Gestión de Pedidos (Admins)](#gestión-de-pedidos-admins)
7. [Sistema de Bienvenidas](#sistema-de-bienvenidas)
8. [Comandos de Moderación](#comandos-de-moderación)
9. [Juegos de Casino](#juegos-de-casino)

---

## Comandos de Administración del Bot

### 1. `.ping` - Verificar Estado del Bot

**Contexto:** Admin quiere verificar si el bot está respondiendo correctamente.

**Entrada del Usuario:**
```
Admin: .ping
```

**Respuesta del Bot:**
```
🏓 PONG!

⚡ Latencia: 42ms
🖥️ Servidor: AWS EC2 (us-east-1)
🔥 Firebase: 18ms
💚 Estado: ONLINE
⏰ Uptime: 12h 34m 18s
💾 Memoria: 156MB / 1GB
🔄 CPU: 12%
📊 Comandos procesados: 1,247
```

**Caso 2: Bot con problemas de latencia**
```
Admin: .ping

Bot responde:
🏓 PONG!

⚡ Latencia: 892ms ⚠️
🖥️ Servidor: AWS EC2
🔥 Firebase: 421ms ⚠️
💛 Estado: DEGRADADO
⏰ Uptime: 2h 15m 03s
💾 Memoria: 456MB / 1GB
━━━━━━━━━━━━━━━━━━━━━━
⚠️ Alta latencia detectada
```

---

### 2. `.listgroups` - Listar Grupos Disponibles

**Contexto:** El bot (en su propio DM) quiere ver en qué grupos está presente.

**Entrada del Usuario (Bot):**
```
Bot (en su DM): .listgroups
```

**Respuesta del Bot:**
```
📋 GRUPOS DISPONIBLES

━━━━━━━━━━━━━━━━━━━━━━
1️⃣ RaveHub Community
📌 ID: 120363025@g.us
👥 Participantes: 247
🤖 Estado: ❌ INACTIVO
📅 Creado: 15/08/2024
━━━━━━━━━━━━━━━━━━━━━━
2️⃣ Festival Squad 2024
📌 ID: 120363189@g.us
👥 Participantes: 89
🤖 Estado: ✅ ACTIVO
📅 Activado: 20/12/2024
━━━━━━━━━━━━━━━━━━━━━━
3️⃣ Techno Lovers Chile
📌 ID: 120363267@g.us
👥 Participantes: 156
🤖 Estado: ❌ INACTIVO
📅 Creado: 03/11/2024
━━━━━━━━━━━━━━━━━━━━━━
4️⃣ EDM Santiago
📌 ID: 120363342@g.us
👥 Participantes: 312
🤖 Estado: ✅ ACTIVO
📅 Activado: 18/12/2024
━━━━━━━━━━━━━━━━━━━━━━

📊 Total: 4 grupos
✅ Activos: 2
❌ Inactivos: 2

💡 Usa: .bot on <ID> para activar
💡 Usa: .bot off <ID> para desactivar
```

**Alias del comando:**
```
Bot: .listargrupos
Bot: .grupos
```

---

### 3. `.bot on <id_grupo>` - Activar Bot en Grupo

**Contexto:** El bot necesita activarse en un grupo específico.

**Entrada del Usuario (Bot en su DM):**
```
Bot: .bot on 120363025@g.us
```

**Respuesta del Bot (Mensaje con animación):**

**Paso 1 (Inmediato):**
```
🔄 ACTIVANDO BOT

📍 Grupo: RaveHub Community
🆔 ID: 120363025@g.us
━━━━━━━━━━━━━━━━━━━━━━
Iniciando sistema...
```

**Paso 2 (Edición cada 500ms):**
```
⏳ Cargando sistema... [██░░░░░░░░] 10%
```

```
⏳ Cargando sistema... [████░░░░░░] 30%
```

```
⏳ Cargando sistema... [██████░░░░] 60%
```

```
⏳ Cargando sistema... [████████░░] 80%
```

```
⏳ Cargando sistema... [██████████] 100%
```

**Paso 3 (Mensaje final):**
```
✅ BOT ACTIVADO EXITOSAMENTE

━━━━━━━━━━━━━━━━━━━━━━
📍 Grupo: RaveHub Community
🆔 ID: 120363025@g.us
👥 Participantes: 247
⏰ Activado: 24/12/2024 - 15:45:30
🔧 Sistema: v1.0.0
━━━━━━━━━━━━━━━━━━━━━━

✅ El bot ya puede responder comandos en este grupo.

💡 Los admins pueden configurar:
• .welcome on - Bienvenidas
• .warn @user - Sistema de advertencias
• .requests - Ver pedidos
```

**Caso de Error - Grupo No Existe:**
```
Bot: .bot on 999999999@g.us

Respuesta:
❌ ERROR

No se encontró el grupo con ID: 999999999@g.us

💡 Usa .listgroups para ver grupos disponibles
```

**Caso de Error - Grupo Ya Activo:**
```
Bot: .bot on 120363189@g.us

Respuesta:
⚠️ GRUPO YA ACTIVO

📍 Grupo: Festival Squad 2024
🆔 ID: 120363189@g.us
━━━━━━━━━━━━━━━━━━━━━━
Este grupo ya está activo desde:
⏰ 20/12/2024 - 10:30:15

💡 Usa .bot off <ID> para desactivar
```

**Alias del comando:**
```
Bot: .activar 120363025@g.us
Bot: .enable 120363025@g.us
```

---

### 4. `.bot off <id_grupo>` - Desactivar Bot en Grupo

**Contexto:** Necesitas desactivar el bot en un grupo específico.

**Entrada del Usuario (Bot en su DM):**
```
Bot: .bot off 120363189@g.us
```

**Respuesta del Bot:**
```
🔴 BOT DESACTIVADO

━━━━━━━━━━━━━━━━━━━━━━
📍 Grupo: Festival Squad 2024
🆔 ID: 120363189@g.us
👥 Participantes: 89
⏰ Desactivado: 24/12/2024 - 16:20:15
━━━━━━━━━━━━━━━━━━━━━━

❌ El bot ignorará todos los comandos en este grupo hasta que sea reactivado.

📊 Estadísticas finales:
• Comandos procesados: 1,458
• Tiempo activo: 4 días
• Usuarios registrados: 67

💡 Usa .bot on <ID> para reactivar cuando lo necesites
```

**Caso de Error - Grupo Ya Inactivo:**
```
Bot: .bot off 120363025@g.us

Respuesta:
⚠️ GRUPO YA INACTIVO

📍 Grupo: RaveHub Community
Este grupo ya está desactivado.

💡 Usa .bot on <ID> para activar
```

**Alias del comando:**
```
Bot: .desactivar 120363189@g.us
Bot: .disable 120363189@g.us
```

---

## Comandos de Información de Usuario

### 5. `.me` - Ver Mi Perfil

**Contexto:** Usuario quiere ver su propia información.

**Entrada del Usuario:**
```
Diego: .me
```

**Respuesta del Bot:**
```
👤 PERFIL DE USUARIO

━━━━━━━━━━━━━━━━━━━━━━
📛 Nombre: Diego Ramírez
📞 Teléfono: +51 987 654 321
🆔 ID: 51987654321
📅 Miembro desde: 15/08/2024
━━━━━━━━━━━━━━━━━━━━━━

💰 ECONOMÍA
💵 Efectivo: $12.45
🏦 Banco: $87.30
💎 Patrimonio Total: $99.75
📊 Pendiente: $0.35

━━━━━━━━━━━━━━━━━━━━━━

📊 ESTADÍSTICAS
✉️ Mensajes enviados: 2,473
📈 Mensajes hoy: 47
🎂 Cumpleaños: 15/08
📅 Días activo: 127 días
⏰ Último mensaje: Hace 3 minutos
🔥 Racha: 12 días consecutivos

━━━━━━━━━━━━━━━━━━━━━━

🎯 NIVEL
🔰 Nivel 10: Booth
🎵 "En la cabina, al lado del DJ"
📈 Progreso: ████████░░ 97%
💰 Próximo nivel (Headliner): $0.25 más

━━━━━━━━━━━━━━━━━━━━━━

⚠️ INFRACCIONES
Advertencias: 1/3
Expulsiones: 0

💡 Historial de warns:
  • 20/12/2024: "Spam en el chat" por @Admin

━━━━━━━━━━━━━━━━━━━━━━

🎮 JUEGOS
🎰 Slots jugados: 23
🪙 Coinflips: 15
🎲 Dados: 8
💰 Ganado total: $45.80
📉 Perdido total: $38.20
📈 Balance: +$7.60
```

**Caso - Usuario Nuevo (Sin Estadísticas):**
```
NuevoUsuario: .me

Respuesta:
👤 PERFIL DE USUARIO

━━━━━━━━━━━━━━━━━━━━━━
📛 Nombre: Carlos Nuevo
📞 Teléfono: +51 912 345 678
🆔 ID: 51912345678
📅 Miembro desde: Hoy
━━━━━━━━━━━━━━━━━━━━━━

💰 ECONOMÍA
💵 Efectivo: $0.01
🏦 Banco: $0.00
💎 Patrimonio Total: $0.01
📊 Pendiente: $0.01

━━━━━━━━━━━━━━━━━━━━━━

📊 ESTADÍSTICAS
✉️ Mensajes enviados: 1
📈 Mensajes hoy: 1
🎂 Cumpleaños: No configurado
📅 Días activo: 1 día
⏰ Último mensaje: Hace 10 segundos

━━━━━━━━━━━━━━━━━━━━━━

🎯 NIVEL
🔰 Nivel 1: Youtube
📺 "Lo ves desde tu casa, no te alcanzó"
📈 Progreso: ░░░░░░░░░░ 0.1%
💰 Próximo nivel (Vereda): $9.99 más

━━━━━━━━━━━━━━━━━━━━━━

⚠️ INFRACCIONES
Sin infracciones ✅

━━━━━━━━━━━━━━━━━━━━━━

🎮 JUEGOS
No has jugado aún.

💡 Envía más mensajes para ganar dinero
💡 Usa .deposit para proteger tu efectivo
```

**Alias del comando:**
```
Usuario: .perfil
Usuario: .yo
Usuario: .stats
```

---

### 6. `.info @usuario` - Ver Perfil de Otro Usuario

**Contexto:** Usuario quiere ver información de otro miembro del grupo.

**Entrada del Usuario:**
```
Diego: .info @51912345678
```

**Respuesta del Bot (Usuario Existe):**
```
👤 PERFIL DE @CarlosMendez

━━━━━━━━━━━━━━━━━━━━━━
📛 Nombre: Carlos Mendez
📞 Teléfono: +51 912 345 678
🆔 ID: 51912345678
📅 Miembro desde: 10/11/2024
━━━━━━━━━━━━━━━━━━━━━━

💰 ECONOMÍA
💵 Efectivo: $3.20
🏦 Banco: $45.80
💎 Patrimonio Total: $49.00
📊 Pendiente: $0.18

━━━━━━━━━━━━━━━━━━━━━━

📊 ESTADÍSTICAS
✉️ Mensajes enviados: 838
📈 Mensajes hoy: 12
🎂 Cumpleaños: 23/03
📅 Días activo: 45 días
⏰ Último mensaje: Hace 1 hora
🔥 Racha: 8 días consecutivos

━━━━━━━━━━━━━━━━━━━━━━

🎯 NIVEL
🔰 Nivel 5: General
🎸 "En el pogo, apretado y sudando"
📈 Progreso: ████░░░░░░ 45%
💰 Próximo nivel (Preferencial): $1.00 más

━━━━━━━━━━━━━━━━━━━━━━

⚠️ INFRACCIONES
Advertencias: 0/3
Expulsiones: 0

Sin infracciones ✅

━━━━━━━━━━━━━━━━━━━━━━

🎮 JUEGOS
🎰 Slots jugados: 8
🪙 Coinflips: 5
🎲 Dados: 3
💰 Balance: +$2.10
```

**Caso - Usuario NO Existe en BD:**
```
Diego: .info @51998765432

Respuesta:
❌ USUARIO NO REGISTRADO

━━━━━━━━━━━━━━━━━━━━━━
@Usuario aún no ha interactuado en este grupo.

Para que un usuario aparezca en el sistema debe:
✉️ Enviar al menos 1 mensaje en el grupo

💡 Una vez que participe, podrás consultar su perfil.
```

**Caso - Usuario Mencionado Nunca Ha Hablado:**
```
Diego: .info @51999888777

Respuesta:
❌ USUARIO NO ENCONTRADO

El usuario mencionado (@51999888777) no está registrado en la base de datos.

Posibles razones:
• Nunca ha enviado mensajes
• No es miembro del grupo
• Número incorrecto

💡 Verifica el número e intenta nuevamente
```

**Alias del comando:**
```
Usuario: .perfil @usuario
Usuario: .ver @usuario
Usuario: .check @usuario
```

---

## Comandos Económicos

### 7. `.deposit <cantidad>` - Depositar Dinero en Banco

**Contexto:** Usuario quiere proteger su dinero guardándolo en el banco.

**Entrada del Usuario:**
```
Diego: .deposit 10.50
```

**Respuesta del Bot:**
```
💳 DEPÓSITO EXITOSO

━━━━━━━━━━━━━━━━━━━━━━
💵 Cantidad depositada: $10.50
━━━━━━━━━━━━━━━━━━━━━━

📊 MOVIMIENTO BANCARIO:
🏦 Banco: $87.30 → $97.80
💰 Efectivo: $12.45 → $1.95

━━━━━━━━━━━━━━━━━━━━━━
💎 Patrimonio Total: $99.75
✅ Tu dinero está protegido y no puede ser robado.

💡 Usa .withdraw <cantidad> para retirar cuando lo necesites
```

**Caso - Depositar TODO:**
```
Diego: .dep all

Respuesta:
💳 DEPÓSITO COMPLETO

━━━━━━━━━━━━━━━━━━━━━━
💵 Cantidad depositada: $12.45
━━━━━━━━━━━━━━━━━━━━━━

📊 MOVIMIENTO BANCARIO:
🏦 Banco: $87.30 → $99.75
💰 Efectivo: $12.45 → $0.00

━━━━━━━━━━━━━━━━━━━━━━
💎 Patrimonio Total: $99.75
✅ Todo tu dinero está protegido.

⚠️ Sin efectivo, no podrás:
• Jugar en el casino
• Ser robado (ventaja)
```

**Caso - Depositar más de lo que tiene:**
```
Diego: .deposit 50.00

Respuesta:
❌ FONDOS INSUFICIENTES

━━━━━━━━━━━━━━━━━━━━━━
Intentaste depositar: $50.00
💰 Tu efectivo actual: $12.45
━━━━━━━━━━━━━━━━━━━━━━

❌ No tienes suficiente dinero en efectivo.

💡 Puedes depositar máximo: $12.45
💡 Usa: .deposit all para depositar todo
```

**Caso - Sin efectivo:**
```
Diego: .deposit 5.00

Respuesta:
❌ SIN EFECTIVO

━━━━━━━━━━━━━━━━━━━━━━
💰 Tu efectivo actual: $0.00
🏦 Tu banco actual: $99.75
━━━━━━━━━━━━━━━━━━━━━━

No tienes dinero en efectivo para depositar.

💡 Tu dinero ya está seguro en el banco.
```

**Alias del comando:**
```
Usuario: .depositar 10
Usuario: .dep 10
Usuario: .dep all
Usuario: .depositar todo
Usuario: .guardar 10
```

---

### 8. `.withdraw <cantidad>` - Retirar Dinero del Banco

**Contexto:** Usuario necesita efectivo para jugar o hacer transacciones.

**Entrada del Usuario:**
```
Diego: .withdraw 20.00
```

**Respuesta del Bot:**
```
🏧 RETIRO EXITOSO

━━━━━━━━━━━━━━━━━━━━━━
💵 Cantidad retirada: $20.00
━━━━━━━━━━━━━━━━━━━━━━

📊 MOVIMIENTO BANCARIO:
🏦 Banco: $97.80 → $77.80
💰 Efectivo: $1.95 → $21.95

━━━━━━━━━━━━━━━━━━━━━━
💎 Patrimonio Total: $99.75

⚠️ ADVERTENCIA:
El efectivo puede ser robado por otros usuarios.
💡 Usa .deposit para volver a guardarlo cuando termines.
```

**Caso - Retirar TODO:**
```
Diego: .withdraw all

Respuesta:
🏧 RETIRO COMPLETO

━━━━━━━━━━━━━━━━━━━━━━
💵 Cantidad retirada: $97.80
━━━━━━━━━━━━━━━━━━━━━━

📊 MOVIMIENTO BANCARIO:
🏦 Banco: $97.80 → $0.00
💰 Efectivo: $1.95 → $99.75

━━━━━━━━━━━━━━━━━━━━━━
💎 Patrimonio Total: $99.75

⚠️ RIESGO ALTO:
Todo tu dinero está en efectivo y vulnerable a robos.

💡 Deposita lo que no uses con .deposit <cantidad>
```

**Caso - Intentar retirar más de lo que tiene:**
```
Diego: .withdraw 150.00

Respuesta:
❌ FONDOS INSUFICIENTES

━━━━━━━━━━━━━━━━━━━━━━
Intentaste retirar: $150.00
🏦 Tu banco actual: $97.80
━━━━━━━━━━━━━━━━━━━━━━

❌ No tienes suficiente dinero en el banco.

💡 Puedes retirar máximo: $97.80
💡 Usa: .withdraw all para retirar todo
```

**Caso - Sin dinero en banco:**
```
Diego: .withdraw 10.00

Respuesta:
❌ BANCO VACÍO

━━━━━━━━━━━━━━━━━━━━━━
🏦 Tu banco actual: $0.00
💰 Tu efectivo actual: $12.45
━━━━━━━━━━━━━━━━━━━━━━

No tienes dinero en el banco para retirar.

💡 Tu dinero ya está disponible en efectivo.
💡 Envía mensajes para ganar más dinero.
```

**Alias del comando:**
```
Usuario: .retirar 20
Usuario: .sacar 20
Usuario: .withdraw all
Usuario: .retirar todo
```

---

## Sistema de Robos

### 9. `.rob @usuario` - Intentar Robar Dinero

**Contexto:** Usuario nivel 2+ intenta robar efectivo de otro usuario.

**Caso 1: Robo Exitoso - Cantidad Baja (1-10%)**
```
Ladrón: .rob @51987654321

[Sistema calcula]
- Víctima tiene: $15.00 en wallet
- Probabilidad: 30% → Éxito ✓
- Cantidad robada: $1.20 (8%)

Respuesta:
🥷 ROBO CASI FRUSTRADO

━━━━━━━━━━━━━━━━━━━━━━
Robaste $1.20 (8%) a @Diego
━━━━━━━━━━━━━━━━━━━━━━

💰 TU EFECTIVO:
$5.00 → $6.20

😰 ¡ESE FUE UN ROBO NOVATO!
Por poco te atrapan. La próxima podrías no tener tanta suerte.

💡 @Diego deposita tu dinero con .deposit
```

**Caso 2: Robo Exitoso - Cantidad Media (20-50%)**
```
Ladrón: .rob @51987654321

[Sistema]
- Víctima: $15.00
- Robado: $5.25 (35%)

Respuesta:
💰 BUEN ROBO

━━━━━━━━━━━━━━━━━━━━━━
Robaste $5.25 (35%) a @Diego
━━━━━━━━━━━━━━━━━━━━━━

💵 TU EFECTIVO:
$5.00 → $10.25

👍 Robo decente, nada mal.
Has demostrado habilidad.

💡 Deposita tus ganancias con .deposit
```

**Caso 3: Robo Exitoso - Cantidad Alta (50-90%)**
```
Ladrón: .rob @51987654321

[Sistema]
- Víctima: $15.00
- Robado: $11.25 (75%)

Respuesta:
💎 ¡ROBO ESPECTACULAR!

━━━━━━━━━━━━━━━━━━━━━━
Robaste $11.25 (75%) a @Diego
━━━━━━━━━━━━━━━━━━━━━━

💰 TU EFECTIVO:
$5.00 → $16.25

🔥 ¡ROBO MAESTRO!
Has dejado a tu víctima casi en la ruina.

⚠️ @Diego: Te robaron casi todo tu efectivo!
💡 Protege tu dinero con .deposit
```

**Caso 4: Robo PERFECTO (100%)**
```
Ladrón: .rob @51987654321

[Sistema]
- Víctima: $15.00
- Robado: $15.00 (100%)

Respuesta:
🎉 ¡¡¡ROBO PERFECTO!!!

━━━━━━━━━━━━━━━━━━━━━━
💎 ERES UN MAESTRO DEL CRIMEN 💎
━━━━━━━━━━━━━━━━━━━━━━

Robaste $15.00 (100%) a @Diego

💀 DEJASTE EN BANCA ROTA A @Diego

💰 TU EFECTIVO:
$5.00 → $20.00

━━━━━━━━━━━━━━━━━━━━━━

🏆 ROBO LEGENDARIO
Has robado TODO el efectivo de tu víctima.
Eres una leyenda del crimen.

⚠️ @Diego: Fuiste víctima de un robo perfecto!
Tu efectivo: $15.00 → $0.00
💡 Recupera dinero enviando mensajes.
```

**Caso 5: Robo Fallido - Multa Pagable**
```
Ladrón: .rob @51987654321

[Sistema]
- Probabilidad: 50% → Fallo ❌
- Multa: $3.00
- Ladrón tiene: wallet $2.00, bank $8.00

Respuesta:
🚨 ROBO FALLIDO

━━━━━━━━━━━━━━━━━━━━━━
❌ TE ATRAPÓ LA POLICÍA
━━━━━━━━━━━━━━━━━━━━━━

💸 Multa: $3.00 pagados a @Diego por daños y perjuicios

📊 INTERVENCIÓN FINANCIERA:
Tu efectivo: $2.00 → $0.00
Tu banco: $8.00 → $7.00

━━━━━━━━━━━━━━━━━━━━━━

⚖️ Se tomó dinero de tu efectivo y banco.

✅ @Diego recibió $3.00 como compensación:
Efectivo: $15.00 → $18.00
```

**Caso 6: Robo Fallido - Deuda Generada**
```
Ladrón: .rob @51987654321

[Sistema]
- Multa: $12.00
- Ladrón tiene: wallet $1.50, bank $4.00
- Total disponible: $5.50
- Deuda generada: -$6.50

Respuesta:
🚨 ROBO FALLIDO - DEUDA GENERADA

━━━━━━━━━━━━━━━━━━━━━━
❌ TE ATRAPÓ LA POLICÍA
━━━━━━━━━━━━━━━━━━━━━━

💸 Multa total: $12.00 a @Diego

📊 INTERVENCIÓN BANCARIA COMPLETA:
Tu efectivo: $1.50 → $0.00
Tu banco: $4.00 → $0.00
💳 Deuda pendiente: -$6.50

━━━━━━━━━━━━━━━━━━━━━━

⚠️ NO PUDISTE PAGAR LA MULTA COMPLETA

🔒 CONSECUENCIAS:
• Tus próximos mensajes pagarán esta deuda
• No recibirás dinero hasta saldar: $6.50
• Cada mensaje pagará $0.01 de tu deuda

✅ @Diego recibió $5.50 (resto pendiente de pago)
Efectivo: $15.00 → $20.50

━━━━━━━━━━━━━━━━━━━━━━

💡 Envía 650 mensajes para pagar tu deuda completa.
```

**Caso 7: Víctima Sin Dinero**
```
Ladrón: .rob @51912345678

[Sistema]
- Víctima wallet: $0.00

Respuesta:
💼 VÍCTIMA SIN EFECTIVO

━━━━━━━━━━━━━━━━━━━━━━
@Carlos no tiene dinero en efectivo.
━━━━━━━━━━━━━━━━━━━━━━

No hay nada que robar.

💡 Solo puedes robar dinero en efectivo (wallet).
El dinero en banco está protegido.
```

**Caso 8: Ladrón Sin Permisos (Nivel 1)**
```
UsuarioNivel1: .rob @51987654321

Respuesta:
❌ NIVEL INSUFICIENTE
....