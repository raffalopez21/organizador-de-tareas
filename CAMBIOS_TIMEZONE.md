# Corrección de Problemas de Fecha y Hora

## Fecha: 2026-01-19

## Problemas Resueltos

### 1. ✅ Problema de las 3 horas agregadas
**Problema**: Al crear una tarea a las 13:00, se guardaba a las 16:00.

**Causa**: El problema ocurría en múltiples lugares donde se convertía la fecha local a UTC (y viceversa):
- El constructor `new Date(dateString)` interpreta strings sin timezone como UTC y los convierte a hora local
- Argentina está en UTC-3, causando un desfase de 3 horas
- El problema se manifestaba al crear, editar y visualizar tareas

**Solución Completa**:

**Frontend** (`App.jsx`):

1. **Funciones `getLocalDateString()` y `getLocalTimeString()`** (líneas 392-408):
   - Ahora detectan si el input es un string y extraen la fecha/hora directamente sin conversión
   - Si es string con formato ISO, usa `.split()` para obtener los componentes
   - Solo usa `new Date()` cuando es absolutamente necesario

2. **Función `getTasksForDay()`** (líneas 108-146):
   - Parsea las fechas manualmente extrayendo año, mes y día del string
   - Compara componentes de fecha directamente sin crear objetos Date
   - Ordena tareas comparando strings ISO en lugar de convertir a Date

3. **Componente `TaskDetails`** (líneas 360-423):
   - Nueva función `formatTaskDateTime()` que parsea fechas manualmente
   - Extrae componentes del string y crea Date local con constructor de componentes
   - Muestra fecha y hora sin conversión UTC

4. **Función `handleSubmit()`** en `TaskForm` (línea 430):
   - Envía fecha en formato `YYYY-MM-DDTHH:mm:ss` (hora local, sin indicador de timezone)

**Backend** (`controller_tarea.py`):
- Ya estaba correctamente implementado (líneas 20-35 y 53-68)
- Remueve indicadores de timezone (`Z`, `+00:00`) antes de parsear
- Guarda en formato local sin conversiones

### 2. ✅ Formato de 24 horas
**Problema**: No estaba claro si se usaba formato de 12 o 24 horas.

**Solución**:
- Agregado `hour12: false` en todas las llamadas a `toLocaleTimeString()`
- Modificado el label del input de hora: `Hora (24h) *` (línea 445)
- Agregado `step="60"` al input de tiempo para trabajar en incrementos de minutos
- Formato de hora en TaskDetails ahora muestra explícitamente en 24h

**Archivos modificados**:
- Función `formatTime()` en línea 104-106
- Componente `TaskDetails` con función `formatTaskDateTime()` en línea 360-423
- Componente `TaskForm` en línea 445

### 3. ✅ Selección por clicks (Date/Time Pickers)
**Problema**: Usuario quería seleccionar fecha y hora usando el mouse, no teclado.

**Solución**: 
- Ya estaba implementado usando inputs nativos HTML5:
  - `<input type="date">` para la fecha (línea 444)
  - `<input type="time">` para la hora (línea 445)
- Estos inputs ya proporcionan pickers nativos del navegador que funcionan con clicks
- Son totalmente funcionales sin necesidad de librerías adicionales

## Archivos Modificados

### Frontend (`frontend/src/App.jsx`)
- **Líneas 104-106**: `formatTime()` con formato de 24h
- **Líneas 108-146**: `getTasksForDay()` - parseo de fechas sin conversión UTC
- **Líneas 360-423**: `TaskDetails` - nueva función `formatTaskDateTime()` para mostrar fechas sin conversión
- **Líneas 392-408**: `getLocalDateString()` y `getLocalTimeString()` - extraen fecha/hora del string directamente
- **Línea 430**: `handleSubmit()` en TaskForm - envía fecha en formato local
- **Líneas 444-445**: Inputs de fecha y hora con pickers nativos y formato 24h

### Backend (`backend/app/controllers/controller_tarea.py`)
- **Líneas 20-35**: `add_tarea()` - parsing de fecha local
- **Líneas 53-68**: `update_tarea()` - parsing de fecha local
- Ya estaba correctamente implementado

## Testing Recomendado

Antes de hacer deploy, probar:

1. **Crear tarea a las 13:00** → Debe guardarse y mostrarse a las 13:00 (no 16:00)
2. **Crear tarea a las 23:00** → Debe mostrarse como "23:00" (no "11:00 PM")
3. **Editar tarea existente** → Debe mantener la hora correcta sin cambios
4. **Visualizar tarea en detalles** → Debe mostrar en formato 24h sin desfase
5. **Tareas en el calendario** → Deben aparecer en el día correcto sin moverse de fecha
6. **Usar pickers de fecha/hora** → Deben funcionar con clicks del mouse

## Despliegue

Como el proyecto está deployado en:
- **Backend**: Render (https://organizador-de-tareas-hgpd.onrender.com)
- **Frontend**: Netlify

### Para deployar:
```bash
# Commit los cambios
git add .
git commit -m "Fix: Corregir problema de timezone, usar formato 24h y mejorar parseo de fechas"
git push origin main
```

Render y Netlify deberían detectar automáticamente los cambios y redeployar.

## Notas Técnicas

- **No se modificó la base de datos**: El campo `fecha` sigue siendo `DATETIME` en MySQL
- **Formato de almacenamiento**: Las fechas se guardan como `YYYY-MM-DD HH:mm:ss` sin timezone
- **Interpretación**: Todas las fechas se manejan como hora local de Argentina (UTC-3)
- **Compatibilidad**: Los cambios son retrocompatibles con datos existentes
- **Estrategia clave**: Evitar el constructor `new Date(string)` con strings de fecha del backend
- **Parseo manual**: Las fechas se parsean extrayendo componentes del string directamente
- **Sin librerías externas**: No se requieren librerías de manejo de fechas (moment.js, date-fns, etc.)

## Problemas Evitados

### ❌ NO USAR:
```javascript
// Esto causa conversión UTC → Local (desfase de 3 horas)
const date = new Date('2026-01-19T13:00:00');
```

### ✅ USAR:
```javascript
// Extraer componentes directamente del string
const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
const date = new Date(year, month - 1, day);
```

## Resumen de la Solución

El problema raíz era que JavaScript automáticamente convierte fechas entre UTC y hora local al usar el constructor `new Date(string)`. La solución fue:

1. **Enviar** fechas como strings en formato local sin indicador de timezone
2. **Recibir** fechas del backend como strings
3. **Parsear** fechas extrayendo componentes del string manualmente
4. **Comparar** fechas usando componentes o comparación de strings
5. **Mostrar** fechas formateando los componentes directamente

Con esto, las fechas se mantienen en hora local a lo largo de todo el ciclo de vida de la aplicación.
