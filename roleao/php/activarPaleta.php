<?php
include 'conexion.php';

$id_estudiante = $_POST['id_estudiante'] ?? null;
$id_cosmetico = $_POST['id_cosmetico'] ?? null;

if (!$id_estudiante) {
    echo json_encode(['exito' => false, 'mensaje' => 'ID estudiante requerido']);
    exit;
}

// Si id_cosmetico es null o 0, desactivamos (volvemos al default)
if ($id_cosmetico == 0) {
    $id_cosmetico = "NULL";
}

$sql = "UPDATE usuario SET id_paleta_activa = $id_cosmetico WHERE id_user = $id_estudiante";

if ($conexion->query($sql) === TRUE) {
    // Obtener el valor (clase css) de la nueva paleta para devolverlo
    $clase = '';
    if ($id_cosmetico !== "NULL") {
        $sqlClase = "SELECT valor FROM cosmetico WHERE id_cosmetico = $id_cosmetico";
        $resultClase = $conexion->query($sqlClase);
        if ($resultClase->num_rows > 0) {
            $clase = $resultClase->fetch_assoc()['valor'];
        }
    }
    
    echo json_encode(['exito' => true, 'mensaje' => 'Paleta actualizada', 'clase' => $clase]);
} else {
    echo json_encode(['exito' => false, 'mensaje' => 'Error al actualizar: ' . $conexion->error]);
}
?>
