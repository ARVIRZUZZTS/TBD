<?php
include 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['id_modulo']) && isset($data['titulo']) && 
        isset($data['fecha_emision']) && isset($data['hora_emision']) &&
        isset($data['fecha_inicio']) && isset($data['hora_inicio']) &&
        isset($data['fecha_entrega']) && isset($data['hora_entrega']) &&
        isset($data['deskpoints'])) {
        
        $id_modulo = $data['id_modulo'];
        $titulo = trim($data['titulo']);
        $descripcion = isset($data['descripcion']) ? trim($data['descripcion']) : '';
        $fecha_emision = $data['fecha_emision'];
        $hora_emision = $data['hora_emision'];
        $fecha_inicio = $data['fecha_inicio'];
        $hora_inicio = $data['hora_inicio'];
        $fecha_entrega = $data['fecha_entrega'];
        $hora_entrega = $data['hora_entrega'];
        $deskpoints = intval($data['deskpoints']);
        
        if (empty($titulo)) {
            echo json_encode(['success' => false, 'message' => 'El título de la evaluación no puede estar vacío']);
            exit;
        }
        
        if ($deskpoints <= 0) {
            echo json_encode(['success' => false, 'message' => 'Los puntos deben ser un número positivo']);
            exit;
        }
        
        // Verificar si el módulo existe
        $checkModuloSql = "SELECT id_modulo FROM modulo WHERE id_modulo = ?";
        $checkModuloStmt = $conexion->prepare($checkModuloSql);
        $checkModuloStmt->bind_param("i", $id_modulo);
        $checkModuloStmt->execute();
        $checkModuloResult = $checkModuloStmt->get_result();
        
        if ($checkModuloResult->num_rows === 0) {
            echo json_encode(['success' => false, 'message' => 'El módulo no existe']);
            exit;
        }
        
        // Insertar nueva evaluación
        $sql = "INSERT INTO evaluacion (id_modulo, titulo, descripcion, fecha_emision, hora_emision, fecha_inicio, hora_inicio, fecha_entrega, hora_entrega, deskpoints) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("issssssssi", $id_modulo, $titulo, $descripcion, $fecha_emision, $hora_emision, $fecha_inicio, $hora_inicio, $fecha_entrega, $hora_entrega, $deskpoints);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Evaluación creada exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al crear la evaluación: ' . $stmt->error]);
        }
        
        $stmt->close();
        $checkModuloStmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conexion->close();
?>