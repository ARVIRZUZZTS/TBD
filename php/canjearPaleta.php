<?php
header("Content-Type: application/json");
error_reporting(0); // Desactivar errores HTML

include 'conexion.php';

if (!$conexion) {
    echo json_encode(['exito' => false, 'mensaje' => 'Error de conexión a BD']);
    exit;
}

$id_estudiante = $_POST['id_estudiante'] ?? null;
$id_cosmetico = $_POST['id_cosmetico'] ?? null;

if (!$id_estudiante || !$id_cosmetico) {
    echo json_encode(['exito' => false, 'mensaje' => 'Datos incompletos']);
    exit;
}

try {
    // Verificar puntos suficientes
    $recompensa_code = 'RC-' . $id_cosmetico;

    // Obtener costo
    $sqlCosto = "SELECT costo_canje FROM cosmetico WHERE id_cosmetico = ?";
    $stmt = $conexion->prepare($sqlCosto);
    
    if (!$stmt) {
        throw new Exception('Error preparando consulta costo: ' . $conexion->error);
    }
    
    $stmt->bind_param("i", $id_cosmetico);
    $stmt->execute();
    $resultCosto = $stmt->get_result();

    if ($resultCosto->num_rows == 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'Cosmético no encontrado. ¿Ejecutaste el script fix_theme_purchase.sql?']);
        exit;
    }

    $rowCosto = $resultCosto->fetch_assoc();
    $costo = $rowCosto['costo_canje'];

    // Verificar saldo
    $sqlSaldo = "SELECT saldo_actual FROM puntos WHERE id_user = ?";
    $stmt = $conexion->prepare($sqlSaldo);
    
    if (!$stmt) {
        throw new Exception('Error preparando consulta saldo: ' . $conexion->error);
    }
    
    $stmt->bind_param("i", $id_estudiante);
    $stmt->execute();
    $resultSaldo = $stmt->get_result();
    
    if ($resultSaldo->num_rows == 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'No tienes registro de puntos']);
        exit;
    }
    
    $rowSaldo = $resultSaldo->fetch_assoc();

    if ($rowSaldo['saldo_actual'] < $costo) {
        echo json_encode(['exito' => false, 'mensaje' => 'Puntos insuficientes. Tienes ' . $rowSaldo['saldo_actual'] . ' pero necesitas ' . $costo]);
        exit;
    }

    // Verificar si ya tiene esta paleta
    $sqlCheck = "SELECT 1 FROM recompensa_canjeada WHERE id_estudiante = ? AND recompensa = ?";
    $stmt = $conexion->prepare($sqlCheck);
    $stmt->bind_param("is", $id_estudiante, $recompensa_code);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'Ya tienes esta paleta']);
        exit;
    }

    // Insertar en recompensa_canjeada
    // El trigger se encargará de restar los puntos
    $fecha = date('Y-m-d');
    $hora = date('H:i:s');

    $sqlInsert = "INSERT INTO recompensa_canjeada (recompensa, id_estudiante, fecha_recompensa, hora_recompensa) 
                  VALUES (?, ?, ?, ?)";
    $stmt = $conexion->prepare($sqlInsert);
    
    if (!$stmt) {
        throw new Exception('Error preparando inserción: ' . $conexion->error);
    }
    
    $stmt->bind_param("siss", $recompensa_code, $id_estudiante, $fecha, $hora);

    if ($stmt->execute()) {
        echo json_encode(['exito' => true, 'mensaje' => 'Compra exitosa']);
    } else {
        throw new Exception('Error al insertar: ' . $stmt->error);
    }
    
} catch (Exception $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
}

$conexion->close();
?>
