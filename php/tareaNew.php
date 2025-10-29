<?php
include 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['id_modulo']) && isset($data['titulo']) && 
        isset($data['fecha_emision']) && isset($data['hora_emision']) &&
        isset($data['fecha_entrega']) && isset($data['hora_entrega'])) {
        
        $id_modulo = $data['id_modulo'];
        $titulo = trim($data['titulo']);
        $descripcion = isset($data['descripcion']) ? trim($data['descripcion']) : '';
        $fecha_emision = $data['fecha_emision'];
        $hora_emision = $data['hora_emision'];
        $fecha_entrega = $data['fecha_entrega'];
        $hora_entrega = $data['hora_entrega'];
        
        if (empty($titulo)) {
            echo json_encode(['success' => false, 'message' => 'El título de la tarea no puede estar vacío']);
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
        
        // Insertar nueva tarea
        $sql = "INSERT INTO tarea (id_modulo, titulo, descripcion, fecha_emision, hora_emision, fecha_entrega, hora_entrega) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("issssss", $id_modulo, $titulo, $descripcion, $fecha_emision, $hora_emision, $fecha_entrega, $hora_entrega);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Tarea creada exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al crear la tarea: ' . $stmt->error]);
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