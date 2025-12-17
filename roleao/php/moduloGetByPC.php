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
    
    if (isset($data['id_periodo_curso'])) {
        $id_periodo_curso = intval($data['id_periodo_curso']);
        
        $sql = "SELECT id_modulo, id_periodo_curso, titulo, orden 
                FROM modulo 
                WHERE id_periodo_curso = ? 
                ORDER BY orden ASC";
        $stmt = $conexion->prepare($sql);
        
        if (!$stmt) {
            echo json_encode(['success' => false, 'message' => 'Error en la consulta: ' . $conexion->error]);
            exit;
        }
        
        $stmt->bind_param("i", $id_periodo_curso);
        
        if (!$stmt->execute()) {
            echo json_encode(['success' => false, 'message' => 'Error al ejecutar consulta: ' . $stmt->error]);
            $stmt->close();
            exit;
        }
        
        $result = $stmt->get_result();
        $modulos = [];
        
        while ($row = $result->fetch_assoc()) {
            $modulos[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'modulos' => $modulos
        ]);
        
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'ID de periodo curso no proporcionado']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conexion->close();
?>