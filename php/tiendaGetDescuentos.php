<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 0);

include 'conexion.php';

$id_estudiante = $_GET['id_estudiante'] ?? null;

if (!$id_estudiante) {
    echo json_encode(["exito" => false, "mensaje" => "Falta id_estudiante"]);
    exit;
}

try {
    $sql = "
        SELECT 
            d.id_descuento,  -- Este es VARCHAR
            d.id_periodo_curso,
            d.costo_canje,
            d.fecha_fin,
            d.porcentaje_descuento,
            pc.costo,
            c.titulo as nombre_curso,
            cat.nombre_categoria,
            a.nombre_area,
            CONCAT(u.nombre, ' ', u.apellido) as nombre_profesor
        FROM descuento d
        INNER JOIN periodo_curso pc ON d.id_periodo_curso = pc.id_periodo_curso
        INNER JOIN curso c ON pc.id_curso = c.id_curso
        INNER JOIN categoria cat ON c.id_categoria = cat.id_categoria
        INNER JOIN area a ON c.id_area = a.id_area
        INNER JOIN usuario u ON pc.id_maestro = u.id_user
        WHERE d.fecha_fin >= CURDATE() 
        AND pc.estado_periodo = 'Inscripciones'
        AND NOT EXISTS (
            SELECT 1 FROM recompensa_canjeada rc 
            WHERE rc.recompensa = d.id_descuento  -- Aquí coinciden VARCHAR con VARCHAR
            AND rc.id_estudiante = ?
        )
    ";

    $stmt = $conexion->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error preparando consulta: " . $conexion->error);
    }
    
    $stmt->bind_param("i", $id_estudiante);
    
    if (!$stmt->execute()) {
        throw new Exception("Error ejecutando consulta: " . $stmt->error);
    }
    
    $result = $stmt->get_result();

    $descuentos = [];
    while ($row = $result->fetch_assoc()) {
        $descuentos[] = $row;
    }

    echo json_encode([
        "exito" => true,
        "descuentos" => $descuentos
    ]);

} catch (Exception $e) {
    echo json_encode([
        "exito" => false,
        "mensaje" => "Error: " . $e->getMessage()
    ]);
}

$conexion->close();
?>