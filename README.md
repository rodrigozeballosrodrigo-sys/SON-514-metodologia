# SON-514 · Metodología de la Investigación

Carrera de Ingeniería de Sonido · UNITEPC · 40 horas / semestre · 9° semestre

Asignatura diseñada para que cada estudiante construya un **artículo científico** como hilo conductor, desde la pregunta inicial hasta la presentación de avances en un seminario tipo doctorantes.

## Estructura

### 📋 Planes de clase
- **PLAN-DE-CLASE-TEORICO-SON-514.md** (14 sesiones teóricas)
  - 5 unidades, 10 temas + 1 seminario
  - Competencias, resultados de aprendizaje, indicadores, contenidos, estrategias, evaluación
  - Secuencias de tiempos exactos (90 min c/u)
  - Formato institucional (.md y .docx)

- **PLAN-DE-CLASE-PRACTICO-SON-514.md** (13 sesiones prácticas)
  - Entregables acumulativos que alimentan evaluación continua
  - Tabla resumen: cómo cada producto contribuye a 30% formativa + 30% parcial + 40% final

- **NOTA-INTERNA-DOCENTE-integracion-IA.md**
  - Mapa de dónde enseñar IA discretamente (unidades 1-4 bajo "herramientas")
  - Ejercicios para que descubran por sí mismos; debate explícito en semana 13

### 💬 Encuesta diagnóstica (`encuesta/`)
**Archivo único**, sincroniza en vivo entre teléfono del estudiante y proyector del docente.

**Características:**
- 28 preguntas (26 + 2 condicionales) · ~22 min de reloj
- 6 preguntas comentadas (generan material para práctica del miércoles)
- Modo local (pestañas del navegador) o Firebase (múltiples dispositivos)
- Privacidad: ingresos, cuidado de personas, nombre NO se proyectan
- Responsive: PC, tablet, teléfono
- Globos animados que representan respuestas en tiempo real
- QR + código de sesión 6 caracteres (24⁶ combinaciones, no se adivina)

**Cómo ejecutar:**
```bash
# Modo local: abrí index.html con doble clic
# Modo en vivo: configurá Firebase → npm vercel login → npm vercel --prod desde encuesta/
```

### 📊 Taller de análisis (`encuesta/analisis.html`)
Interfaz didáctica para la **clase del miércoles** (Unidad 5).

**Motor estadístico sin dependencias externas:**
- Implementa funciones gamma y beta incompletas (para valores p)
- Verificado contra 29 pruebas: chi², t, F, Pearson, ANOVA contra valores de tabla y cálculos independientes

**Qué hace:**
| Pestaña | Análisis |
|---|---|
| Una variable | Descriptivas: media, mediana, moda, desviación, cuartiles, histograma |
| Cruce de dos | Elige automáticamente: chi² (cat×cat) · t de Welch (cat×cuant, 2 grupos) · ANOVA (cat×cuant, 3+) · Pearson (cuant×cuant) |
| Guía | Tabla de decisión + qué significa el valor p sin malentendidos |

**Didáctico = transparente:**
- Cada resultado incluye "¿cómo se calcula?" con fórmulas y números reales de esa corrida
- Avisa cuando se violan supuestos (ej. frecuencias esperadas < 5 en chi²)
- Enfatiza: "este p no es confiable con estos datos"

## Evaluación

| Componente | Peso | Medición |
|---|---|---|
| Formativa (continua) | 30% | Entregables de prácticas + participación |
| Parcial (semana 6) | 30% | Prueba: pregunta+hipótesis+método |
| Final (semana 14) | 40% | Seminario de Investigación: presentación + peer review |

## Despliegue en producción

### Requisitos previos
1. Crear proyecto Firebase (Realtime Database, modo de prueba)
2. Copiar `firebaseConfig` en `encuesta/index.html` → bloque `CONFIG_FIREBASE`
3. Configurar reglas de seguridad (ver `encuesta/INSTRUCCIONES.md`)

### Con GitHub + Vercel
```bash
# 1. Este repositorio ya está en Git
git push -u origin master

# 2. En Vercel (https://vercel.com):
# - Click "Add New" → "Project" → seleccionar este repositorio
# - Root Directory: `encuesta`
# - Deploy

# 3. La URL sale inmediatamente; distribuid el QR en clase
```

### Alternativas de alojamiento
- **Netlify Drop:** arrastrá `encuesta/` a https://app.netlify.com/drop
- **GitHub Pages:** Enable en Settings → Pages, branch master
- **Firebase Hosting:** `npx firebase init hosting && npx firebase deploy`

## Estructura de carpetas
```
SON-514-Metodologia-Investigacion/
├── PLAN-DE-CLASE-TEORICO-SON-514.md          (markdown + .docx)
├── PLAN-DE-CLASE-PRACTICO-SON-514.md         (markdown + .docx)
├── NOTA-INTERNA-DOCENTE-integracion-IA.md
├── encuesta/
│   ├── index.html                (encuesta + panel docente)
│   ├── analisis.html             (taller de análisis)
│   ├── estadistica.js            (motor sin dependencias)
│   ├── test-estadistica.js       (verificación: 29 pruebas)
│   ├── INSTRUCCIONES.md          (setup Firebase + Vercel)
│   ├── vercel.json               (config: noindex, cache)
│   └── .vercelignore
└── README.md (este archivo)
```

## Verificación del motor estadístico

```bash
cd encuesta && node test-estadistica.js
```

Debe mostrar ✔ en todas las 29 pruebas (chi², t, F, descriptivas, contingencia, Welch, ANOVA, Pearson).

## Notas para docentes

### Flujo de clase lunes (teoría + diagnóstico)
1. Abrí `#docente` en la máquina del proyector
2. Estudiantes escanean QR o tipean URL + código de 6 caracteres
3. Ven aviso ético obligatorio, tocan "Entendido, empezar"
4. Lanzás preguntas con atajos: `barra espaciadora` abre/cierra · `→` siguiente · `←` anterior
5. Exportás CSV después de clase
6. Tocás "Reiniciar sesión" en el panel para limpiar datos

### Clase miércoles (práctica + análisis)
1. Subís el CSV en `analisis.html`
2. Estudiantes exploran descriptivas → cruces → hipótesis propias
3. Debate: "¿qué prueba corresponde? ¿qué significa ese p?"
4. Cierre: escriben una frase de conclusión para cada cruce

### Incorporación de IA (discreta luego explícita)
- **Semanas 1-4:** ejercicios donde herramientas digitales "aparecen" sin nombrar IA
- **Semana 13:** debate abierto sobre límites éticos, detección, confianza en datos generados
- Ver `NOTA-INTERNA-DOCENTE-integracion-IA.md` para casos concretos y actividades

## Contacto & feedback

Rodrigo Javier Zeballos Peña  
rodrigozeballosrodrigo@gmail.com  
Ingeniería de Sonido · UNITEPC
