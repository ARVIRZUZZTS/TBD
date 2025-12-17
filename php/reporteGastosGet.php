<?php
header("Content-Type: application/json");
include 'conexion.php';

$id_estudiante = $_GET['id_estudiante'] ?? '';

if (empty($id_estudiante)) {
    echo json_encode(['exito' => false, 'mensaje' => 'ID de estudiante requerido']);
    exit;
}

// Query to get expenses
$sql = "
    SELECT 
        c.titulo as curso_titulo,
        pc.costo as costo_original,
        i.fecha_inscripcion,
        d.porcentaje_descuento
    FROM inscripcion i
    INNER JOIN periodo_curso pc ON i.id_periodo_curso = pc.id_periodo_curso
    INNER JOIN curso c ON pc.id_curso = c.id_curso
    LEFT JOIN descuento d ON i.id_descuento = d.id_descuento
    WHERE i.id_user = ?
    ORDER BY i.fecha_inscripcion DESC
";

$stmt = $conexion->prepare($sql);

if (!$stmt) {
    echo json_encode(['exito' => false, 'mensaje' => 'Error en la consulta: ' . $conexion->error]);
    exit;
}

$stmt->bind_param("i", $id_estudiante);
$stmt->execute();
$result = $stmt->get_result();

$gastos = [];
$total_gastado = 0;

while ($row = $result->fetch_assoc()) {
    $costo = floatval($row['costo_original']);
    // If discount is null, it's 0%
    $descuento_porcentaje = $row['porcentaje_descuento'] ? floatval($row['porcentaje_descuento']) : 0;
    
    $monto_descontado = $costo * ($descuento_porcentaje / 100);
    $costo_final = $costo - $monto_descontado;
    
    $gastos[] = [
        'curso' => $row['curso_titulo'],
        'fecha' => $row['fecha_inscripcion'],
        'costo_original' => number_format($costo, 2),
        'descuento_porcentaje' => $descuento_porcentaje,
        'monto_descontado' => number_format($monto_descontado, 2),
        'costo_final' => number_format($costo_final, 2)
    ];
    
    $total_gastado += $costo_final;
}

echo json_encode([
    'exito' => true,
    'gastos' => $gastos,
    'total' => number_format($total_gastado, 2)
]);

$stmt->close();
$conexion->close();
?>
