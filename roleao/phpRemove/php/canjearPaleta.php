<?php
include 'conexion.php';

$id_estudiante = $_POST['id_estudiante'] ?? null;
$id_cosmetico = $_POST['id_cosmetico'] ?? null;

if (!$id_estudiante || !$id_cosmetico) {
    echo json_encode(['exito' => false, 'mensaje' => 'Datos incompletos']);
    exit;
}

// Verificar puntos suficientes
$recompensa_code = 'RC-' . $id_cosmetico;

// Obtener costo
$sqlCosto = "SELECT costo_canje FROM cosmetico WHERE id_cosmetico = $id_cosmetico";
$resultCosto = $conexion->query($sqlCosto);

if ($resultCosto->num_rows == 0) {
    echo json_encode(['exito' => false, 'mensaje' => 'Cosmético no encontrado']);
    exit;
}

$rowCosto = $resultCosto->fetch_assoc();
$costo = $rowCosto['costo_canje'];

// Verificar saldo
$sqlSaldo = "SELECT saldo_actual FROM puntos WHERE id_user = $id_estudiante";
$resultSaldo = $conexion->query($sqlSaldo);
$rowSaldo = $resultSaldo->fetch_assoc();

if ($rowSaldo['saldo_actual'] < $costo) {
    echo json_encode(['exito' => false, 'mensaje' => 'Puntos insuficientes']);
    exit;
}

// Insertar en recompensa_canjeada
// El trigger se encargará de restar los puntos
$fecha = date('Y-m-d');
$hora = date('H:i:s');

$sqlInsert = "INSERT INTO recompensa_canjeada (recompensa, id_estudiante, fecha_recompensa, hora_recompensa) 
              VALUES ('$recompensa_code', $id_estudiante, '$fecha', '$hora')";

if ($conexion->query($sqlInsert) === TRUE) {
    echo json_encode(['exito' => true, 'mensaje' => 'Compra exitosa']);
} else {
    echo json_encode(['exito' => false, 'mensaje' => 'Error al procesar la compra: ' . $conexion->error]);
}
?>
