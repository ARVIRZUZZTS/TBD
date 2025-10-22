<?php
include 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['nombreArea'])) {
        $nombreArea = trim($data['nombreArea']);
        
        if (empty($nombreArea)) {
            echo json_encode(['exito' => false, 'mensaje' => 'El nombre del área no puede estar vacío']);
            exit;
        }
        
        // Verificar si el área ya existe
        $checkSql = "SELECT id_area FROM area WHERE nombre_area = ?";
        $checkStmt = $conexion->prepare($checkSql);
        $checkStmt->bind_param("s", $nombreArea);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            echo json_encode(['exito' => false, 'mensaje' => 'El área ya existe']);
            exit;
        }
        
        // Insertar nueva área
        $sql = "INSERT INTO area (nombre_area) VALUES (?)";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("s", $nombreArea);
        
        if ($stmt->execute()) {
            echo json_encode(['exito' => true, 'mensaje' => 'Área creada exitosamente']);
        } else {
            echo json_encode(['exito' => false, 'mensaje' => 'Error al crear el área: ' . $stmt->error]);
        }
        
        $stmt->close();
        $checkStmt->close();
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'Datos incompletos']);
    }
} else {
    echo json_encode(['exito' => false, 'mensaje' => 'Método no permitido']);
}

$conexion->close();
?>