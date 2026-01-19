# Corrección de Problemas de Fecha y Hora

## Fecha: 2026-01-19

## Problemas Resueltos

### 1. ✅ Problema de las 3 horas agregadas
**Problema**: Al crear una tarea a las 13:00, se guardaba a las 16:00.

**Causa**: El frontend convertía la fecha local a UTC usando `.toISOString()`, y cuando el backend guardaba en MySQL sin zona horaria, al leerla de nuevo el navegador la interpretaba como local, causando un desfase de 3 horas (timezone de Argentina UTC-3).

**Solución**:
- **Frontend** (`App.jsx`):
  - Removida la conversión a ISO/UTC
  - Se envía directamente el string en formato local: `YYYY-MM-DDTHH:mm:ss`
  - Se crearon funciones helpers `getLocalDateString()` y `getLocalTimeString()` para manejar fechas sin conversión de timezone

- **Backend** (`controller_tarea.py`):
  - Modificado el parsing de fechas para eliminar cualquier indicador de timezone (Z, +00:00)
  - Se parsea la fecha directamente como local sin conversiones
  - Formato aceptado: `YYYY-MM-DDTHH:mm:ss` o `YYYY-MM-DDTHH:mm`

### 2. ✅ Formato de 24 horas
**Problema**: No estaba claro si se usaba formato de 12 o 24 horas.

**Solución**:
- Agregado `hour12: false` en todas las llamadas a `toLocaleTimeString()`
- Modificado el label del input de hora: `Hora (24h) *`
- Agregado `step="60"` al input de tiempo para trabajar en incrementos de minutos

**Archivos modificados**:
- Función `formatTime()` en línea 104-106
- Componente `TaskDetails` en línea 354
- Componente `TaskForm` en línea 427

### 3. ✅ Selección por clicks (Date/Time Pickers)
**Problema**: Usuario quería seleccionar fecha y hora usando el mouse, no teclado.

**Solución**: 
- Ya estaba implementado usando inputs nativos HTML5:
  - `<input type="date">` para la fecha
  - `<input type="time">` para la hora
- Estos inputs ya proporcionan pickers nativos del navegador que funcionan con clicks

## Archivos Modificados

### Frontend
- `frontend/src/App.jsx`:
  - Líneas 104-106: `formatTime()` con formato de 24h
  - Líneas 354: `TaskDetails` con formato de 24h
  - Líneas 380-414: `TaskForm` con manejo de fechas locales
  - Línea 427: Input de hora con label "24h" y step="60"

### Backend
- `backend/app/controllers/controller_tarea.py`:
  - Líneas 20-35: `add_tarea()` - parsing de fecha local
  - Líneas 53-68: `update_tarea()` - parsing de fecha local

## Testing Recomendado

Antes de hacer deploy, probar:

1. **Crear tarea a las 13:00** → Debe guardarse y mostrarse a las 13:00
2. **Crear tarea a las 23:00** → Debe mostrarse como "23:00" (no "11:00 PM")
3. **Editar tarea existente** → Debe mantener la hora correcta
4. **Visualizar tarea** → Debe mostrar en formato 24h

## Despliegue

Como el proyecto está deployado en:
- **Backend**: Render
- **Frontend**: Netlify

Deberás hacer push de los cambios y redeployar ambos servicios.

### Para deployar:
```bash
# Commit los cambios
git add .
git commit -m "Fix: Corregir problema de timezone y usar formato 24h"
git push origin main
```

Render y Netlify deberían detectar automáticamente los cambios y redeployar.

## Notas Técnicas

- **No se modificó la base de datos**: El campo `fecha` sigue siendo `DATETIME` en MySQL
- **Formato de almacenamiento**: Las fechas se guardan como `YYYY-MM-DD HH:mm:ss` sin timezone
- **Interpretación**: Todas las fechas se manejan como hora local de Argentina (UTC-3)
- **Compatibilidad**: Los cambios son retrocompatibles con datos existentes
