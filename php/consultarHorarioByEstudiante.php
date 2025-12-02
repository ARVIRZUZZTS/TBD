<?php
// consultarHorarioByEstudiante.php
// Obtiene todos los horarios de clases para un estudiante basado en los cursos en los que está inscrito

header('Content-Type: application/json');
require_once 'conexion.php';

if (!isset($_GET['id_estudiante'])) {
    echo json_encode(['exito' => false, 'mensaje' => 'ID de estudiante no proporcionado']);
    exit;
}

$id_estudiante = intval($_GET['id_estudiante']);

try {
    // Consultar todos los cursos en los que el estudiante está inscrito
    $queryInscripciones = "
        SELECT DISTINCT 
            i.id_periodo_curso,
            pc.id_curso,
            c.titulo as nombre_curso,
            u.nombre as nombre_profesor,
            u.apellido as apellido_profesor,
            pc.fecha_inicio,
            pc.fecha_fin
        FROM inscripcion i
        INNER JOIN periodo_curso pc ON i.id_periodo_curso = pc.id_periodo_curso
        INNER JOIN curso c ON pc.id_curso = c.id_curso
        INNER JOIN usuario u ON pc.id_maestro = u.id_user
        WHERE i.id_user = ?
        ORDER BY c.titulo
    ";
    
    $stmtInscripciones = $conexion->prepare($queryInscripciones);
    $stmtInscripciones->bind_param("i", $id_estudiante);
    $stmtInscripciones->execute();
    $resultInscripciones = $stmtInscripciones->get_result();
    
    $cursos = [];
    $periodosCursos = [];
    
    while ($row = $resultInscripciones->fetch_assoc()) {
        $periodosCursos[] = $row['id_periodo_curso'];
        $cursos[$row['id_periodo_curso']] = [
            'id_periodo_curso' => $row['id_periodo_curso'],
            'id_curso' => $row['id_curso'],
            'nombre_curso' => $row['nombre_curso'],
            'nombre_profesor' => $row['nombre_profesor'],
            'apellido_profesor' => $row['apellido_profesor'],
            'fecha_inicio' => $row['fecha_inicio'],
            'fecha_fin' => $row['fecha_fin'],
            'horarios' => []
        ];
    }
    
    // Si no hay inscripciones, retornar vacío
    if (empty($periodosCursos)) {
        echo json_encode([
            'exito' => true,
            'mensaje' => 'El estudiante no tiene cursos inscritos',
            'horarios' => [],
            'cursos' => []
        ]);
        exit;
    }
    
    // Consultar todos los horarios para cada período de curso
    $placeholders = implode(',', array_fill(0, count($periodosCursos), '?'));
    
    $queryHorarios = "
        SELECT 
            h.id_periodo_clase,
            h.id_dia_clase,
            dh.dia,
            dh.hora_inicio,
            dh.hora_fin,
            dh.id_aula,
            a.capacidad
        FROM horario h
        INNER JOIN dia_horario dh ON h.id_dia_clase = dh.id_dia_clase
        LEFT JOIN aula a ON dh.id_aula = a.id_aula
        WHERE h.id_periodo_clase IN ({$placeholders})
        ORDER BY 
            CASE dh.dia 
                WHEN 'Lunes' THEN 1
                WHEN 'Martes' THEN 2
                WHEN 'Miércoles' THEN 3
                WHEN 'Jueves' THEN 4
                WHEN 'Viernes' THEN 5
                WHEN 'Sábado' THEN 6
                WHEN 'Domingo' THEN 7
                ELSE 8
            END,
            dh.hora_inicio
    ";
    
    $stmtHorarios = $conexion->prepare($queryHorarios);
    
    // Bind parameters dinámicamente
    $types = str_repeat('i', count($periodosCursos));
    $stmtHorarios->bind_param($types, ...$periodosCursos);
    $stmtHorarios->execute();
    $resultHorarios = $stmtHorarios->get_result();
    
    $horariosPorPeriodo = [];
    
    while ($row = $resultHorarios->fetch_assoc()) {
        $idPeriodo = $row['id_periodo_clase'];
        
        if (!isset($horariosPorPeriodo[$idPeriodo])) {
            $horariosPorPeriodo[$idPeriodo] = [];
        }
        
        $horariosPorPeriodo[$idPeriodo][] = [
            'id_dia_clase' => $row['id_dia_clase'],
            'dia' => $row['dia'],
            'hora_inicio' => $row['hora_inicio'],
            'hora_fin' => $row['hora_fin'],
            'id_aula' => $row['id_aula'],
            'capacidad' => $row['capacidad']
        ];
    }
    
    // Asignar horarios a los cursos
    foreach ($cursos as $idPeriodo => &$curso) {
        if (isset($horariosPorPeriodo[$idPeriodo])) {
            $curso['horarios'] = $horariosPorPeriodo[$idPeriodo];
        }
    }
    
    // Construir array de todos los horarios (sin agrupar por curso)
    $todosHorarios = [];
    foreach ($horariosPorPeriodo as $horarios) {
        $todosHorarios = array_merge($todosHorarios, $horarios);
    }
    
    echo json_encode([
        'exito' => true,
        'mensaje' => 'Horarios cargados correctamente',
        'cursos' => array_values($cursos),
        'horarios' => $todosHorarios,
        'total_cursos' => count($cursos)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al obtener horarios: ' . $e->getMessage()
    ]);
}

$conexion->close();
?>
