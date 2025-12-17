<?php
include 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $required_fields = ['titulo', 'duracion', 'id_area', 'id_grado', 'id_categoria', 'modalidad', 'inicio_gestion', 'fin_gestion'];
    
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            echo json_encode(['exito' => false, 'mensaje' => 'Todos los campos son obligatorios']);
            exit;
        }
    }
    
    $titulo = trim($data['titulo']);
    $duracion = intval($data['duracion']);
    $id_area = intval($data['id_area']);
    $id_grado = intval($data['id_grado']);
    $id_categoria = intval($data['id_categoria']);
    $modalidad = $data['modalidad'];
    $inicio_gestion = $data['inicio_gestion'];
    $fin_gestion = $data['fin_gestion'];
    
    // Validar que la fecha de fin sea mayor a la de inicio
    if (strtotime($fin_gestion) <= strtotime($inicio_gestion)) {
        echo json_encode(['exito' => false, 'mensaje' => 'La fecha de fin debe ser posterior a la fecha de inicio']);
        exit;
    }
    
    // Insertar nuevo curso
    $sql = "INSERT INTO curso (titulo, duracion, id_area, id_grado, id_categoria, modalidad, inicio_gestion, fin_gestion) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("siiissss", $titulo, $duracion, $id_area, $id_grado, $id_categoria, $modalidad, $inicio_gestion, $fin_gestion);
    
    if ($stmt->execute()) {
        echo json_encode(['exito' => true, 'mensaje' => 'Curso creado exitosamente']);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'Error al crear el curso: ' . $stmt->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['exito' => false, 'mensaje' => 'Método no permitido']);
}

$conexion->close();
?>