# Módulo de Horarios - Documentación de Implementación

## 📋 Resumen

Se ha creado un nuevo módulo "Horarios" que permite a los estudiantes consultar todos sus horarios de clases para los cursos en los que están inscritos. El módulo incluye funcionalidad para filtrar por curso.

## 📁 Archivos Creados/Modificados

### 1. **PHP Backend** - `php/consultarHorarioByEstudiante.php` (NUEVO)
   - Endpoint que obtiene todos los horarios de clases para un estudiante
   - Consulta las tablas: `inscripcion`, `periodo_curso`, `curso`, `usuario`, `horario`, `dia_horario`, `aula`
   - Retorna un JSON con:
     - Lista de cursos inscritos con sus detalles
     - Horarios agrupados por período de curso
     - Información de aulas y capacidad
   
   **Parámetro:**
   - `id_estudiante` (GET): ID del estudiante

### 2. **JavaScript - Frontend** - `js/estudiante/modules/horarios.js` (NUEVO)
   - Módulo ES6 que maneja la carga y visualización de horarios
   - **Funciones principales:**
     - `cargarHorarios()`: Obtiene los horarios del servidor
     - `mostrarHorarios(cursos)`: Renderiza los horarios y filtros
     - `mostrarHorariosCurso(curso)`: Crea la tarjeta de horario para un curso
     - `agruparHorariosPorDia(horarios)`: Agrupa horarios por día de la semana
     - `filtrarPorCurso(idCurso)`: Filtra la vista por curso seleccionado (función global)

### 3. **HTML UI** - `estudiante.html` (MODIFICADO)
   - Agregado botón "Horarios" en la navegación
   - Agregada sección `<div id="horarios" class="tab-content">` con grid de contenido

### 4. **CSS Styling** - `css/estudiante.css` (MODIFICADO)
   - Estilos completos para el módulo de horarios:
     - `.filtros-horarios`: Barra de filtros
     - `.horario-card`: Tarjeta de horario del curso
     - `.horario-table`: Tabla de horarios formateada
     - Responsive design para dispositivos móviles

### 5. **JavaScript Navigation** - `js/estudiante/ui/navigation.js` (MODIFICADO)
   - Agregada importación del módulo `horarios.js`
   - Agregado case `'horarios'` en `cargarContenidoPestana()`

### 6. **JavaScript Main** - `js/estudiante/main.js` (MODIFICADO)
   - Agregada importación del módulo `horarios.js`

## 🎨 Características Implementadas

### ✅ Visualización de Horarios
- Cada curso inscrito se muestra en una tarjeta con:
  - Nombre del curso
  - Nombre del profesor
  - Rango de fechas del curso
  - Tabla de horarios organizados por día

### ✅ Tabla de Horarios
- Columnas: Día, Inicio, Fin, Aula, Capacidad
- Días ordenados lógicamente (Lunes a Domingo)
- Formato de hora en 24 horas (HH:MM)
- Horarios agrupados por día dentro de cada curso

### ✅ Sistema de Filtros
- Botón "Ver Todos" para mostrar todos los cursos
- Un botón por cada curso inscrito
- Filtrado dinámico sin recargar la página
- Estado visual claro del filtro activo

### ✅ Diseño Responsivo
- Adaptable a diferentes tamaños de pantalla
- En móviles, los botones se apilan verticalmente
- Tabla con scroll horizontal en pantallas pequeñas

### ✅ Integración con Sistema Existente
- Usa las funciones de utilidad existentes (`obtenerIdEstudiante`, `formatearFecha`)
- Sigue el patrón de módulos ES6 del proyecto
- Coherente con el diseño visual del sistema

## 🔄 Flujo de Datos

```
1. Usuario hace click en tab "Horarios"
2. navigation.js dispara cargarHorarios()
3. horarios.js obtiene id del estudiante
4. Fetch a consultarHorarioByEstudiante.php?id_estudiante=X
5. PHP:
   - Consulta cursos donde está inscrito
   - Obtiene horarios para cada período
   - Retorna JSON con estructura completa
6. Frontend:
   - Renderiza tarjetas de cursos
   - Crea sistema de filtros
   - Muestra tabla de horarios
7. Usuario puede filtrar por curso
```

## 📊 Estructura de Respuesta JSON

```json
{
  "exito": true,
  "mensaje": "Horarios cargados correctamente",
  "cursos": [
    {
      "id_periodo_curso": 1,
      "id_curso": 7,
      "nombre_curso": "Matemáticas Avanzada",
      "nombre_profesor": "Juan",
      "apellido_profesor": "Pérez",
      "fecha_inicio": "2025-11-20",
      "fecha_fin": "2025-12-20",
      "horarios": [
        {
          "id_dia_clase": 1,
          "dia": "Lunes",
          "hora_inicio": "08:00:00",
          "hora_fin": "10:00:00",
          "id_aula": 101,
          "capacidad": 30
        }
      ]
    }
  ],
  "horarios": [],
  "total_cursos": 1
}
```

## 🎯 Casos de Uso

### Caso 1: Estudiante sin inscripciones
- Se muestra mensaje: "El estudiante no tiene cursos inscritos"
- No se muestran filtros

### Caso 2: Estudiante con 1+ inscripciones
- Se muestran todas las tarjetas de cursos
- Se puede filtrar por curso individual
- Se puede ver todos a la vez

### Caso 3: Error de conexión
- Se muestra: "Error al cargar los horarios"
- Log de error en consola

## 🔐 Seguridad

- Validación de ID estudiante en PHP
- Consultas preparadas (prepared statements)
- Solo se obtienen horarios de cursos en los que el estudiante está inscrito
- Cierre de conexión al finalizar

## 📱 Clases CSS Disponibles

Para personalización futura:
- `.filtros-horarios`: Contenedor de filtros
- `.filtro-btn`: Botones de filtro
- `.filtro-btn.active`: Estado activo del filtro
- `.horario-card`: Tarjeta principal del horario
- `.horario-table`: Tabla de horarios
- `.dia-cell`, `.hora-cell`, `.aula-cell`, `.capacidad-cell`: Celdas específicas

## 🚀 Próximas Mejoras Posibles

1. Agregar vista de calendario (vista semanal/mensual)
2. Exportar horario a PDF o ICS
3. Notificaciones de cambios de horario
4. Descargar horario como imagen
5. Integrar con calendario del navegador
6. Mostrar mapa de aulas
7. Historial de cambios de horario

## ✅ Testing Recomendado

1. Verificar con estudiante sin inscripciones
2. Verificar con estudiante con 1+ inscripciones
3. Probar filtros individuales
4. Probar filtro "Ver Todos"
5. Verificar responsividad en móvil
6. Verificar que los horarios se carguen en orden correcto
7. Verificar que las aulas se muestren correctamente
