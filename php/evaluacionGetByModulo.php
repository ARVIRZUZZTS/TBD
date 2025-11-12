<?php
include 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['id_modulo'])) {
        $id_modulo = $data['id_modulo'];
        
        $sql = "SELECT e.id_evaluacion, e.id_modulo, e.titulo, e.descripcion, 
                       e.hora_emision, e.fecha_emision, e.hora_inicio, e.fecha_inicio, 
                       e.hora_entrega, e.fecha_entrega, e.deskpoints,
                       aa.titulo as archivo_nombre, 
                       aa.ruta_archivo as archivo_url, 
                       aa.tipo as archivo_tipo
                FROM evaluacion e 
                LEFT JOIN archivos_publicacion ap ON e.id_evaluacion = ap.id_publicacion 
                LEFT JOIN archivos_adjuntos aa ON ap.id_archivo = aa.id_archivo 
                WHERE e.id_modulo = ? 
                ORDER BY e.fecha_inicio DESC, e.hora_inicio DESC";
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