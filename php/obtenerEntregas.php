<?php
header("Content-Type: application/json");
include 'conexion.php';

$id_estudiante = $_GET['id_estudiante'] ?? '';

if (empty($id_estudiante)) {
    echo json_encode(['exito' => false, 'mensaje' => 'ID de estudiante no proporcionado']);
    exit;
}

try {
    // Obtener solo los id_publicacion que empiezan con TA- o EV-
    $sql = "SELECT id_publicacion FROM entregas WHERE id_user = ? AND (id_publicacion LIKE 'TA-%' OR id_publicacion LIKE 'EV-%')";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id_estudiante);
    $stmt->execute();
    $result = $stmt->get_result();

    $entregas = [];
    while ($row = $result->fetch_assoc()) {
        $entregas[] = $row['id_publicacion'];
    }

    echo json_encode([
        'exito' => true,
        'entregas' => $entregas
    ]);

} catch (Exception $e) {
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()]);
}

$conexion->close();
?>