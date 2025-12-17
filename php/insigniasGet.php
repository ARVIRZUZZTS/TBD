<?php
header("Content-Type: application/json");
include 'conexion.php';

$id_estudiante = $_GET['id_estudiante'] ?? '';

if (empty($id_estudiante)) {
    echo json_encode(['exito' => false, 'mensaje' => 'ID de estudiante no proporcionado']);
    exit;
}

try {
    // Obtener todas las insignias y verificar cuáles tiene el estudiante
    $sql = "SELECT 
                i.id_insignia, 
                i.nombre, 
                i.descripcion, 
                i.puntos_premio,
                CASE WHEN ie.id_estudiante IS NOT NULL THEN 1 ELSE 0 END as posee
            FROM insignias i
            LEFT JOIN insignias_estudiantes ie ON i.id_insignia = ie.id_insignia AND ie.id_estudiante = ?
            ORDER BY i.puntos_premio ASC"; // Ordenar por 'rareza' o puntos
    
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id_estudiante);
    $stmt->execute();
    $result = $stmt->get_result();

    $insignias = [];
    while ($row = $result->fetch_assoc()) {
        $insignias[] = [
            'id' => $row['id_insignia'],
            'nombre' => $row['nombre'],
            'descripcion' => $row['descripcion'],
            'puntos' => $row['puntos_premio'],
            'posee' => (bool)$row['posee']
        ];
    }

    echo json_encode([
        'exito' => true,
        'insignias' => $insignias
    ]);

} catch (Exception $e) {
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()]);
}

$conexion->close();
?>
