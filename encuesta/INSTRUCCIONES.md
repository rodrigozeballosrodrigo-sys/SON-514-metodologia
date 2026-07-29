# Encuesta diagnóstica SON-514 — puesta en marcha

## Qué es

Archivo único (`index.html`) con dos vistas:
- **`#docente`** — panel de control + pantalla de proyección con los globos.
- **`#responder`** — formulario para el teléfono del estudiante.

Funciona en **PC, tablet y teléfono**. En pantallas menores a 1024 px el panel del docente
se convierte en un cajón lateral que se abre con el botón ☰.

## Probarlo ahora mismo (sin configurar nada)

Abrí `index.html` con doble clic. Arranca en **modo local**: sincroniza entre pestañas del
mismo navegador. Sirve para ensayar el flujo completo antes de la clase.

Abrí dos ventanas: una en `#docente` y otra en `#responder`, y probá lanzar preguntas.

> El indicador abajo a la izquierda dice **“modo local”** en amarillo cuando no hay Firebase,
> y **“en vivo”** cuando sí lo hay.

## Ponerlo en vivo para la clase (≈ 5 min)

Para que 30 teléfonos se sincronicen con tu proyector hace falta un backend. Firebase tiene
plan gratuito de sobra para esto.

1. Entrá a <https://console.firebase.google.com> → **Agregar proyecto** (nombre: `son514`).
   Podés desactivar Google Analytics.
2. En el menú lateral: **Realtime Database** → *Crear base de datos* → elegí la región →
   **Iniciar en modo de prueba**.
3. Andá a **Configuración del proyecto** (⚙) → *Tus apps* → ícono **`</>`** (Web) →
   registrá la app. Te va a mostrar un bloque `firebaseConfig`.
4. Copiá esos valores dentro de `index.html`, en el bloque `CONFIG_FIREBASE`
   (está al principio del `<script>`, alrededor de la línea 300).

```js
const CONFIG_FIREBASE = {
  apiKey:            "AIza…",
  authDomain:        "son514.firebaseapp.com",
  databaseURL:       "https://son514-default-rtdb.firebaseio.com",
  projectId:         "son514",
  storageBucket:     "son514.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123…:web:abc…"
};
```

> **Importante:** el *modo de prueba* deja la base abierta al público y **caduca a los 30 días**.
> Para una encuesta de aula durante una clase está bien. Si la vas a reusar todo el semestre,
> en *Reglas* poné una fecha de expiración más larga.

### 5. Reglas de la base (importante si la URL es pública)

En **Realtime Database → Reglas**, reemplazá el modo de prueba por esto:

```json
{
  "rules": {
    "sesiones": {
      "$codigo": {
        ".read":  "$codigo.length >= 6",
        ".write": "$codigo.length >= 6",
        ".validate": "newData.hasChildren(['estado']) || true"
      }
    }
  }
}
```

Esto limita el acceso al subárbol `sesiones/` y exige un código de 6 caracteres
(24⁶ ≈ 191 millones de combinaciones, no se adivina por fuerza bruta). No caduca a los 30 días
como el modo de prueba.

> Aun así, **quien tenga el link con el código puede ver las respuestas**. Es aceptable para una
> encuesta de aula que dura una clase. Después de exportar el CSV, usá *Reiniciar sesión* en el
> panel para borrar los datos.

## Alojarlo en Vercel

La carpeta ya trae `vercel.json` (con `noindex` para que no lo levanten los buscadores) y
`.vercelignore` (para no publicar este instructivo).

**Configurá Firebase primero.** Si desplegás con `CONFIG_FIREBASE` vacío, la página queda en modo
local y los teléfonos de los estudiantes no van a sincronizar con tu proyector.

```bash
npx vercel login
```

Después, desde la carpeta `encuesta/`:

```bash
npx vercel --prod
```

La primera vez te va a preguntar el scope, si vincular a un proyecto existente (**no**) y el
nombre (ej. `son514-encuesta`). El directorio raíz es `./`. Te devuelve la URL de producción.

Para volver a desplegar tras cualquier cambio, alcanza con repetir `npx vercel --prod`.

### Otras opciones

| Opción | Cómo |
|---|---|
| **Netlify Drop** | <https://app.netlify.com/drop> — arrastrás la carpeta `encuesta/` |
| **GitHub Pages** | Subís el repo → *Settings → Pages* |
| **Firebase Hosting** | `npx firebase init hosting && npx firebase deploy` |

## Cómo se usa en clase

1. Abrí `#docente` en la máquina conectada al proyector.
2. Los estudiantes escanean el **QR** (o tipean la URL con el código de sesión).
3. Cada uno ve primero el **aviso ético** y debe tocar “Entendido, empezar”.
4. Vos lanzás las preguntas de a una.

**Atajos de teclado** (en la vista docente): `→` siguiente · `←` anterior · `barra espaciadora` abrir/cerrar.

**Botón “⚠ Mostrar aviso ético”** — proyecta el aviso en pantalla grande para leerlo en voz alta
al inicio, antes de la primera pregunta.

