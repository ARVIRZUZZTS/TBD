<?php
include 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['idCurso'])) {
        $idCurso = intval($data['idCurso']);
        
        // Verificar si el curso existe
        $checkSql = "SELECT id_curso FROM curso WHERE id_curso = ?";
        $checkStmt = $conexion->prepare($checkSql);
        $checkStmt->bind_param("i", $idCurso);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            echo json_encode(['success' => false, 'message' => 'El curso no existe']);
            exit;
        }
        
        // Eliminar curso
        $sql = "DELETE FROM curso WHERE id_curso = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $idCurso);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Curso eliminado exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar el curso: ' . $stmt->error]);
        }
        
        $stmt->close();
        $checkStmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'ID de curso no proporcionado']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conexion->close();
?>