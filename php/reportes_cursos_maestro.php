<?php
// nuevo
header('Content-Type: application/json');
include 'conexion.php';

$id_maestro = $_GET['id_maestro'] ?? '';
if (empty($id_maestro)) {
    echo json_encode(['exito' => false, 'mensaje' => 'ID de maestro no proporcionado']);
    exit;
}

try {
    // Obtener cursos del maestro con número de inscritos, ganancia estimada (costo * inscritos) y aprobados (nota >= 51)
    // nuevo: usar inscripcion para calcular ingresos reales (pagos) y curso_estudiante para inscritos
    $sql = "SELECT pc.id_periodo_curso, c.titulo AS titulo_curso, pc.costo,
           COALESCE(COUNT(DISTINCT ce.id_estudiante),0) AS inscritos,
           COALESCE(COUNT(DISTINCT ins.id_inscripcion),0) AS pagos,
           COALESCE(SUM(CASE WHEN ce.nota >= 51 THEN 1 ELSE 0 END),0) AS aprobados
        FROM periodo_curso pc
        INNER JOIN curso c ON pc.id_curso = c.id_curso
        LEFT JOIN curso_estudiante ce ON ce.id_periodo_curso = pc.id_periodo_curso
        LEFT JOIN inscripcion ins ON ins.id_periodo_curso = pc.id_periodo_curso
        WHERE pc.id_maestro = ?
        GROUP BY pc.id_periodo_curso, c.titulo, pc.costo
    ";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param('i', $id_maestro);
    $stmt->execute();
    $result = $stmt->get_result();

    $cursos = [];
    while ($row = $result->fetch_assoc()) {
    $inscritos = intval($row['inscritos']);
    $pagos = intval($row['pagos']); // nuevo: número de inscripciones/pagos
    $costo = floatval($row['costo']);
    // calcular ganancia usando pagos reales en lugar de inscritos
    $ganancia_est = $pagos * $costo; // nuevo
        $row['inscritos'] = $inscritos;
    $row['costo'] = $costo;
    $row['pagos'] = $pagos; // nuevo
    $row['ganancia_estimada'] = $ganancia_est;
        $row['aprobados'] = intval($row['aprobados']);
        $cursos[] = $row;
    }

    echo json_encode(['exito' => true, 'cursos' => $cursos]);

} catch (Exception $e) {
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()]);
}

$conexion->close();
?>