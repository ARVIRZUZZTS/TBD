<?php
include 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['id_modulo'])) {
        $id_modulo = $data['id_modulo'];
        
        $sql = "SELECT t.id_tema, t.id_modulo, t.titulo, 
                       aa.titulo as archivo_nombre, 
                       aa.ruta_archivo as archivo_url, 
                       aa.tipo as archivo_tipo
                FROM temas t 
                LEFT JOIN archivos_publicacion ap ON t.id_tema = ap.id_publicacion 
                LEFT JOIN archivos_adjuntos aa ON ap.id_archivo = aa.id_archivo 
                WHERE t.id_modulo = ? 
                ORDER BY t.id_tema ASC";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $id_modulo);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $temas = [];
        while ($row = $result->fetch_assoc()) {
            $temas[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'temas' => $temas
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