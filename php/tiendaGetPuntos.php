<?php
header("Content-Type: application/json");
error_reporting(0);
include 'conexion.php';

$id_estudiante = $_GET['id_estudiante'] ?? null;

if (!$id_estudiante) {
    echo json_encode(["exito" => false, "mensaje" => "Falta id_estudiante"]);
    exit;
}

try {
    $sql = "SELECT saldo_actual FROM puntos WHERE id_user = ?";
    $stmt = $conexion->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error en la consulta: " . $conexion->error);
    }
    
    $stmt->bind_param("i", $id_estudiante);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $puntos = $result->fetch_assoc();
        echo json_encode([
            "exito" => true,
            "puntos_estudiante" => $puntos['saldo_actual']
        ]);
    } else {
        echo json_encode([
            "exito" => true,
            "puntos_estudiante" => 0
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        "exito" => false, 
        "mensaje" => "Error: " . $e->getMessage()
    ]);
}

$conexion->close();
?>