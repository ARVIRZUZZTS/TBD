<?php
include 'conexion.php';
header('Content-Type: application/json');

if (!isset($_GET['idPeriodoCurso'])) {
    echo json_encode(['exito' => false, 'mensaje' => 'Falta el parámetro idPeriodoCurso']);
    exit;
}

$idPeriodoCurso = intval($_GET['idPeriodoCurso']);

$sql = "
    SELECT pc.id_periodo_curso, pc.estado_periodo,
           c.id_curso, c.titulo,
           cat.nombre_categoria
    FROM PERIODO_CURSO pc
    INNER JOIN CURSO c ON pc.id_curso = c.id_curso
    LEFT JOIN CATEGORIA cat ON c.id_categoria = cat.id_categoria
    WHERE pc.id_periodo_curso = ?
    LIMIT 1
";

$stmt = $conexion->prepare($sql);
if (!$stmt) {
    echo json_encode(['exito' => false, 'mensaje' => 'Error en prepare', 'error' => $conexion->error]);
    exit;
}
$stmt->bind_param('i', $idPeriodoCurso);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $row = $result->fetch_assoc()) {
    $categoria = $row['nombre_categoria'] ?? '';
    $esCertificado = (strcasecmp(trim($categoria), 'Curso Certificado') === 0);

    echo json_encode([
        'exito' => true,
        'id_curso' => $row['id_curso'],
        'titulo' => $row['titulo'],
        'categoria' => $categoria,
        'esCertificado' => $esCertificado,
        'estado_periodo' => $row['estado_periodo']
    ]);
} else {
    echo json_encode(['exito' => false, 'mensaje' => 'No se encontró el curso asociado']);
}

$stmt->close();
$conexion->close();
?>
