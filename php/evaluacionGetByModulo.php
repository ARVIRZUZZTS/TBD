<?php
include 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['id_modulo'])) {
        $id_modulo = $data['id_modulo'];
        
        $sql = "SELECT id_evaluacion, id_modulo, titulo, descripcion, hora_emision, fecha_emision, hora_inicio, fecha_inicio, hora_entrega, fecha_entrega, deskpoints 
                FROM evaluacion 
                WHERE id_modulo = ? 
                ORDER BY fecha_inicio DESC, hora_inicio DESC";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $id_modulo);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $evaluaciones = [];
        while ($row = $result->fetch_assoc()) {
            $evaluaciones[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'evaluaciones' => $evaluaciones
        ]);
        
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'ID de módulo no proporcionado']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conexion->close();
?>