## Ritmo de las preguntas

Cada pregunta está marcada en el panel:

| Marca | Significado |
|---|---|
| ⚡ **rápida** | Se lanza, se ve el resultado y se pasa. ~25-45 s |
| 💬 **comentada** | Se detiene a discutir los globos con el curso. ~90-110 s |
| 🔒 | **No se proyecta** — la respuesta queda solo en el registro |

Son 28 preguntas (26 + 2 repreguntas condicionales) — **≈ 22 min** de reloj, más el tiempo de
discusión que decidas estirar. El panel muestra el cronómetro de la pregunta actual y se pone
ámbar cuando te pasás del tiempo sugerido.

Las 6 comentadas son: *uso de la IA*, *copiar-pegar o leer*, *concierto antes de morir*,
*área del sonido*, *por qué elegiste la carrera* y *qué querés aprender*. Son las que dan
material para la práctica del miércoles.

## Preguntas condicionales

- *¿Dónde trabajás?* y *¿ingresos?* solo aparecen a quien respondió que trabaja.
- *¿Cuál (otra profesión)?* solo a quien dijo que tiene otra.

A los demás les aparece “Esta pregunta no aplica en tu caso” y esperan la siguiente.

## Privacidad

Tres respuestas **no se proyectan nunca**: ingresos, personas a cargo y nombre. En la pantalla
grande sale un candado y solo el número de respuestas. Siguen quedando en el CSV para el
análisis del miércoles.

La pregunta de nombre va al final e incluye la casilla *“Prefiero quedar en el anonimato”*:
si la marcan, se guarda `(anónimo)` y el nombre nunca se registra.

## Taller de análisis (`analisis.html`)

Es la pieza para la **clase del miércoles** y para la Unidad 5 (análisis de datos). Se abre desde
el panel del docente (*📊 Taller de análisis*) o desde la pantalla de inicio.

**Cómo cargar los datos:** arrastrás el `.json` o `.csv` exportado, elegís una sesión guardada en
ese navegador, o generás **30 casos simulados** para ensayar antes de la clase.

### Qué hace

| Pestaña | Contenido |
|---|---|
| **Una variable** | Según el tipo: media, mediana, moda, desviación, cuartiles, coef. de variación e histograma (cuantitativas) · tabla de frecuencias con fᵢ, hᵢ y acumuladas + barras (categóricas) |
| **Cruce de dos variables** | Elige **solo** la prueba que corresponde y explica por qué |
| **¿Qué análisis corresponde?** | La tabla de decisión + qué significa realmente el valor p |

### Qué prueba elige y cuándo

| Cruce | Análisis | Fuerza del efecto |
|---|---|---|
| Categórica × Categórica | Tabla de contingencia + **chi-cuadrado** | V de Cramér |
| Categórica (2 grupos) × Cuantitativa | Medias por grupo + **t de Welch** | d de Cohen |
| Categórica (3+ grupos) × Cuantitativa | Medias por grupo + **ANOVA** | eta² |
| Cuantitativa × Cuantitativa | Dispersión + **correlación de Pearson** y recta | r y r² |

### Lo que lo hace didáctico

Cada resultado trae un desplegable **“¿cómo se calcula?”** con la fórmula y **los números reales de
esa corrida**: las frecuencias esperadas celda por celda, la descomposición de sumas de cuadrados
del ANOVA, el cálculo de r paso a paso. No es una caja negra que escupe un p.

Además **avisa cuando los supuestos no se cumplen**. Con un curso de 25-30 personas, el chi-cuadrado
casi siempre va a violar el requisito de frecuencias esperadas ≥ 5, y el tablero lo dice en vez de
mostrar un p engañoso. Eso es contenido de la materia, no una falla: aprender a decir *“con estos
datos no puedo afirmar esto”* es parte de lo que se evalúa.

### Advertencia que conviene decir en voz alta

El curso **no es una muestra aleatoria** de nada. La inferencia estadística supone muestreo
aleatorio; acá se usa para **aprender el procedimiento**, no para generalizar a “los estudiantes de
ingeniería de sonido”. Está escrito dentro del propio tablero, en la pestaña de la guía.

### Verificación del motor estadístico

`estadistica.js` no usa librerías externas: implementa las funciones gamma y beta incompletas para
los valores p. Está verificado contra valores de tabla en `test-estadistica.js`:

```bash
node test-estadistica.js
```

29 pruebas: chi² y t y F contra sus valores críticos clásicos, descriptivas sobre conjuntos
conocidos, y ANOVA / Welch / Pearson contrastados con cálculo independiente.

## Sacar los datos para el miércoles

En el panel, abajo:

- **Exportar CSV (ancho)** → una fila por estudiante, una columna por pregunta.
  Es el archivo que vas a abrir el miércoles para la práctica.
- **Exportar JSON (crudo)** → todo, incluida la definición de las preguntas. Respaldo.

Las multi-respuesta salen separadas con ` | ` en la misma celda.

> Exportá **antes** de cerrar el navegador. En modo local los datos viven en ese navegador;
> con Firebase quedan en la nube.
