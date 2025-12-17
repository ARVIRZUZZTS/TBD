<?php
// nuevo
header('Content-Type: application/json');
include 'conexion.php';

$id_periodo_curso = intval($_GET['id_periodo_curso'] ?? 0);
$id_maestro = intval($_GET['id_maestro'] ?? 0);

if (!$id_periodo_curso || !$id_maestro) {
    echo json_encode(['exito' => false, 'mensaje' => 'Parámetros inválidos']);
    exit;
}

try {
    // Verificar que el maestro sea propietario del periodo_curso
    $vsql = "SELECT id_maestro FROM periodo_curso WHERE id_periodo_curso = ? LIMIT 1";
    $vstmt = $conexion->prepare($vsql);
    $vstmt->bind_param('i', $id_periodo_curso);
    $vstmt->execute();
    $vres = $vstmt->get_result();
    if ($vres->num_rows === 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'Periodo de curso no encontrado']);
        exit;
    }
    $rowv = $vres->fetch_assoc();
    if (intval($rowv['id_maestro']) !== $id_maestro) {
        echo json_encode(['exito' => false, 'mensaje' => 'No tienes permiso para ver este reporte']);
        exit;
    }

    // Total de evaluaciones en el curso
    $sql_total_ev = "SELECT COUNT(*) AS total_evaluaciones
                     FROM modulo m
                     INNER JOIN evaluacion e ON m.id_modulo = e.id_modulo
                     WHERE m.id_periodo_curso = ?";
    $stmt_te = $conexion->prepare($sql_total_ev);
    $stmt_te->bind_param('i', $id_periodo_curso);
    $stmt_te->execute();
    $res_te = $stmt_te->get_result();
    $total_evaluaciones = 0;
    if ($r = $res_te->fetch_assoc()) $total_evaluaciones = intval($r['total_evaluaciones']);

    // Obtener estudiantes inscritos en el periodo
    $sql_students = "SELECT ce.id_estudiante, u.nombre, u.apellido, COALESCE(ce.asistencia,0) AS asistencia
                     FROM curso_estudiante ce
                     INNER JOIN usuario u ON ce.id_estudiante = u.id_user
                     WHERE ce.id_periodo_curso = ?";
    $stmt_s = $conexion->prepare($sql_students);
    $stmt_s->bind_param('i', $id_periodo_curso);
    $stmt_s->execute();
    $res_s = $stmt_s->get_result();

    // nuevo: si no hay estudiantes inscritos, devolver sin datos para que no se muestre nada
    if ($res_s->num_rows === 0) {
        // cerrar statements abiertos
        if (isset($stmt_s)) $stmt_s->close();
        if (isset($stmt_te)) $stmt_te->close();
        echo json_encode(['exito' => false, 'mensaje' => 'No hay estudiantes inscritos en este curso']);
        $conexion->close();
        exit;
    }

    $students = [];
    while ($stu = $res_s->fetch_assoc()) {
        $id_est = intval($stu['id_estudiante']);

        // tareas completadas por estudiante en este periodo
        $sql_tareas = "SELECT COUNT(*) AS tareas_completadas FROM entregas e
                       WHERE e.id_user = ? AND e.id_publicacion LIKE 'TA-%' AND
                       CAST(SUBSTRING(e.id_publicacion,4) AS UNSIGNED) IN (
                           SELECT t.id_tarea FROM tarea t
                           INNER JOIN modulo m ON t.id_modulo = m.id_modulo
                           WHERE m.id_periodo_curso = ?)
                       ";
        $stmt_t = $conexion->prepare($sql_tareas);
        $stmt_t->bind_param('ii', $id_est, $id_periodo_curso);
        $stmt_t->execute();
        $res_t = $stmt_t->get_result();
        $tareas_c = 0;
        if ($rt = $res_t->fetch_assoc()) $tareas_c = intval($rt['tareas_completadas']);

        // evaluaciones completadas por estudiante
        $sql_evs = "SELECT COUNT(*) AS evs_completadas FROM entregas e
                    WHERE e.id_user = ? AND e.id_publicacion LIKE 'EV-%' AND
                    CAST(SUBSTRING(e.id_publicacion,4) AS UNSIGNED) IN (
                        SELECT ev.id_evaluacion FROM evaluacion ev
                        INNER JOIN modulo m2 ON ev.id_modulo = m2.id_modulo
                        WHERE m2.id_periodo_curso = ?)
                    ";
        $stmt_ev = $conexion->prepare($sql_evs);
        $stmt_ev->bind_param('ii', $id_est, $id_periodo_curso);
        $stmt_ev->execute();
        $res_ev = $stmt_ev->get_result();
        $evs_c = 0;
        if ($re = $res_ev->fetch_assoc()) $evs_c = intval($re['evs_completadas']);

        // promedio según evaluaciones (base 100)
        $sql_avg = "SELECT AVG(e.nota) AS promedio FROM entregas e
                    WHERE e.id_user = ? AND e.id_publicacion LIKE 'EV-%' AND
                    CAST(SUBSTRING(e.id_publicacion,4) AS UNSIGNED) IN (
                        SELECT ev2.id_evaluacion FROM evaluacion ev2
                        INNER JOIN modulo m3 ON ev2.id_modulo = m3.id_modulo
                        WHERE m3.id_periodo_curso = ?)
                    ";
        $stmt_avg = $conexion->prepare($sql_avg);
        $stmt_avg->bind_param('ii', $id_est, $id_periodo_curso);
        $stmt_avg->execute();
        $res_avg = $stmt_avg->get_result();
        $avg = null;
        if ($ra = $res_avg->fetch_assoc()) {
            $avg = $ra['promedio'] !== null ? floatval($ra['promedio']) : null;
        }

        $students[] = [
            'id_estudiante' => $id_est,
            'nombre' => $stu['nombre'],
            'apellido' => $stu['apellido'],
            'asistencia' => intval($stu['asistencia']),
            'tareas_completadas' => $tareas_c,
            'evaluaciones_completadas' => $evs_c,
            'promedio_evaluaciones' => $avg
        ];

        // cerrar stmt locales
        if (isset($stmt_t)) $stmt_t->close();
        if (isset($stmt_ev)) $stmt_ev->close();
        if (isset($stmt_avg)) $stmt_avg->close();
    }

    echo json_encode([
        'exito' => true,
        'total_evaluaciones' => $total_evaluaciones,
        'students' => $students
    ]);

} catch (Exception $e) {
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()]);
}

$conexion->close();
?>