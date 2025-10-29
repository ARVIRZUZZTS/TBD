<?php
include 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['id_modulo']) && isset($data['titulo'])) {
        $id_modulo = $data['id_modulo'];
        $titulo = trim($data['titulo']);
        
        if (empty($titulo)) {
            echo json_encode(['success' => false, 'message' => 'El título del tema no puede estar vacío']);
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
        
        // Insertar nuevo tema
        $sql = "INSERT INTO temas (id_modulo, titulo) VALUES (?, ?)";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("is", $id_modulo, $titulo);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Tema creado exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al crear el tema: ' . $stmt->error]);
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