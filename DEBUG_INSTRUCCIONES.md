# 🔍 INSTRUCCIONES DE DEBUG Y PRUEBA

## ⚠️ IMPORTANTE: Actualizaciones no visibles

Los cambios **YA ESTÁN en el código**, pero necesitas:

### 1. 🔄 Refrescar el Frontend

Si estás probando localmente:
```bash
# En la terminal del frontend, detener el servidor (Ctrl+C) y reiniciar:
npm start
```

Luego en el navegador:
- Haz **Ctrl + Shift + R** (Windows) o **Cmd + Shift + R** (Mac) para recargar sin caché
- O abre DevTools (F12) → Network tab → marca "Disable cache" → recarga

### 2. 🔍 Ver los Logs de Debug

He agregado console.logs para identificar el problema. Abre la consola del navegador (F12):

1. **Al cargar la página**, verás:
   ```
   Tareas recibidas: [...]
   ```

2. **Al crear una tarea**, verás:
   ```
   🔵 handleSaveTask - datos recibidos: {...}
   🔵 Creando nueva tarea: {...}
   🔵 Respuesta del backend (create): {...}
   🔵 Tarea transformada (create): {...}
   🔵 Tasks anteriores: X
   🔵 Tasks después de agregar: X+1
   ```

3. **Si hay errores en fechas**, verás:
   ```
   Error parsing task date: ...
   ```

---

## 📋 Verificar los Cambios de Interfaz

### ✅ Formato de 24 horas
1. Clic en "+ Nueva Tarea"
2. Verificar que diga **"Hora (24h) *"** en el label
3. El selector de hora debe mostrar formato 24h (0-23)

### ✅ Pickers con Click
1. **Campo de Fecha**: Clic en el input → Debe aparecer un calendario
2. **Campo de Hora**: Clic en el input → Debe aparecer selector de hora
3. Ambos deben funcionar 100% con mouse

---

## 🐛 Debugging del Problema "Tareas no aparecen"

### Escenario de Prueba:
1. Crea una tarea para **HOY** a las **14:00**
2. Abre la consola del navegador (F12)
3. Verifica los logs

### Posibles causas:

#### Causa 1: Error en la fecha recibida del backend
**Busca en los logs**:
```
🔵 Respuesta del backend (create): {...}
```

**Verifica el formato de `fecha`**:
- ✅ Debe ser: `"2026-01-19T14:00:00"` o `"2026-01-19 14:00:00"`
- ❌ NO debe tener: `"Z"` o `"+00:00"` o `"2026-01-19T17:00:00"` (3 horas más)

#### Causa 2: Error en getTasksForDay
**Busca en los logs**:
```
Error parsing task date: ...
```

Si ves este error, significa que la fecha viene en un formato no esperado.

#### Causa 3: Filtro de status
**Verifica**: ¿Tienes "Pendientes" o "Completadas" seleccionado en el filtro?
- Cambia a **"Todas"** y revisa si aparece la tarea

---

## 📊 Datos a Recolectar

Por favor, copia y pégame:

### 1. Logs de la Consola del Navegador
Al crear una tarea, copia TODOS los logs que digan: 
```
🔵 ...
```

### 2. Formato de la Fecha en la BD
Verifica en tu base de datos cómo se guardó la tarea:
```sql
SELECT id, titulo, fecha FROM tareas ORDER BY id DESC LIMIT 1;
```

Debería mostrar algo como:
```
| id | titulo | fecha               |
|----|--------|---------------------|
| 42 | Test   | 2026-01-19 14:00:00|
```

### 3. Respuesta del Backend
En los logs busca:
```
🔵 Respuesta del backend (create): {...}
```

Y copia el objeto completo

---

## 🔧 Soluciones Rápidas

### Si las tareas siguen sin aparecer:

#### Opción A: Revertir temporalmente el parseo manual
Puedo volver al código anterior y resolver el problema de otra forma

#### Opción B: Ajustar el formato de fecha del backend
Si el backend envía fechas en formato diferente al esperado

#### Opción C: Forzar recarga de todas las tareas
Agregar un `loadData()` después de crear la tarea

---

## 📝 Checklist Rápido

Antes de reportar más detalles, verifica:

- [ ] Refrescaste el navegador con Ctrl+Shift+R
- [ ] Abriste la consola del navegador (F12)
- [ ] Creaste una tarea de prueba
- [ ] Viste los logs 🔵 en consola
- [ ] Verificaste que la tarea se guardó en la BD
- [ ] Probaste con el filtro en "Todas"
- [ ] El label dice "Hora (24h) *"
- [ ] Los inputs type="date" y type="time" funcionan con click

---

## 🎯 Próximos Pasos

Una vez que hagas las pruebas y veas los logs, podré:

1. Identificar exactamente dónde está fallando
2. Corregir el problema específico
3. Asegurarme de que las tareas aparezcan correctamente

**¡Copia los logs y dime qué encuentras!** 🔍
