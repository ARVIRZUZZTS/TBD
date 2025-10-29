<?php
include 'conexion.php';

header('Content-Type: application/json');

// Verificar si hay errores de conexión
if ($conexion->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $conexion->connect_error]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Leer el input JSON
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['success' => false, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
        exit;
    }
    
    if (isset($data['id_periodo_curso']) && isset($data['titulo']) && isset($data['orden'])) {
        $id_periodo_curso = intval($data['id_periodo_curso']);
        $titulo = trim($data['titulo']);
        $orden = intval($data['orden']);
        
        if (empty($titulo)) {
            echo json_encode(['success' => false, 'message' => 'El título del módulo no puede estar vacío']);
            exit;
        }
        
        if ($orden <= 0) {
            echo json_encode(['success' => false, 'message' => 'El orden debe ser un número positivo']);
            exit;
        }
        
        // Verificar si ya existe un módulo con el mismo orden en el mismo periodo_curso
        $checkSql = "SELECT id_modulo FROM modulo WHERE id_periodo_curso = ? AND orden = ?";
        $checkStmt = $conexion->prepare($checkSql);
        
        if (!$checkStmt) {
            echo json_encode(['success' => false, 'message' => 'Error en la consulta: ' . $conexion->error]);
            exit;
        }
        
        $checkStmt->bind_param("ii", $id_periodo_curso, $orden);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Ya existe un módulo con ese orden en este curso']);
            $checkStmt->close();
            exit;
        }
        
        $checkStmt->close();
        
        // Insertar nuevo módulo
        $sql = "INSERT INTO modulo (id_periodo_curso, titulo, orden) VALUES (?, ?, ?)";
        $stmt = $conexion->prepare($sql);
        
        if (!$stmt) {
            echo json_encode(['success' => false, 'message' => 'Error en la consulta: ' . $conexion->error]);
            exit;
        }
        
        $stmt->bind_param("isi", $id_periodo_curso, $titulo, $orden);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Módulo creado exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al crear el módulo: ' . $stmt->error]);
        }
        
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conexion->close();
?>