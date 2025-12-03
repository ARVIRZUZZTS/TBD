<?php
include 'conexion.php';

$id_estudiante = $_GET['id_estudiante'] ?? null;

if (!$id_estudiante) {
    echo json_encode(['exito' => false, 'mensaje' => 'ID estudiante requerido']);
    exit;
}

// Obtener todas las paletas (tipo_cosmetico = 1)
$sql = "SELECT * FROM cosmetico WHERE id_tipo_cosmetico = 1";
$result = $conexion->query($sql);

$paletas = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Verificar si el estudiante ya compró esta paleta
        // Las recompensas canjeadas se guardan con el ID del cosmético en la columna 'recompensa'
        // Pero ojo, en la tabla recompensa_canjeada, 'recompensa' es varchar(11).
        // Para cosméticos, asumiremos que se guarda como 'RC-{id}' o simplemente el ID.
        // Revisando el trigger 'resta_recompensa_canjeada' en tbd.sql:
        // IF LEFT(NEW.recompensa, 3) = 'RC-' THEN ...
        // Entonces el ID debe ser 'RC-' + id_cosmetico.
        
        $id_recompensa = 'RC-' . $row['id_cosmetico'];
        $checkSql = "SELECT * FROM recompensa_canjeada 
                     WHERE id_estudiante = $id_estudiante 
                     AND recompensa = '$id_recompensa'";
        $checkResult = $conexion->query($checkSql);
        
        $row['comprado'] = ($checkResult->num_rows > 0);
        $paletas[] = $row;
    }
}

// Obtener paleta activa
$sqlActiva = "SELECT id_paleta_activa FROM usuario WHERE id_user = $id_estudiante";
$resultActiva = $conexion->query($sqlActiva);
$paletaActivaId = null;
if ($resultActiva->num_rows > 0) {
    $rowActiva = $resultActiva->fetch_assoc();
    $paletaActivaId = $rowActiva['id_paleta_activa'];
}

echo json_encode([
    'exito' => true, 
    'paletas' => $paletas,
    'paleta_activa' => $paletaActivaId
]);
?>
