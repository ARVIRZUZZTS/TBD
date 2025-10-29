<?php
include 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['id_modulo'])) {
        $id_modulo = $data['id_modulo'];
        
        $sql = "SELECT id_tarea, id_modulo, titulo, descripcion, hora_emision, fecha_emision, hora_entrega, fecha_entrega 
                FROM tarea 
                WHERE id_modulo = ? 
                ORDER BY fecha_emision DESC, hora_emision DESC";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $id_modulo);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $tareas = [];
        while ($row = $result->fetch_assoc()) {
            $tareas[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'tareas' => $tareas
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