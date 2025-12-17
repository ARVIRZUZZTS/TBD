<?php
include 'conexion.php';

$id_estudiante = 33; // Ema
$id_paleta = 2; // Noche (100 pts)

echo "<h2>Verification Script</h2>";

// 1. Give points
$conexion->query("UPDATE puntos SET saldo_actual = 1000 WHERE id_user = $id_estudiante");
echo "Points updated to 1000.<br>";

// 2. Simulate Purchase (POST to canjearPaleta.php)
// We can't easily do a POST request to another local PHP file without curl or include.
// Let's just include the logic or use curl if enabled. 
// Simpler: just run the logic here.

echo "<h3>Buying Palette ID $id_paleta...</h3>";
// Check if already owned
$check = $conexion->query("SELECT * FROM recompensa_canjeada WHERE id_estudiante = $id_estudiante AND recompensa = 'RC-$id_paleta'");
if ($check->num_rows > 0) {
    $conexion->query("DELETE FROM recompensa_canjeada WHERE id_estudiante = $id_estudiante AND recompensa = 'RC-$id_paleta'");
    echo "Removed existing ownership for test.<br>";
}

// Execute purchase logic
$costo = 100;
$recompensa_code = 'RC-' . $id_paleta;
$fecha = date('Y-m-d');
$hora = date('H:i:s');

$sqlInsert = "INSERT INTO recompensa_canjeada (recompensa, id_estudiante, fecha_recompensa, hora_recompensa) 
              VALUES ('$recompensa_code', $id_estudiante, '$fecha', '$hora')";

if ($conexion->query($sqlInsert) === TRUE) {
    echo "Purchase successful (Trigger should have fired).<br>";
} else {
    echo "Purchase failed: " . $conexion->error . "<br>";
}

// 3. Check Points
$res = $conexion->query("SELECT saldo_actual, puntos_gastados FROM puntos WHERE id_user = $id_estudiante");
$row = $res->fetch_assoc();
echo "Current Balance: " . $row['saldo_actual'] . " (Expected 900)<br>";
echo "Points Spent: " . $row['puntos_gastados'] . "<br>";

// 4. Activate Palette
echo "<h3>Activating Palette...</h3>";
$sqlActivate = "UPDATE usuario SET id_paleta_activa = $id_paleta WHERE id_user = $id_estudiante";
if ($conexion->query($sqlActivate) === TRUE) {
    echo "Activation successful.<br>";
} else {
    echo "Activation failed.<br>";
}

// 5. Check Active Palette
$resActive = $conexion->query("SELECT id_paleta_activa FROM usuario WHERE id_user = $id_estudiante");
$rowActive = $resActive->fetch_assoc();
echo "Active Palette ID: " . $rowActive['id_paleta_activa'] . " (Expected $id_paleta)<br>";

?>
