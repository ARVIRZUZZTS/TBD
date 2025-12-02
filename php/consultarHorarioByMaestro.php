<?php
// consultarHorarioByMaestro.php
// Obtiene todos los horarios de los cursos asignados a un maestro

header('Content-Type: application/json');
require_once 'conexion.php';

$id_maestro = null;
if (isset($_GET['id_maestro'])) {
    $id_maestro = intval($_GET['id_maestro']);
} elseif (isset($_POST['id_maestro'])) {
    $id_maestro = intval($_POST['id_maestro']);
}

if (!$id_maestro) {
    echo json_encode(['exito' => false, 'mensaje' => 'ID de maestro no proporcionado']);
    exit;
}

try {
    // Obtener periodos de curso asignados al maestro
    $queryPC = "
        SELECT pc.id_periodo_curso, pc.id_curso, c.titulo as nombre_curso, pc.fecha_inicio, pc.fecha_fin
        FROM periodo_curso pc
        LEFT JOIN curso c ON pc.id_curso = c.id_curso
        WHERE pc.id_maestro = ?
        ORDER BY c.titulo
    ";

    $stmtPC = $conexion->prepare($queryPC);
    $stmtPC->bind_param('i', $id_maestro);
    $stmtPC->execute();
    $resPC = $stmtPC->get_result();

    $cursos = [];
    $periodos = [];
    while ($row = $resPC->fetch_assoc()) {
        $periodos[] = $row['id_periodo_curso'];
        $cursos[$row['id_periodo_curso']] = [
            'id_periodo_curso' => $row['id_periodo_curso'],
            'id_curso' => $row['id_curso'],
            'nombre_curso' => $row['nombre_curso'],
            'fecha_inicio' => $row['fecha_inicio'],
            'fecha_fin' => $row['fecha_fin'],
            'horarios' => []
        ];
    }

    if (empty($periodos)) {
        echo json_encode(['exito' => true, 'mensaje' => 'No tiene cursos asignados', 'cursos' => []]);
        exit;
    }

    $placeholders = implode(',', array_fill(0, count($periodos), '?'));
    $types = str_repeat('i', count($periodos));

    $queryHorarios = "
        SELECT h.id_periodo_clase, h.id_dia_clase, dh.dia, dh.hora_inicio, dh.hora_fin, dh.id_aula, a.capacidad
        FROM horario h
        INNER JOIN dia_horario dh ON h.id_dia_clase = dh.id_dia_clase
        LEFT JOIN aula a ON dh.id_aula = a.id_aula
        WHERE h.id_periodo_clase IN ({$placeholders})
        ORDER BY FIELD(dh.dia, 'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'), dh.hora_inicio
    ";

    $stmt = $conexion->prepare($queryHorarios);
    // bind_param requires references
    $bind_names[] = $types;
    for ($i = 0; $i < count($periodos); $i++) {
        $bind_name = 'bind' . $i;
        $$bind_name = $periodos[$i];
        $bind_names[] = &$$bind_name;
    }
    call_user_func_array([$stmt, 'bind_param'], $bind_names);
    $stmt->execute();
    $resH = $stmt->get_result();

    $horariosPorPeriodo = [];
    while ($row = $resH->fetch_assoc()) {
        $idPeriodo = $row['id_periodo_clase'];
        if (!isset($horariosPorPeriodo[$idPeriodo])) $horariosPorPeriodo[$idPeriodo] = [];
        $horariosPorPeriodo[$idPeriodo][] = [
            'id_dia_clase' => $row['id_dia_clase'],
            'dia' => $row['dia'],
            'hora_inicio' => $row['hora_inicio'],
            'hora_fin' => $row['hora_fin'],
            'id_aula' => $row['id_aula'],
            'capacidad' => $row['capacidad']
        ];
    }

    foreach ($cursos as $idPeriodo => &$curso) {
        if (isset($horariosPorPeriodo[$idPeriodo])) {
            $curso['horarios'] = $horariosPorPeriodo[$idPeriodo];
        }
    }

    echo json_encode(['exito' => true, 'mensaje' => 'Horarios cargados', 'cursos' => array_values($cursos)]);

} catch (Exception $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
}

$conexion->close();
?>
