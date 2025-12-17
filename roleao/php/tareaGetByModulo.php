<?php
// php/tareaGetByModulo.php
include 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['id_modulo'])) {
        $id_modulo = $data['id_modulo'];
        
        $sql = "SELECT t.*, 
                       aa.id_archivo, aa.titulo as archivo_nombre, aa.tipo as archivo_tipo, 
                       aa.ruta_archivo as archivo_url
                FROM tarea t
                LEFT JOIN archivos_publicacion ap ON CONCAT('TA-', t.id_tarea) = ap.id_publicacion
                LEFT JOIN archivos_adjuntos aa ON ap.id_archivo = aa.id_archivo
                WHERE t.id_modulo = ?
                ORDER BY t.fecha_emision DESC, t.hora_emision DESC";
        
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